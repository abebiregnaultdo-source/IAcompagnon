import React from "react";

/**
 * Environnement thérapeutique sécurisant
 *
 * Principes neurologiques :
 * - Pas de blanc pur (stimulation excessive)
 * - Pas de noir (anxiogène)
 * - Pas de contrastes vifs (stress du système nerveux)
 * - Couleurs désaturées (apaisement)
 * - Effet de "pièce intérieure sécurisée" (contenant)
 *
 * Références scientifiques :
 * - Théorie polyvagale (Stephen Porges) : environnement sécurisant
 * - Psychologie des couleurs : tons chauds désaturés = sécurité
 * - Neuroscience : contraste faible = réduction cortisol
 */
export default function ConsultationRoom({ theme, lighting }) {
  const style = {
    // Thème CALME - Bleus désaturés, effet cocon
    calm: {
      // Pas de blanc pur - crème bleuté très doux
      bg: "linear-gradient(180deg, #E8EFF2 0%, #F2F6F7 100%)",
      // Accents doux, jamais vifs
      accents: "#C5D9E3",
      soft: "#D8E6ED",
      // Couleur de fond enveloppante
      envelope: "#EDF4F6",
    },

    // Thème CHALEUREUX - Beiges/sables, effet nid
    warm: {
      // Pas de blanc pur - crème chaud
      bg: "linear-gradient(180deg, #F5EFE6 0%, #F9F5F0 100%)",
      // Accents terre douce
      accents: "#E0CDB8",
      soft: "#EBE0D3",
      // Couleur de fond enveloppante
      envelope: "#F7F2EC",
    },

    // Thème PROFESSIONNEL - Gris chauds, effet studio
    pro: {
      // Pas de blanc pur - gris très clair et chaud
      bg: "linear-gradient(180deg, #EDEEF1 0%, #F4F5F7 100%)",
      // Accents gris-bleu doux
      accents: "#CDD4DD",
      soft: "#DDE2E8",
      // Couleur de fond enveloppante
      envelope: "#F0F2F5",
    },
  }[theme || "calm"];

  return (
    <div className="room-bg" style={{ background: style.bg }}>
      {/* Couche d'enveloppe - crée l'effet de pièce intérieure */}
      <div
        className="room-envelope"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 30%, ${style.envelope}40 100%)`,
          pointerEvents: "none",
        }}
      />

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 240 280"
        preserveAspectRatio="none"
        className="room-elements"
      >
        {/* Formes abstraites TRÈS douces - suggèrent un espace sans le définir */}

        {/* Grande forme douce en haut - suggère une ouverture lumineuse */}
        <ellipse
          cx="50"
          cy="35"
          rx="45"
          ry="30"
          fill={style.soft}
          opacity="0.2"
        />

        {/* Ligne horizontale très douce - suggère un horizon apaisant */}
        <rect
          x="100"
          y="185"
          width="120"
          height="1.5"
          rx="0.75"
          fill={style.accents}
          opacity="0.15"
        />

        {/* Forme organique en bas - suggère une présence végétale douce */}
        <ellipse
          cx="25"
          cy="225"
          rx="20"
          ry="28"
          fill={style.accents}
          opacity="0.12"
        />

        {/* Forme verticale douce à droite - suggère un élément architectural */}
        <rect
          x="205"
          y="50"
          width="1.5"
          height="90"
          rx="0.75"
          fill={style.accents}
          opacity="0.15"
        />

        {/* Cercle doux en haut à droite - suggère une source de lumière naturelle */}
        <circle cx="200" cy="45" r="15" fill={style.soft} opacity="0.18" />

        {/* Forme douce supplémentaire - renforce l'effet cocon */}
        <ellipse
          cx="180"
          cy="240"
          rx="35"
          ry="25"
          fill={style.soft}
          opacity="0.1"
        />
      </svg>

      {/* Overlay de lumière qui change selon l'état émotionnel */}
      <div className={`light-overlay light-${lighting || "medium"}`}></div>
    </div>
  );
}
