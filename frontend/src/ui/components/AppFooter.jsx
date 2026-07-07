/**
 * Pied de page commun aux vues internes.
 * Donne un accès permanent aux Réglages et aux pages légales (RGPD),
 * qui étaient auparavant difficiles à trouver (cachés dans le menu avatar).
 */
export default function AppFooter({ onOpenSettings, onOpenLegal }) {
  const linkStyle = {
    background: "transparent",
    border: "none",
    color: "var(--color-text-tertiary)",
    fontSize: "var(--font-size-sm)",
    cursor: "pointer",
    padding: "var(--space-xs) var(--space-sm)",
    transition: "color var(--transition-fast)",
  };

  const onEnter = (e) => (e.currentTarget.style.color = "var(--color-primary)");
  const onLeave = (e) =>
    (e.currentTarget.style.color = "var(--color-text-tertiary)");

  return (
    <footer
      style={{
        marginTop: "var(--space-2xl)",
        paddingTop: "var(--space-lg)",
        paddingBottom: "var(--space-lg)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "var(--space-xs)",
        fontSize: "var(--font-size-sm)",
      }}
    >
      {onOpenSettings && (
        <>
          <button
            onClick={onOpenSettings}
            style={linkStyle}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            Réglages
          </button>
          <span style={{ color: "var(--color-border)" }}>·</span>
        </>
      )}
      <button
        onClick={() => onOpenLegal && onOpenLegal("confidentialite")}
        style={linkStyle}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        Confidentialité
      </button>
      <span style={{ color: "var(--color-border)" }}>·</span>
      <button
        onClick={() => onOpenLegal && onOpenLegal("mentions")}
        style={linkStyle}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        Mentions légales
      </button>
      <span style={{ color: "var(--color-border)" }}>·</span>
      <button
        onClick={() => onOpenLegal && onOpenLegal("cgv")}
        style={linkStyle}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        CGV
      </button>
    </footer>
  );
}
