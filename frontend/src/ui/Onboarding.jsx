import { useEffect, useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import Input from "./components/Input";
import ProgressIndicator from "./components/ProgressIndicator";

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const STEPS = ["intro", "consent", "first_name", "rhythm", "reason", "done"];

export default function Onboarding({ api, user, step, setStep, onReady }) {
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [rhythm, setRhythm] = useState(2);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setStatus("");
  }, [step]);

  const currentStepIndex = STEPS.indexOf(step);

  // Navigation locale entre les étapes (sans appel backend)
  const goToNextStep = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    }
  };

  const next = async () => {
    setIsLoading(true);
    // Transition locale immédiate
    setTimeout(() => {
      goToNextStep();
      setIsLoading(false);
    }, 300);
  };

  const submitConsent = async () => {
    await next();
  };

  const submitName = async () => {
    if (!firstName.trim()) {
      setStatus("Votre prénom nous aide à personnaliser l'accompagnement");
      return;
    }
    await next();
  };

  const submitRhythm = async (r) => {
    setRhythm(r);
    setIsLoading(true);
    setTimeout(() => {
      goToNextStep();
      setIsLoading(false);
    }, 300);
  };

  const finalize = async () => {
    setIsLoading(true);
    const profile = {
      id: user?.id || uid(),
      email: user?.email,
      first_name: firstName || "Ami",
      tone: rhythm === 1 ? "lent" : rhythm === 3 ? "enveloppant" : "neutre",
      rhythm: rhythm,
      active_module: "grief",
      onboarding_completed: true,
      // Motif d'entrée (facultatif) : premier ancrage du contexte de vie.
      // Réinjecté dès le message d'accueil pour personnaliser le 1er échange.
      // Respecte l'anti-hallucination : on n'enregistre QUE ce que la personne a écrit.
      initial_reason: reason.trim() || null,
      preferences: {
        rhythm: rhythm,
        tone: rhythm === 1 ? "lent" : rhythm === 3 ? "enveloppant" : "neutre",
      },
      consent: {
        accepted: true,
        version: "v1.0",
        date: new Date().toISOString().slice(0, 10),
        scope: ["text", "emotion_scoring"],
      },
      created_at: user?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Appeler onReady directement - la sauvegarde Supabase est gérée par App.jsx
    setIsLoading(false);
    onReady(profile);
  };

  return (
    <div className="fade-in">
      <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
        <Logo size={60} showText={true} />
      </div>

      {currentStepIndex >= 0 && currentStepIndex < STEPS.length - 1 && (
        <ProgressIndicator
          current={currentStepIndex}
          total={STEPS.length - 1}
        />
      )}

      {status && (
        <div
          style={{
            padding: "var(--space-md)",
            background: "var(--color-accent-info)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-lg)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          {status}
        </div>
      )}

      {step === "intro" && (
        <div className="slide-in">
          <h2
            style={{
              fontSize: "var(--font-size-2xl)",
              marginBottom: "var(--space-lg)",
            }}
          >
            Bienvenue dans un espace pour vous
          </h2>
          <p
            style={{
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-lg)",
              marginBottom: "var(--space-md)",
            }}
          >
            HELŌ est un compagnon thérapeutique conçu pour vous accompagner avec
            douceur. Ici, vous pouvez prendre le temps dont vous avez besoin. Il
            n'y a pas de jugement, pas de pression. Juste un espace sécurisant
            pour explorer ce que vous ressentez.
          </p>
          <p
            style={{
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-lg)",
              marginBottom: "var(--space-xl)",
            }}
          >
            Nous avançons ensemble, à votre rythme.
          </p>
          <Button onClick={() => next()} disabled={isLoading} size="lg">
            {isLoading ? "Chargement..." : "Continuer"}
          </Button>
        </div>
      )}

      {step === "consent" && (
        <div className="slide-in">
          <h2>Votre consentement</h2>
          <p
            style={{
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
            }}
          >
            Pour vous accompagner au mieux, HELŌ analyse vos messages de manière
            confidentielle. Vos données restent privées et ne sont jamais
            partagées.
          </p>
          <div
            style={{
              padding: "var(--space-lg)",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            <p>
              <strong>Ce que nous faisons :</strong>
            </p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
              }}
            >
              <li>
                Analyser vos messages pour comprendre votre état émotionnel
              </li>
              <li>Adapter nos réponses à vos besoins</li>
              <li>Garder vos données en sécurité</li>
            </ul>
            <p style={{ marginTop: "var(--space-md)" }}>
              <strong>Ce que nous ne faisons jamais :</strong>
            </p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
              }}
            >
              <li>Partager vos informations</li>
              <li>Vous juger</li>
              <li>Remplacer un professionnel de santé</li>
            </ul>
          </div>
          <Button onClick={submitConsent} disabled={isLoading}>
            {isLoading ? "Chargement..." : "J'accepte et je continue"}
          </Button>
        </div>
      )}

      {step === "first_name" && (
        <div className="slide-in">
          <h2>Comment puis-je vous appeler ?</h2>
          <p
            style={{
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
            }}
          >
            Votre prénom nous aide à personnaliser votre expérience. Vous pouvez
            utiliser un pseudonyme si vous préférez.
          </p>
          <Input
            label="Prénom ou pseudonyme"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Comment souhaitez-vous être appelé ?"
            helpText="Cela reste entre nous"
            required
          />
          <Button
            onClick={submitName}
            disabled={isLoading || !firstName.trim()}
          >
            {isLoading ? "Chargement..." : "Continuer"}
          </Button>
        </div>
      )}

      {step === "rhythm" && (
        <div className="slide-in">
          <h2>À quel rythme souhaitez-vous avancer ?</h2>
          <p
            style={{
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-xl)",
            }}
          >
            Choisissez le rythme qui vous convient. Vous pourrez le modifier à
            tout moment.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
          >
            <button
              onClick={() => submitRhythm(1)}
              disabled={isLoading}
              style={{
                padding: "var(--space-lg)",
                border:
                  rhythm === 1
                    ? "2px solid var(--color-primary)"
                    : "1.5px solid var(--color-accent-calm)",
                background:
                  rhythm === 1 ? "var(--color-surface-1)" : "transparent",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition-fast)",
              }}
            >
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  marginBottom: "var(--space-xs)",
                }}
              >
                Lent et progressif
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Des pauses fréquentes, beaucoup de douceur, on prend vraiment
                notre temps
              </div>
            </button>

            <button
              onClick={() => submitRhythm(2)}
              disabled={isLoading}
              style={{
                padding: "var(--space-lg)",
                border:
                  rhythm === 2
                    ? "2px solid var(--color-primary)"
                    : "1.5px solid var(--color-accent-calm)",
                background:
                  rhythm === 2 ? "var(--color-surface-1)" : "transparent",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition-fast)",
              }}
            >
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  marginBottom: "var(--space-xs)",
                }}
              >
                Équilibré
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Un rythme naturel, ni trop rapide ni trop lent
              </div>
            </button>

            <button
              onClick={() => submitRhythm(3)}
              disabled={isLoading}
              style={{
                padding: "var(--space-lg)",
                border:
                  rhythm === 3
                    ? "2px solid var(--color-primary)"
                    : "1.5px solid var(--color-accent-calm)",
                background:
                  rhythm === 3 ? "var(--color-surface-1)" : "transparent",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition-fast)",
              }}
            >
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  marginBottom: "var(--space-xs)",
                }}
              >
                Enveloppant et présent
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Plus de présence, plus d'accompagnement, plus de chaleur
              </div>
            </button>
          </div>
        </div>
      )}

      {step === "reason" && (
        <div className="slide-in">
          <h2>Qu'est-ce qui vous amène vers HELŌ ?</h2>
          <p
            style={{
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-xl)",
            }}
          >
            Si vous le souhaitez, vous pouvez dire quelques mots sur ce que vous
            traversez en ce moment. C'est une invitation, pas une obligation —
            vous pouvez aussi répondre plus tard, dans la conversation.
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ce que vous vivez, ce qui vous pèse, ce qui vous amène… avec vos mots."
            rows={4}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "var(--space-lg)",
              border: "1.5px solid var(--color-accent-calm)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-surface-1)",
              color: "var(--color-text-primary)",
              fontFamily: "inherit",
              fontSize: "var(--font-size-base)",
              lineHeight: "var(--line-height-relaxed)",
              resize: "vertical",
              transition: "border-color var(--transition-fast)",
              marginBottom: "var(--space-lg)",
            }}
          />

          <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "center" }}>
            <Button onClick={next} disabled={isLoading}>
              {isLoading ? "..." : "Continuer"}
            </Button>
            <button
              onClick={next}
              disabled={isLoading}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-tertiary)",
                cursor: "pointer",
                fontSize: "var(--font-size-sm)",
                textDecoration: "underline",
                padding: "var(--space-sm)",
              }}
            >
              Passer pour l'instant
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="slide-in">
          <h2>Bienvenue, {firstName}</h2>
          <p
            style={{
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
            }}
          >
            Votre espace est prêt. Prenez votre temps, respirez, et commençons
            quand vous le souhaitez.
          </p>
          <Button onClick={finalize} disabled={isLoading}>
            {isLoading ? "Ouverture..." : "Ouvrir mon espace"}
          </Button>
        </div>
      )}
    </div>
  );
}
