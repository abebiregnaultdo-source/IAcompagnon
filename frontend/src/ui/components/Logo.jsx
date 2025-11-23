/**
 * Logo de l'application - HELŌ
 * Wordmark pur - sobre, digne, sans symbolique à décoder
 * Le "ō" suffit comme distinction visuelle
 */
export default function Logo({
  size = 40,
  showText = true,
  tagline = null,
  onClick = null,
}) {
  const textSize = size;
  const smallTextSize = Math.round(size * 0.35);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    cursor: onClick ? "pointer" : "default",
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div style={containerStyle} onClick={handleClick}>
      {/* Wordmark principal */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          color: "#7BA8C0",
          fontWeight: 500,
          lineHeight: 1,
          fontFamily: "Inter, sans-serif",
          fontSize: textSize,
          letterSpacing: "0.08em",
        }}
      >
        helō
      </div>

      {/* Tagline - soit passé en prop, soit par défaut pour grandes tailles */}
      {(tagline || (showText && size >= 60)) && (
        <div
          style={{
            fontSize: smallTextSize,
            color: "#5A6068",
            fontWeight: 400,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.02em",
            marginTop: "2px",
          }}
        >
          {tagline || "Vous n'êtes pas seul·e"}
        </div>
      )}
    </div>
  );
}
