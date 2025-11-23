import { useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

/**
 * Bibliothèque de ressources externes
 * Livres, podcasts, articles et vidéos recommandés
 */
export default function Library({ onBackToHome }) {
  const device = useDeviceDetection();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const resources = [
    {
      id: 1,
      category: "livre",
      title: "Le deuil : vivre après la perte d'un être cher",
      author: "Marie-Frédérique Bacqué",
      description:
        "Un guide complet pour comprendre et traverser le processus de deuil.",
      type: "Livre",
    },
    {
      id: 2,
      category: "livre",
      title: "La mort intime",
      author: "Marie de Hennezel",
      description:
        "Réflexions sur l'accompagnement des personnes en fin de vie et le deuil.",
      type: "Livre",
    },
    {
      id: 3,
      category: "article",
      title: "Les étapes du deuil selon Kübler-Ross",
      author: "Elisabeth Kübler-Ross",
      description:
        "Comprendre les 5 étapes du deuil : déni, colère, marchandage, dépression, acceptation.",
      type: "Article",
    },
    {
      id: 4,
      category: "podcast",
      title: "Parler de la mort",
      author: "France Culture",
      description:
        "Série de podcasts sur le deuil, la mort et l'accompagnement.",
      type: "Podcast",
    },
    {
      id: 5,
      category: "video",
      title: "Comprendre le deuil",
      author: "Christophe Fauré",
      description: "Conférence sur les mécanismes psychologiques du deuil.",
      type: "Vidéo",
    },
  ];

  const categories = [
    { id: "all", label: "Tout" },
    { id: "livre", label: "Livres" },
    { id: "article", label: "Articles" },
    { id: "podcast", label: "Podcasts" },
    { id: "video", label: "Vidéos" },
  ];

  const filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: "var(--space-xl)",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <button
          onClick={onBackToHome}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-primary)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-surface-1)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
        >
          ← Retour à l'accueil
        </button>

        <div
          style={{
            background:
              "linear-gradient(135deg, var(--color-accent-calm) 0%, var(--color-surface-1) 100%)",
            borderRadius: "var(--radius-xl)",
            padding: device.isMobile ? "var(--space-xl)" : "var(--space-2xl)",
            marginBottom: "var(--space-2xl)",
            textAlign: "center",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "white",
              fontSize: "32px",
              marginBottom: "var(--space-md)",
            }}
          >
            📚
          </div>
          <h1
            style={{
              fontSize: device.isMobile
                ? "var(--font-size-xl)"
                : "var(--font-size-3xl)",
              color: "var(--color-text-primary)",
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "var(--space-sm)",
              fontFamily: "var(--font-family-display)",
            }}
          >
            Bibliothèque de ressources externes
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Livres, podcasts, articles et vidéos recommandés par des
            professionnels pour approfondir votre compréhension du deuil
          </p>
        </div>

        {/* Filtres */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            marginBottom: "var(--space-xl)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "var(--space-sm) var(--space-lg)",
                borderRadius: "var(--radius-full)",
                border:
                  selectedCategory === cat.id
                    ? "2px solid var(--color-primary)"
                    : "1px solid var(--color-border)",
                background:
                  selectedCategory === cat.id
                    ? "var(--color-accent-calm)"
                    : "var(--color-surface-1)",
                color:
                  selectedCategory === cat.id
                    ? "var(--color-primary)"
                    : "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
                fontWeight:
                  selectedCategory === cat.id
                    ? "var(--font-weight-medium)"
                    : "normal",
                cursor: "pointer",
                transition: "var(--transition-fast)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Liste des ressources */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "var(--space-lg)",
          }}
        >
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              style={{
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-lg)",
                transition: "var(--transition-fast)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-primary)",
                    fontWeight: "var(--font-weight-medium)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {resource.type}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-xs)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                {resource.title}
              </h3>

              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                  marginBottom: "var(--space-sm)",
                  fontStyle: "italic",
                }}
              >
                {resource.author}
              </p>

              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-relaxed)",
                  marginBottom: "var(--space-md)",
                }}
              >
                {resource.description}
              </p>

              <Button
                onClick={() => {
                  // TODO: Ouvrir la ressource
                  alert("Ressource à venir");
                }}
                style={{
                  width: "100%",
                  fontSize: "var(--font-size-sm)",
                  padding: "var(--space-sm)",
                }}
              >
                Consulter
              </Button>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-2xl)",
              color: "var(--color-text-tertiary)",
            }}
          >
            Aucune ressource dans cette catégorie pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
