import React from "react";

/**
 * InsightCard - Carte d'insight qualitatif (pas de stats)
 * Utilisé dans le dashboard pour afficher des observations douces
 */
export default function InsightCard({ icon, text, variant = "default" }) {
  const className = `helo-insight-card ${
    variant !== "default" ? `variant-${variant}` : ""
  }`;

  return (
    <div className={className}>
      <span className="helo-insight-icon">{icon}</span>
      <div className="helo-insight-text">{text}</div>
    </div>
  );
}
