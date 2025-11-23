import { useEffect, useState } from "react";
import Button from "../components/Button";

export default function CreativeSpaceIntro({
  api,
  onOpenTool,
  onOpenPortfolio,
  onBack,
}) {
  const [presentation, setPresentation] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${api.base}/api/creative/presentation`);
        const data = await r.json();
        setPresentation(data);
      } catch (e) {
        console.error("Erreur chargement présentation", e);
      }
    };
    load();
  }, []);

  const tools = presentation?.presentation_globale?.outils || [
    {
      icone: "📖",
      nom: "Journal guidé - Adaptation intelligente aux émotions",
      description:
        "Questions guidées qui s'adaptent à votre contexte émotionnel",
      key: "journal",
    },
    {
      icone: "✍️",
      nom: "Poésie-thérapie - Assistance IA discrète",
      description:
        "Assistance IA pour vous aider à formuler des images poétiques",
      key: "poem",
    },
    {
      icone: "🎨",
      nom: "Coloriage thérapeutique - Mobile-friendly et intentionnel",
      description: "Méditation active et coloriage guidé, optimisé mobile",
      key: "coloring",
    },
    {
      icone: "🕯️",
      nom: "Rituels d'écriture - Pour les transitions importantes",
      description: "Ritualiser les moments importants par l'écriture",
      key: "ritual",
    },
  ];

  return (
    <div style={{ padding: "var(--space-xl)" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
        <h1
          style={{
            color: "var(--color-text-primary)",
            fontSize: "var(--font-size-2xl)",
          }}
        >
          Votre espace d'expression
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Différentes façons d'explorer et d'exprimer votre cheminement
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "var(--space-lg)",
        }}
      >
        {tools.map((t) => (
          <div
            key={t.nom}
            style={{
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-xl)",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "2.5rem", marginBottom: "var(--space-md)" }}
            >
              {t.icone}
            </div>
            <div
              style={{
                color: "var(--color-text-primary)",
                fontWeight: "var(--font-weight-medium)",
                marginBottom: "var(--space-xs)",
              }}
            >
              {t.nom}
            </div>
            <div
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
                marginBottom: "var(--space-md)",
              }}
            >
              {t.description}
            </div>
            <Button onClick={() => onOpenTool(t.key)}>Ouvrir</Button>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--color-surface-0)",
          padding: "var(--space-xl)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          textAlign: "center",
          marginTop: "var(--space-2xl)",
        }}
      >
        <h3
          style={{
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Votre portfolio créatif
        </h3>
        <p
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-md)",
          }}
        >
          Toutes vos créations sont sauvegardées ici. Vous pourrez les exporter
          et voir votre progression.
        </p>
        <Button variant="secondary" onClick={onOpenPortfolio}>
          Voir mon portfolio
        </Button>
      </div>
    </div>
  );
}
