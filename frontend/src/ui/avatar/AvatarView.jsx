import React from "react";

function Hair({ style, color }) {
  switch (style) {
    case "none":
      // Pas de cheveux - silhouette complètement neutre
      return null;
    case "curly":
      return (
        <path
          className="hair"
          d="M70 88 C 45 70, 95 60, 120 88 C 135 70, 165 75, 150 98 C 150 120, 90 120, 70 98 Z"
          fill={color}
        />
      );
    case "bun":
      return (
        <g>
          <circle className="hair" cx="110" cy="72" r="14" fill={color} />
          <path
            className="hair"
            d="M60 90 C 80 60, 140 60, 160 90 L 160 110 C 130 96, 90 96, 60 110 Z"
            fill={color}
          />
        </g>
      );
    case "medium":
      return (
        <path
          className="hair"
          d="M60 88 C 70 65, 150 65, 160 88 L 160 115 C 140 105, 80 105, 60 115 Z"
          fill={color}
        />
      );
    case "short":
    default:
      return (
        <path
          className="hair"
          d="M60 88 C 80 70, 140 70, 160 88 L 160 96 C 130 86, 90 86, 60 96 Z"
          fill={color}
        />
      );
  }
}

function Body({ presentation }) {
  // Ajustements subtils de la silhouette selon la présentation choisie
  const bodyPaths = {
    neutral: {
      torso: "M70 170 C 90 150, 130 150, 150 170 L 150 200 L 70 200 Z",
      torsoInner: "M92 170 C 110 158, 110 158, 128 170 L 128 200 L 92 200 Z",
    },
    feminine: {
      torso: "M75 170 C 90 152, 130 152, 145 170 L 148 200 L 72 200 Z",
      torsoInner: "M90 170 C 105 160, 115 160, 130 170 L 130 200 L 90 200 Z",
    },
    masculine: {
      torso: "M65 170 C 88 148, 132 148, 155 170 L 155 200 L 65 200 Z",
      torsoInner: "M88 170 C 108 156, 112 156, 132 170 L 132 200 L 88 200 Z",
    },
  };

  const paths = bodyPaths[presentation] || bodyPaths.neutral;

  return (
    <>
      <path d={paths.torso} fill="#5C7C8A" className="torso" />
      <path
        d={paths.torsoInner}
        fill="#6E90A0"
        opacity="0.9"
        className="torso-inner"
      />
    </>
  );
}

export default function AvatarView({
  skinColor = "#C98E6B",
  hairStyle = "none",
  presentation = "neutral",
  breathingPhase = 0,
  emotionalState = "neutral", // neutral, listening, empathy, support, calm
  isSpeaking = false,
}) {
  // Respiration adaptée à l'état émotionnel
  const breathingIntensity = emotionalState === "calm" ? 0.01 : emotionalState === "listening" ? 0.02 : 0.015;
  const breathScale = 1 + Math.sin(breathingPhase) * breathingIntensity;
  const breathOpacity = 0.85 + Math.sin(breathingPhase) * 0.08;

  // Inclinaison subtile selon l'état (empathie = penché vers l'avant)
  const tiltAngle = emotionalState === "empathy" ? 2 : emotionalState === "listening" ? 1 : 0;

  // Couleur du halo selon l'état émotionnel
  const haloColors = {
    neutral: "rgba(123, 168, 192, 0.12)",
    listening: "rgba(99, 179, 237, 0.18)",
    empathy: "rgba(72, 187, 120, 0.18)",
    support: "rgba(237, 137, 54, 0.15)",
    calm: "rgba(79, 209, 197, 0.18)",
  };
  const haloColor = haloColors[emotionalState] || haloColors.neutral;

  // Animation subtile des bras quand parle
  const armOffset = isSpeaking ? Math.sin(breathingPhase * 2) * 2 : 0;

  return (
    <svg
      width="200"
      height="240"
      viewBox="0 0 220 240"
      className="avatar-figure"
      aria-label="Présence thérapeutique"
      style={{
        transform: `scale(${breathScale}) rotate(${tiltAngle}deg)`,
        transformOrigin: "center bottom",
        opacity: breathOpacity,
        transition: "transform 0.8s ease-in-out, opacity 0.8s ease-in-out",
      }}
    >
      {/* Halo émotionnel - aura douce derrière l'avatar */}
      <ellipse
        cx="110"
        cy="140"
        rx="95"
        ry="105"
        fill={haloColor}
        style={{ transition: "fill 1.5s ease-in-out" }}
      />

      {/* Chair (stylized) */}
      <g className="chair-element">
        <path
          d="M40 200 C 40 160, 80 150, 110 150 C 140 150, 180 160, 180 200 L 180 210 C 180 215, 175 218, 168 218 L 52 218 C 45 218, 40 215, 40 210 Z"
          fill="#D6DCE3"
          opacity="0.9"
        />
        <rect x="48" y="188" width="20" height="8" rx="4" fill="#C7CED7" />
        <rect x="152" y="188" width="20" height="8" rx="4" fill="#C7CED7" />
      </g>

      {/* Person seated - simplified, no facial features */}
      <g className="presence-silhouette">
        {/* Head - simple oval, no face */}
        <ellipse
          cx="110"
          cy="100"
          rx="38"
          ry="44"
          fill={skinColor}
          className="head-shape"
          opacity="0.95"
        />

        {/* Hair - optionnel, pour personnalisation */}
        <Hair style={hairStyle} color="#333" />

        {/* Subtle neck/chin area - no detailed features */}
        <rect
          x="102"
          y="136"
          width="16"
          height="12"
          rx="4"
          fill={skinColor}
          opacity="0.9"
        />

        {/* Torso seated - ajusté selon présentation */}
        <Body presentation={presentation} />

        {/* Arms over armrests - gentle, relaxed posture with subtle movement */}
        <path
          d={`M68 ${178 + armOffset} Q 90 ${182 + armOffset} 94 190`}
          stroke="#6E90A0"
          strokeWidth="6"
          fill="none"
          opacity="0.8"
          className="arm-left"
          style={{ transition: "d 0.3s ease-out" }}
        />
        <path
          d={`M152 ${178 - armOffset} Q 130 ${182 - armOffset} 126 190`}
          stroke="#6E90A0"
          strokeWidth="6"
          fill="none"
          opacity="0.8"
          className="arm-right"
          style={{ transition: "d 0.3s ease-out" }}
        />
      </g>
    </svg>
  );
}
