from datetime import datetime, timedelta
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session
from ..database import get_db
from ..models_sql import Subscription

router = APIRouter()

PLANS = {"basique", "standard", "premium"}


def _get_prices():
    return {
        'basique': os.getenv('STRIPE_PRICE_BASIQUE', 'price_basique_9_90'),
        'standard': os.getenv('STRIPE_PRICE_STANDARD', 'price_standard_19_90'),
        'premium': os.getenv('STRIPE_PRICE_PREMIUM', 'price_premium_29_90'),
    }


def _features_for(plan: str, status: str):
    if status == 'trial':
        return {
            "chat": True,
            "vocal": True,
            "avatar": True,
            "tipi_full": True,
            "history": "unlimited",
            "summaries": True,
            "greetings": True,
            "tools": True,
            "advanced_analytics": True,
            "export": True,
            "guided_paths": True,
        }
    if status == 'expired':
        return {
            "chat": False,
            "vocal": False,
            "avatar": False,
            "tipi_full": False,
            "history": "read_only",
            "summaries": False,
            "greetings": False,
            "tools": False,
            "advanced_analytics": False,
            "export": False,
            "guided_paths": False,
        }
    if plan == 'basique':
        return {
            "chat": False,
            "vocal": False,
            "avatar": False,
            "tipi_full": False,
            "history": "unlimited",
            "summaries": False,
            "greetings": False,
            "tools": True,
            "advanced_analytics": False,
            "export": False,
            "guided_paths": False,
        }
    if plan == 'standard':
        return {
            "chat": True,
            "vocal": True,
            "avatar": True,
            "tipi_full": True,
            "history": "unlimited",
            "summaries": True,
            "greetings": True,
            "tools": True,
            "advanced_analytics": False,
            "export": False,
            "guided_paths": False,
        }
    # premium
    return {
        "chat": True,
        "vocal": True,
        "avatar": True,
        "tipi_full": True,
        "history": "unlimited",
        "summaries": True,
        "greetings": True,
        "tools": True,
        "advanced_analytics": True,
        "export": True,
        "guided_paths": True,
    }


@router.get("/api/subscription/status")
async def get_subscription_status(user_id: str, db: Session = Depends(get_db)):
    sub: Subscription | None = (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .order_by(desc(Subscription.created_at))
        .first()
    )
    if not sub:
        trial_ends = datetime.utcnow() + timedelta(days=14)
        sub = Subscription(
            user_id=user_id,
            plan='premium',  # trial = premium complet
            status='trial',
            trial_ends_at=trial_ends,
            current_period_start=datetime.utcnow(),
            current_period_end=trial_ends,
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
    # Mise à jour si trial expiré
    if sub.status == 'trial' and sub.trial_ends_at and sub.trial_ends_at < datetime.utcnow():
        sub.status = 'expired'
        db.commit()
        db.refresh(sub)
    days_remaining = 0
    if sub.status == 'trial' and sub.trial_ends_at:
        days_remaining = max(0, (sub.trial_ends_at - datetime.utcnow()).days)
    return {
        'plan': sub.plan,
        'status': sub.status,
        'trial_ends_at': sub.trial_ends_at.isoformat() if sub.trial_ends_at else None,
        'current_period_end': sub.current_period_end.isoformat() if sub.current_period_end else None,
        'days_remaining': days_remaining,
        'features': _features_for(sub.plan, sub.status),
    }


@router.post("/api/subscription/checkout")
async def create_checkout_session(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    plan = body.get('plan')
    user_id = body.get('user_id')
    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")

    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    prices = _get_prices()

    # Récupérer dernière sub pour customer
    sub: Subscription | None = (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .order_by(desc(Subscription.created_at))
        .first()
    )
    customer_id = sub.stripe_customer_id if sub and sub.stripe_customer_id else None
    if not customer_id:
        customer = stripe.Customer.create(metadata={"user_id": user_id})
        customer_id = customer.id
        # Créer/mettre à jour un enregistrement pour stocker le customer_id
        if not sub:
            sub = Subscription(
                user_id=user_id,
                plan=plan,
                status='trial',
                trial_ends_at=datetime.utcnow() + timedelta(days=14),
                current_period_start=datetime.utcnow(),
                current_period_end=datetime.utcnow() + timedelta(days=14),
                stripe_customer_id=customer_id,
            )
            db.add(sub)
        else:
            sub.stripe_customer_id = customer_id
        db.commit()
        db.refresh(sub)

    success_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/pricing"

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=['card'],
        line_items=[{'price': prices[plan], 'quantity': 1}],
        mode='subscription',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": user_id, "plan": plan}
    )
    return {'checkout_url': session.url}


@router.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        plan = session.get('metadata', {}).get('plan')
        if user_id:
            sub: Subscription | None = (
                db.query(Subscription)
                .filter(Subscription.user_id == user_id)
                .order_by(desc(Subscription.created_at))
                .first()
            )
            if not sub:
                sub = Subscription(
                    user_id=user_id,
                    plan=plan or 'standard',
                    status='active',
                    trial_ends_at=None,
                    current_period_start=datetime.utcnow(),
                    current_period_end=datetime.utcnow() + timedelta(days=30),
                    stripe_customer_id=session.get('customer'),
                    stripe_subscription_id=session.get('subscription'),
                )
                db.add(sub)
            else:
                sub.plan = plan or sub.plan
                sub.status = 'active'
                sub.stripe_customer_id = session.get('customer')
                sub.stripe_subscription_id = session.get('subscription')
                sub.current_period_start = datetime.utcnow()
                sub.current_period_end = datetime.utcnow() + timedelta(days=30)
            db.commit()

    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        customer_id = subscription.get('customer')
        sub: Subscription | None = (
            db.query(Subscription)
            .filter(Subscription.stripe_customer_id == customer_id)
            .order_by(desc(Subscription.created_at))
            .first()
        )
        if sub:
            sub.status = subscription.get('status', sub.status)
            cpe = subscription.get('current_period_end')
            if cpe:
                sub.current_period_end = datetime.utcfromtimestamp(cpe)
            db.commit()

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        customer_id = subscription.get('customer')
        sub: Subscription | None = (
            db.query(Subscription)
            .filter(Subscription.stripe_customer_id == customer_id)
            .order_by(desc(Subscription.created_at))
            .first()
        )
        if sub:
            sub.status = 'canceled'
            sub.canceled_at = datetime.utcnow()
            db.commit()

    return JSONResponse({"status": "success"})
