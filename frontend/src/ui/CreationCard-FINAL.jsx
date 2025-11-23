import React from "react";

/**
 * CreationCard - Affichage d'une création (texte/audio/dessin/photo)
 * Version améliorée pour helō avec gestion complète des types
 */
export default function CreationCard({ creation }) {
  // ============================================
  // HELPERS
  // ============================================
  
  const getTypeIcon = (type) => {
    const icons = {
      text: "📝",
      audio: "🎙️",
      drawing: "🎨",
      photo: "📷",
      voice: "🎙️",
      image: "📷",
    };
    return icons[type?.toLowerCase()] || "✨";
  };

  const getTypeLabel = (type) => {
    const labels = {
      text: "Texte",
      audio: "Audio",
      voice: "Audio",
      drawing: "Dessin",
      photo: "Photo",
      image: "Photo",
    };
    return labels[type?.toLowerCase()] || "Création";
  };

  const getRelativeTime = (date) => {
    if (!date) return "";
    
    const now = new Date();
    const createdDate = new Date(date);
    const diffInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30)
      return `Il y a ${Math.floor(diffInDays / 7)} semaine${
        Math.floor(diffInDays / 7) > 1 ? "s" : ""
      }`;

    return createdDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  // ============================================
  // RENDER CONTENT SELON LE TYPE
  // ============================================
  
  const renderContent = () => {
    const type = creation.type?.toLowerCase();

    switch (type) {
      case "text":
        return (
          <div
            style={{
              maxHeight: 80,
              overflow: "hidden",
              lineHeight: 1.6,
            }}
          >
            {(creation.content || creation.excerpt || creation.text || "")
              .substring(0, 150)}
            {(creation.content || creation.excerpt || creation.text || "")
              .length > 150
              ? "..."
              : ""}
          </div>
        );

      case "audio":
      case "voice":
        return (
          <>
            <div className="helo-audio-bar">
              <div
                className="helo-audio-fill"
                style={{ width: `${creation.progress || 0}%` }}
              />
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 8,
              }}
            >
              {creation.duration || "0:00"}
            </div>
          </>
        );

      case "drawing":
      case "photo":
      case "image":
        if (creation.imageUrl || creation.image_url || creation.url) {
          return (
            <img
              src={
                creation.imageUrl || creation.image_url || creation.url
              }
              alt={creation.title || "Création"}
              className="helo-preview-box"
              style={{ objectFit: "cover" }}
            />
          );
        }
        return <div className="helo-preview-box" />;

      default:
        // Fallback: afficher excerpt si disponible
        if (creation.excerpt || creation.content) {
          return (
            <div style={{ lineHeight: 1.6, fontSize: 14 }}>
              {(creation.excerpt || creation.content).substring(0, 100)}
              {(creation.excerpt || creation.content).length > 100 ? "..." : ""}
            </div>
          );
        }
        return null;
    }
  };

  const getActionLabel = () => {
    const type = creation.type?.toLowerCase();
    const labels = {
      text: "Lire",
      audio: "Écouter",
      voice: "Écouter",
      drawing: "Voir",
      photo: "Voir",
      image: "Voir",
    };
    return labels[type] || "Voir";
  };

  // ============================================
  // RENDER
  // ============================================
  
  const date = creation.date || creation.created_at;
  const title = creation.title || creation.name || "Sans titre";

  return (
    <div className="helo-card">
      <div className="helo-card-title">{title}</div>

      <div className="helo-card-meta">
        <span>
          {getTypeIcon(creation.type)} {getTypeLabel(creation.type)}
        </span>
        {date && <span>{getRelativeTime(date)}</span>}
      </div>

      <div className="helo-card-body">{renderContent()}</div>

      <div className="helo-card-actions">
        <a
          href={`/creation/${creation.id}`}
          className="helo-card-link"
          onClick={(e) => {
            e.preventDefault();
            // Gérer l'ouverture de la création
            // Vous pouvez ajouter votre logique ici
            console.log("Ouvrir création:", creation.id);
          }}
        >
          {getActionLabel()} →
        </a>
      </div>
    </div>
  );
}
