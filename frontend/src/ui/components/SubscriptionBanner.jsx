import React, { useEffect, useState } from 'react';

export default function SubscriptionBanner({ userId }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchStatus();
  }, [userId]);

  const fetchStatus = async () => {
    try {
      const r = await fetch(`/api/subscription/status?user_id=${encodeURIComponent(userId)}`);
      const data = await r.json();
      setSubscription(data);
    } catch (e) {
      console.error('Error fetching subscription:', e);
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
