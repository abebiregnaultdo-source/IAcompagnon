import React, { useEffect, useState } from 'react';

const TRIAL_DURATION_DAYS = 14;

// Calcule l'état d'essai à partir de la date d'inscription (aucun backend requis).
// Tant qu'il n'y a pas d'endpoint d'abonnement, c'est la source de vérité.
function computeTrialFromCreatedAt(createdAt) {
  if (!createdAt) return { status: 'trial', days_remaining: TRIAL_DURATION_DAYS };
  const start = new Date(createdAt).getTime();
  if (isNaN(start)) return { status: 'trial', days_remaining: TRIAL_DURATION_DAYS };
  const elapsedDays = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
  const remaining = TRIAL_DURATION_DAYS - elapsedDays;
  if (remaining <= 0) return { status: 'expired', days_remaining: 0 };
  return { status: 'trial', days_remaining: remaining };
}

export default function SubscriptionBanner({ userId, createdAt }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchStatus();
  }, [userId, createdAt]);

  const fetchStatus = async () => {
    try {
      const r = await fetch(`https://helo-backend.onrender.com/api/subscription/status?user_id=${encodeURIComponent(userId)}`);
      if (!r.ok) {
        // Pas d'endpoint d'abonnement → on calcule depuis la date d'inscription.
        setSubscription(computeTrialFromCreatedAt(createdAt));
        return;
      }
      const data = await r.json();
      setSubscription(data);
    } catch (e) {
      console.error('Error fetching subscription:', e);
      // Fallback : calcul local depuis la date d'inscription.
      setSubscription(computeTrialFromCreatedAt(createdAt));
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) return null;

  if (subscription.status === 'trial') {
    const daysLeft = subscription.days_remaining;
    if (daysLeft <= 3) {
      return (
        <div className="subscription-banner trial-ending">
          <div className="banner-content">
            <span className="banner-icon">⏰</span>
            <div className="banner-text">
              <strong>Votre essai se termine dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong>
              <p>Choisissez votre formule pour continuer votre accompagnement</p>
            </div>
            <a href="/pricing" className="banner-button">Choisir ma formule</a>
          </div>
        </div>
      );
    }
    return (
      <div className="subscription-banner trial">
        <span className="banner-icon">✨</span>
        <span>Essai Premium gratuit - {daysLeft} jours restants</span>
      </div>
    );
  }

  if (subscription.status === 'expired') {
    return (
      <div className="subscription-banner expired">
        <div className="banner-content">
          <span className="banner-icon">🔒</span>
          <div className="banner-text">
            <strong>Votre essai est terminé</strong>
            <p>Votre compte est en lecture seule. Choisissez une formule pour reprendre.</p>
          </div>
          <a href="/pricing" className="banner-button">Voir les formules</a>
        </div>
      </div>
    );
  }

  const planNames = { basique: 'Basique', standard: 'Standard', premium: 'Premium' };
  return (
    <div className="subscription-banner active">
      <span className="banner-icon">✓</span>
      <span>Formule {planNames[subscription.plan]}</span>
    </div>
  );
}
