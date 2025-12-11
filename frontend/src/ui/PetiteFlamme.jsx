import { useState } from "react";
import Button from "./components/Button";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

/**
 * Page dédiée au poème "Petite flamme"
 * Témoignage personnel de la fondatrice
 */
export default function PetiteFlamme({ onBack }) {
  const device = useDeviceDetection();
  const [showFullPoem, setShowFullPoem] = useState(false);

  const poemPartOne = [
    {
      lines: [
        "J'ai senti ta présence avant que le monde t'appelle,",
        "petite flamme, fragile étincelle.",
        "Sous ma peau, ton souffle a grandi,",
        "et mon cœur battait au rythme du tien — sans répit.",
      ],
    },
    {
      lines: [
        "À l'écran, tu bougeais, si vif, si certain,",
        "une vie minuscule qui disait \"je suis là\",",
        "sans mot, sans refrain.",
        "Et ce jour-là, ton poing levé, minuscule et obstiné,",
        "m'a fait rire — toi, déjà, tu voulais exister.",
      ],
    },
    {
      lines: [
        "Puis vint ce jour d'octobre,",
        "où la peur s'est mêlée au sang.",
        "Les douleurs étaient là, espacées,",
        "tantôt vives, tantôt discrètes.",
        "Je n'ai compris que bien plus tard",
        "que c'étaient des contractions.",
      ],
    },
    {
      lines: [
        "L'hémorragie a parlé avant les mots.",
        "Les minutes sont devenues floues —",
        "des visages, des voix,",
        "la lumière trop blanche du bloc.",
        "Je t'ai aperçu, un instant,",
        "dans ta poche fragile, entre deux gestes pressés.",
        "Et puis plus rien.",
      ],
    },
    {
      lines: [
        "Le silence, le froid, la salle endormie.",
        "Quand j'ai rouvert les yeux, tu n'étais plus là.",
      ],
    },
  ];

  const poemPartTwo = [
    {
      lines: [
        "Depuis, parfois, ma main cherche ton corps,",
        "par réflexe, sur mon ventre vide.",
        "Et l'espace d'un instant, j'oublie.",
        "Je crois te sentir encore,",
        "avant que la mémoire ne revienne,",
        "comme une vague.",
      ],
    },
    {
      lines: [
        "Pourtant, tu restes.",
        "Dans mes fibres, dans mon souffle, dans mes nuits.",
        "Tu n'as pas disparu —",
        "tu t'es simplement changé en trace,",
        "cette trace invisible sous ma peau,",
        "dont moi seule sais qu'elle existe,",
        "en souvenir que je caresse sans le toucher.",
      ],
    },
    {
      lines: [
        "Et si je pleure parfois,",
        "c'est pour ne pas oublier",
        "que tu as existé.",
      ],
    },
    {
      lines: [
        "De toi, il ne reste rien à voir,",
        "et pourtant, tout me parle encore de toi.",
      ],
    },
    {
      lines: [
        "Ce texte n'est pas un adieu.",
        "C'est la preuve qu'on peut aimer un souffle,",
        "et continuer à respirer.",
      ],
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf8f3 0%, #f5f0e8 100%)",
        padding: device.isMobile ? "var(--space-lg)" : "var(--space-2xl)",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Bouton retour */}
        <button
          onClick={onBack}
          style={{
            marginBottom: "var(--space-xl)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-primary)",
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            padding: "var(--space-sm) var(--space-md)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            fontWeight: "var(--font-weight-medium)",
            transition: "var(--transition-fast)",
          }}
        >
          ← Retour
        </button>

        {/* Introduction */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--radius-xl)",
            padding: device.isMobile ? "var(--space-xl)" : "var(--space-2xl)",
            marginBottom: "var(--space-xl)",
            border: "1px solid rgba(180, 140, 80, 0.2)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-primary)",
              fontWeight: "var(--font-weight-medium)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "var(--space-md)",
              textAlign: "center",
            }}
          >
            Témoignage de la fondatrice
          </p>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: device.isMobile ? "28px" : "36px",
              fontWeight: "400",
              color: "#2a2520",
              textAlign: "center",
              marginBottom: "var(--space-lg)",
              letterSpacing: "0.05em",
            }}
          >
            Petite flamme
          </h1>

          <div
            style={{
              width: "60px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #c9a050, transparent)",
              margin: "0 auto var(--space-xl)",
            }}
          />

          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
              textAlign: "center",
              fontStyle: "italic",
              maxWidth: "600px",
              margin: "0 auto var(--space-lg)",
            }}
          >
            Ce poème est né d'une perte que le monde n'a pas vue.
            Il est dédié à tous ceux qui portent un deuil invisible —
            celui d'un enfant parti trop tôt, d'un amour qui n'a pas eu le temps,
            d'un espoir qui s'est éteint.
          </p>

          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-tertiary)",
              textAlign: "center",
              marginBottom: "var(--space-md)",
            }}
          >
            C'est aussi la raison pour laquelle HELO existe.
          </p>
        </div>

        {/* Le poème */}
        <div
          style={{
            background: "#faf8f3",
            borderRadius: "var(--radius-xl)",
            padding: device.isMobile ? "var(--space-xl)" : "var(--space-2xl)",
            border: "1px solid rgba(180, 140, 80, 0.3)",
            position: "relative",
          }}
        >
          {/* Décoration gauche */}
          <div
            style={{
              position: "absolute",
              left: "15px",
              top: "60px",
              bottom: "60px",
              width: "2px",
              background: "linear-gradient(to bottom, transparent, rgba(180,140,80,0.3) 20%, rgba(180,140,80,0.3) 80%, transparent)",
            }}
          />

          {/* Décoration droite */}
          <div
            style={{
              position: "absolute",
              right: "15px",
              top: "60px",
              bottom: "60px",
              width: "2px",
              background: "linear-gradient(to bottom, transparent, rgba(180,140,80,0.3) 20%, rgba(180,140,80,0.3) 80%, transparent)",
            }}
          />

          {/* Contenu du poème */}
          <div
            style={{
              display: device.isMobile ? "block" : "flex",
              gap: "var(--space-2xl)",
              justifyContent: "center",
            }}
          >
            {/* Colonne 1 */}
            <div
              style={{
                flex: 1,
                maxWidth: "320px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: device.isMobile ? "14px" : "15px",
                lineHeight: "1.9",
                color: "#3a3530",
                textAlign: "center",
              }}
            >
              {poemPartOne.map((stanza, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: i === 1 || i === 4 ? "var(--space-xl)" : "var(--space-lg)",
                    paddingBottom: i === 1 ? "var(--space-md)" : 0,
                    borderBottom: i === 1 ? "1px solid rgba(180, 140, 80, 0.3)" : "none",
                  }}
                >
                  {stanza.lines.map((line, j) => (
                    <p key={j} style={{ margin: 0 }}>{line}</p>
                  ))}
                </div>
              ))}
            </div>

            {/* Séparateur central (desktop) */}
            {!device.isMobile && (
              <div
                style={{
                  width: "1px",
                  background: "linear-gradient(to bottom, transparent, rgba(180,140,80,0.4) 20%, rgba(180,140,80,0.4) 80%, transparent)",
                }}
              />
            )}

            {/* Séparateur mobile */}
            {device.isMobile && (
              <div
                style={{
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(180,140,80,0.4), transparent)",
                  margin: "var(--space-xl) 0",
                }}
              />
            )}

            {/* Colonne 2 */}
            <div
              style={{
                flex: 1,
                maxWidth: "320px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: device.isMobile ? "14px" : "15px",
                lineHeight: "1.9",
                color: "#3a3530",
                textAlign: "center",
              }}
            >
              {poemPartTwo.map((stanza, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: i === 1 || i === 3 ? "var(--space-xl)" : "var(--space-lg)",
                    paddingBottom: i === 1 || i === 3 ? "var(--space-md)" : 0,
                    borderBottom: (i === 1 || i === 3) ? "1px solid rgba(180, 140, 80, 0.3)" : "none",
                  }}
                >
                  {stanza.lines.map((line, j) => (
                    <p key={j} style={{ margin: 0 }}>{line}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Dédicace et signature */}
          <div
            style={{
              marginTop: "var(--space-2xl)",
              paddingTop: "var(--space-xl)",
              borderTop: "1px solid rgba(180, 140, 80, 0.2)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                fontSize: "13px",
                color: "#7a6b5a",
                marginBottom: "var(--space-lg)",
              }}
            >
              (à toi, que le monde n'aura pas eu le temps de connaître)
            </p>

            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                fontSize: "16px",
                color: "#5a4d3f",
                letterSpacing: "0.15em",
              }}
            >
              — Ta maman
            </p>
          </div>
        </div>

        {/* Message de fin */}
        <div
          style={{
            marginTop: "var(--space-2xl)",
            padding: "var(--space-xl)",
            background: "var(--color-accent-calm)",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--color-text-primary)",
              lineHeight: "var(--line-height-relaxed)",
              marginBottom: "var(--space-md)",
            }}
          >
            Si vous traversez une épreuve similaire, sachez que vous n'êtes pas seul(e).
          </p>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            HELO est là pour vous accompagner, à votre rythme.
          </p>
        </div>

        {/* Bouton retour en bas */}
        <div style={{ textAlign: "center", marginTop: "var(--space-xl)" }}>
          <Button onClick={onBack} variant="secondary">
            Retour à la bibliothèque
          </Button>
        </div>
      </div>
    </div>
  );
}
