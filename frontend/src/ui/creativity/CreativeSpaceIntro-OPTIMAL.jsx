import { useEffect, useState } from "react";
import Button from "../components/Button";
import { useDeviceDetection } from "../../hooks/useDeviceDetection";

/**
 * CreativeSpaceIntro - Version OPTIMALE
 * 
 * Principes perfectionnés:
 * 1. Flow narratif thérapeutique (Apaiser → Explorer → Exprimer → Transformer)
 * 2. Zéro redondance d'emojis
 * 3. Storytelling clair avec progression
 * 4. Ligne de connexion visuelle entre étapes
 * 5. Design helō optimal
 */
export default function CreativeSpaceIntro({
  api,
  onOpenTool,
  onOpenPortfolio,
  onBack,
}) {
  const device = useDeviceDetection();
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
  }, [api.base]);

  // Parcours thérapeutique optimisé
  const therapeuticJourney = [
    {
      stage: " Apaiser",
      emoji: "🌊",
      title: "Retrouver le calme",
      description:
        "Quand les émotions sont trop intenses, commencez par vous ancrer dans le présent.",
      gradient: "linear-gradient(135deg, #E8EFF2 0%, #FFFFFF 100%)",
      tools: [
        {
          key: "coloring",
          icon: "🎨",
          name: "Coloriage méditatif",
          description:
            "Méditation active par la couleur. Apaisez votre esprit avec des mandalas thérapeutiques.",
        },
      ],
    },
    {
      stage: "Explorer",
      emoji: "🔍",
      title: "Comprendre ce que vous ressentez",
      description:
        "Un espace sûr pour plonger dans vos émotions et leur donner de l'espace.",
      gradient: "linear-gradient(135deg, #F5EFE6 0%, #FFFFFF 100%)",
      tools: [
        {
          key: "journal",
          icon: "📖",
          name: "Journal guidé",
          description:
            "Questions adaptées à votre contexte. L'écriture comme dialogue avec soi-même.",
        },
      ],
    },
    {
      stage: "Exprimer",
      emoji: "✍️",
      title: "Mettre des mots sur l'indicible",
      description:
        "Racontez votre histoire, trouvez les images qui parlent pour vous.",
      gradient: "linear-gradient(135deg, #C5D9E3 0%, #FFFFFF 100%)",
      tools: [
        {
          key: "narrative",
          icon: "📝",
          name: "Récit narratif",
          description:
            "Reconstruisez votre temporalité. Donnez du sens à votre parcours.",
        },
        {
          key: "poem",
          icon: "🪶",
          name: "Poésie thérapeutique",
          description:
            "Assistance discrète pour formuler des images poétiques. Les mots comme chemin.",
        },
      ],
    },
    {
      stage: "Transformer",
      emoji: "🌟",
      title: "Ritualiser les passages",
      description:
        "Quand vous êtes prêt·e à marquer symboliquement une transition importante.",
      gradient: "linear-gradient(135deg, #E0CDB8 0%, #FFFFFF 100%)",
      tools: [
        {
          key: "ritual",
          icon: "🕯️",
          name: "Rituels d'écriture",
          description:
            "Créez vos propres cérémonies symboliques. Ritualisez les moments importants.",
        },
      ],
    },
  ];

  return (
    <div
      style={{
        padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "var(--space-2xl)",
          padding: device.isMobile ? "var(--space-lg)" : "var(--space-xl)",
          background:
            "linear-gradient(135deg, var(--color-surface-calm) 0%, var(--color-accent-warm) 100%)",
          borderRadius: "24px",
          border: "1px solid var(--color-accent-calm)",
        }}
      >
        <div style={{ fontSize: "56px", marginBottom: "var(--space-md)" }}>
          ✨
        </div>
        <h1
          style={{
            fontFamily: "var(--font-family-display)",
            fontSize: device.isMobile ? "26px" : "32px",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Votre espace d'expression
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Un parcours d'outils thérapeutiques pour explorer, comprendre et
          transformer votre expérience.
        </p>
      </div>

      {/* QUESTION CENTRALE */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "var(--space-2xl)",
          padding: "var(--space-lg)",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Où en êtes-vous aujourd'hui ?
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            fontStyle: "italic",
          }}
        >
          Choisissez l'outil qui résonne avec votre état présent
        </div>
      </div>

      {/* PARCOURS THÉRAPEUTIQUE */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xl)",
          marginBottom: "var(--space-2xl)",
          position: "relative",
        }}
      >
        {/* Ligne de connexion (desktop only) */}
        {!device.isMobile && (
          <div
            style={{
              position: "absolute",
              left: "28px",
              top: "80px",
              bottom: "80px",
              width: "2px",
              background:
                "linear-gradient(180deg, var(--color-accent-calm) 0%, var(--color-primary) 50%, var(--color-accent-warm) 100%)",
              opacity: 0.3,
            }}
          />
        )}

        {therapeuticJourney.map((section, sectionIndex) => (
          <div
            key={section.stage}
            style={{
              animation: `fadeInUp 0.6s ease ${0.1 * (sectionIndex + 1)}s forwards`,
              opacity: 0,
              position: "relative",
            }}
          >
            {/* Section Header */}
            <div
              style={{
                display: "flex",
                alignItems: device.isMobile ? "flex-start" : "center",
                flexDirection: device.isMobile ? "column" : "row",
                gap: "var(--space-md)",
                marginBottom: "var(--space-md)",
                textAlign: device.isMobile ? "center" : "left",
              }}
            >
              {/* Emoji badge */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  background: section.gradient,
                  borderRadius: "50%",
                  border: "2px solid var(--color-accent-calm)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 1,
                  margin: device.isMobile ? "0 auto var(--space-sm)" : 0,
                }}
              >
                {section.emoji}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--color-text-tertiary)",
                    fontWeight: "var(--font-weight-semibold)",
                    marginBottom: "4px",
                  }}
                >
                  {section.stage}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {section.title}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                    lineHeight: "var(--line-height-relaxed)",
                  }}
                >
                  {section.description}
                </div>
              </div>
            </div>

            {/* Tools list */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
                marginLeft: device.isMobile ? 0 : "70px",
              }}
            >
              {section.tools.map((tool) => (
                <div
                  key={tool.key}
                  onClick={() => onOpenTool(tool.key)}
                  style={{
                    background: "var(--color-surface-1)",
                    border: "2px solid var(--color-accent-calm)",
                    borderRadius: "16px",
                    padding: "var(--space-lg)",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.transform = "translateX(8px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(123, 168, 192, 0.2)";
                    const bar = e.currentTarget.querySelector(".tool-bar");
                    if (bar) bar.style.transform = "scaleY(1)";
                    const arrow = e.currentTarget.querySelector(".tool-arrow");
                    if (arrow) {
                      arrow.style.opacity = "1";
                      arrow.style.transform = "translateX(0)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-accent-calm)";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                    const bar = e.currentTarget.querySelector(".tool-bar");
                    if (bar) bar.style.transform = "scaleY(0)";
                    const arrow = e.currentTarget.querySelector(".tool-arrow");
                    if (arrow && !device.isMobile) {
                      arrow.style.opacity = "0";
                      arrow.style.transform = "translateX(-10px)";
                    }
                  }}
                >
                  {/* Barre latérale */}
                  <div
                    className="tool-bar"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "100%",
                      background: "var(--color-primary)",
                      transform: "scaleY(0)",
                      transition: "transform 0.3s ease",
                    }}
                  />

                  {/* Contenu */}
                  <div
                    style={{
                      display: device.isMobile ? "block" : "grid",
                      gridTemplateColumns: device.isMobile
                        ? "1fr"
                        : "48px 1fr auto",
                      gap: "var(--space-md)",
                      alignItems: "center",
                      textAlign: device.isMobile ? "center" : "left",
                    }}
                  >
                    <div
                      style={{
                        fontSize: device.isMobile ? "28px" : "36px",
                        marginBottom: device.isMobile ? "var(--space-sm)" : 0,
                      }}
                    >
                      {tool.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--color-text-primary)",
                          marginBottom: "4px",
                        }}
                      >
                        {tool.name}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "var(--color-text-secondary)",
                          lineHeight: "var(--line-height-relaxed)",
                        }}
                      >
                        {tool.description}
                      </div>
                    </div>
                    <div
                      className="tool-arrow"
                      style={{
                        color: "var(--color-primary)",
                        fontSize: "20px",
                        opacity: device.isMobile ? 1 : 0,
                        transform: device.isMobile
                          ? "translateX(0)"
                          : "translateX(-10px)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PORTFOLIO */}
      <div
        style={{
          background: "var(--color-accent-warm)",
          border: "2px solid var(--color-accent-warm)",
          borderRadius: "20px",
          padding: device.isMobile ? "var(--space-lg)" : "var(--space-xl)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "var(--space-md)" }}>
          📚
        </div>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Votre portfolio créatif
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
            marginBottom: "var(--space-lg)",
            maxWidth: "600px",
            margin: "0 auto var(--space-lg)",
          }}
        >
          Toutes vos créations sont sauvegardées ici. Relisez votre parcours,
          exportez vos textes, et contemplez votre progression au fil du temps.
        </p>
        <Button variant="secondary" onClick={onOpenPortfolio}>
          Voir mon portfolio
        </Button>
      </div>

      {/* Animation CSS inline */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
