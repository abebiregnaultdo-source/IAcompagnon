import React from "react";

/**
 * ResourceCard - Affichage d'une ressource (méditation/article/exercice)
 * Version améliorée pour helō avec gestion complète des types
 */
export default function ResourceCard({ resource }) {
  // ============================================
  // HELPERS
  // ============================================
  
  const getTypeIcon = (type) => {
    const icons = {
      meditation: "🧘",
      exercise: "✨",
      article: "📖",
      audio: "🎧",
      video: "🎬",
      guide: "📋",
      tool: "🛠️",
    };
    return icons[type?.toLowerCase()] || "💡";
  };

  const getTypeLabel = (type) => {
    const labels = {
      meditation: "Méditation",
      exercise: "Exercice",
      article: "Article",
      audio: "Audio",
      video: "Vidéo",
      guide: "Guide",
      tool: "Outil",
    };
    return labels[type?.toLowerCase()] || "Ressource";
  };

  const getDuration = (duration, type) => {
    if (!duration) return null;

    // Si c'est déjà formaté (ex: "5 min")
    if (typeof duration === "string") return duration;

    // Si c'est un nombre (minutes)
    if (type === "article" || type === "guide") {
      return `${duration} min de lecture`;
    }

    if (duration < 60) {
      return `${duration} min`;
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  };

  const getActionLabel = () => {
    const type = resource.type?.toLowerCase();
    const labels = {
      article: "Lire",
      guide: "Lire",
      meditation: "Écouter",
      audio: "Écouter",
      video: "Regarder",
      exercise: "Découvrir",
      tool: "Utiliser",
    };
    return labels[type] || "Découvrir";
  };

  // ============================================
  // RENDER
  // ============================================
  
  const title = resource.title || resource.name;
  const description = resource.description || resource.excerpt;
  const tags = resource.tags || resource.categories || [];

  return (
    <div className="helo-card">
      <div className="helo-card-title">{title}</div>

      <div className="helo-card-meta">
        <span>
          {getTypeIcon(resource.type)} {getTypeLabel(resource.type)}
        </span>
        {resource.duration && (
          <span>{getDuration(resource.duration, resource.type)}</span>
        )}
      </div>

      <div className="helo-card-body">
        <div style={{ lineHeight: 1.6 }}>{description}</div>

        {/* Tags doux si disponibles */}
        {tags && tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            {tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  background: "var(--accent-calm)",
                  color: "var(--text-secondary)",
                  borderRadius: 12,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="helo-card-actions">
        <a
          href={resource.url || `/resource/${resource.id}`}
          className="helo-card-link"
          target={resource.url ? "_blank" : undefined}
          rel={resource.url ? "noopener noreferrer" : undefined}
          onClick={(e) => {
            if (!resource.url) {
              e.preventDefault();
              // Gérer l'ouverture de la ressource interne
              console.log("Ouvrir ressource:", resource.id);
            }
          }}
        >
          {getActionLabel()} →
        </a>
      </div>
    </div>
  );
}
