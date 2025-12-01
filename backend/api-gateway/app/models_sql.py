from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Subscription(Base):
    __tablename__ = 'subscriptions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(128), nullable=False, index=True)
    plan = Column(String(20), nullable=False)  # 'basique', 'standard', 'premium'
    status = Column(String(20), nullable=False)  # 'trial', 'active', 'canceled', 'expired'
    trial_ends_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True, index=True)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    trial_ending_email_sent = Column(Boolean, default=False)

class FeatureUsage(Base):
    __tablename__ = 'feature_usage'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(128), nullable=False, index=True)
    feature = Column(String(50), nullable=False)  # 'chat', 'vocal', 'tools'
    usage_count = Column(Integer, default=0)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
