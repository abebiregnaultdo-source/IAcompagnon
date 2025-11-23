import { useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";

/**
 * Page Offres et Abonnement HELŌ
 * Design sobre et professionnel - PAS commercial
 */
export default function Pricing({ onBack, user }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: "free",
      name: "Gratuit",
      price: "0€",
      period: "toujours",
      description: "Pour commencer votre parcours",
      features: [
        "Conversations avec Helō (5/jour)",
        "Journal thérapeutique guidé",
        "Radar émotionnel",
        "Espace créatif de base",
        "Sauvegarde de votre parcours",
      ],
      cta: "Déjà inclus",
      disabled: true,
      highlight: false,
    },
    {
      id: "complete",
      name: "Accompagnement complet",
      price: "24€",
      period: "par mois",
      description: "Pour un soutien approfondi",
      features: [
        "Conversations illimitées avec Helō",
        "Tous les outils créatifs avancés",
        "Sessions vocales (disponible prochainement)",
        "Dashboard de progression détaillé",
        "Export de vos créations",
        "Protocoles thérapeutiques avancés",
        "Accès prioritaire aux nouvelles fonctionnalités",
      ],
      cta: "Choisir cette offre",
      disabled: false,
      highlight: true,
    },
  ];

  const handleSelectPlan = (planId) => {
    if (planId === "free") return;
    setSelectedPlan(planId);
    // TODO: Rediriger vers le système de paiement
    console.log("Plan sélectionné:", planId);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: "var(--space-xl)",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          marginBottom: "var(--space-2xl)",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-primary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "var(--space-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}
          >
            ← Retour
          </button>
        )}

        <div style={{ textAlign: "center", marginBottom: "var(--space-md)" }}>
          <Logo size={40} showText={false} />
        </div>

        <h1
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            textAlign: "center",
            marginBottom: "var(--space-sm)",
          }}
        >
          Votre accompagnement avec Helō
        </h1>

        <p
          style={{
            fontSize: "var(--font-size-md)",
            color: "var(--color-text-secondary)",
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Un soutien adapté à chaque étape de votre parcours
        </p>
      </div>

      {/* Plans */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-xl)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: plan.highlight
                ? "var(--color-surface-2)"
                : "var(--color-surface-1)",
              border: plan.highlight
                ? "2px solid var(--color-primary)"
                : "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-xl)",
              position: "relative",
              transition:
                "transform var(--transition-normal), box-shadow var(--transition-normal)",
              transform: plan.highlight ? "scale(1.02)" : "scale(1)",
            }}
          >
            {plan.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--color-primary)",
                  color: "white",
                  padding: "var(--space-xs) var(--space-md)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Recommandé
              </div>
            )}

            <h3
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-xs)",
              }}
            >
              {plan.name}
            </h3>

            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-lg)",
              }}
            >
              {plan.description}
            </p>

            <div
              style={{
                marginBottom: "var(--space-xl)",
                paddingBottom: "var(--space-lg)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-3xl)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-primary)",
                  marginBottom: "var(--space-xs)",
                }}
              >
                {plan.price}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                {plan.period}
              </div>
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                marginBottom: "var(--space-xl)",
              }}
            >
              {plan.features.map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-sm)",
                    marginBottom: "var(--space-md)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-secondary)",
                    lineHeight: "var(--line-height-relaxed)",
                  }}
                >
                  <span
                    style={{ color: "var(--color-primary)", flexShrink: 0 }}
                  >
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={plan.disabled}
              style={{
                width: "100%",
                background: plan.highlight
                  ? "var(--color-primary)"
                  : "var(--color-surface-2)",
                color: plan.highlight ? "white" : "var(--color-text-primary)",
                border: plan.highlight
                  ? "none"
                  : "1px solid var(--color-border)",
              }}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* Essai gratuit - Bouton unique en dessous */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
          padding: "var(--space-xl)",
          background: "var(--color-primary-light)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        <h3
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Essayez l'accompagnement complet
        </h3>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-lg)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Testez toutes les fonctionnalités pendant 7 jours, sans engagement.
          Annulez à tout moment.
        </p>
        <Button
          onClick={() => handleSelectPlan("complete-trial")}
          style={{
            background: "var(--color-primary)",
            color: "white",
          }}
        >
          Commencer l'essai gratuit (7 jours)
        </Button>
      </div>

      {/* Disclaimer médical */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "var(--space-lg)",
          background: "var(--color-surface-2)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <p
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            lineHeight: "var(--line-height-relaxed)",
            margin: 0,
          }}
        >
          ⚠️ Helō est un outil d'accompagnement numérique et ne se substitue pas
          à un suivi médical ou psychologique professionnel. En cas de détresse
          sévère ou d'urgence, contactez immédiatement le <strong>3114</strong>{" "}
          (SOS Suicide) ou le <strong>15</strong> (SAMU).
        </p>
      </div>

      {/* Informations complémentaires */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-md)",
          }}
        >
          Pas de frais cachés • Résiliation facile • Vos données restent privées
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-lg)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-tertiary)",
          }}
        >
          <button
            onClick={() => window.open("/cgv", "_blank")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            CGV
          </button>
          <button
            onClick={() => window.open("/mentions-legales", "_blank")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Mentions légales
          </button>
          <button
            onClick={() => window.open("/confidentialite", "_blank")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Confidentialité
          </button>
        </div>
      </div>
    </div>
  );
}
