import { useState } from "react";

export default function UserMenu({
  user,
  hasSpiritualAccess = false,
  onOpenParcours,
  onOpenLibrary,
  onOpenCreativity,
  onOpenDreams,
  onOpenSpiritualProfile,
  onOpenSettings,
  onLogout,
}) {
  const [open, setOpen] = useState(false);

  const initials = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : "U";

  const menuItemStyle = {
    width: "100%",
    textAlign: "left",
    padding: "10px 14px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "var(--color-text-primary)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "background 0.2s",
  };

  const sectionLabelStyle = {
    padding: "8px 14px 4px",
    fontSize: "11px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 10px",
          borderRadius: "20px",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface-1)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--color-primary)",
            color: "var(--color-white-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
          }}
        >
          {initials}
        </div>
        <div style={{ fontSize: "14px", color: "var(--color-text-primary)" }}>
          {user?.first_name || "Utilisateur"}
        </div>
      </button>

      {open && (
        <>
          {/* Overlay pour fermer le menu */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
            }}
          />
          <div
            role="menu"
            style={{
              position: "absolute",
              right: 0,
              marginTop: 8,
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              boxShadow: "var(--shadow-lg)",
              minWidth: 220,
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {/* Section: Moi & Spiritualité - Beta, visible uniquement si hasSpiritualAccess */}
            {hasSpiritualAccess && (
              <>
                <div style={sectionLabelStyle}>Moi & Spiritualité</div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onOpenSpiritualProfile && onOpenSpiritualProfile();
                  }}
                  style={menuItemStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span>🔮</span>
                  <span>Profil Spirituel</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onOpenDreams && onOpenDreams();
                  }}
                  style={menuItemStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span>🌙</span>
                  <span>Journal des Rêves</span>
                </button>
              </>
            )}

            {/* Section: Apprentissage */}
            <div style={sectionLabelStyle}>Apprentissage</div>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onOpenParcours && onOpenParcours();
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span>📖</span>
              <span>Parcours</span>
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onOpenLibrary && onOpenLibrary();
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span>📚</span>
              <span>Bibliothèque</span>
            </button>

            {/* Section: Expression */}
            <div style={sectionLabelStyle}>Expression</div>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onOpenCreativity && onOpenCreativity();
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span>🎨</span>
              <span>Créativité</span>
            </button>

            <hr style={{ margin: "8px 0", borderColor: "var(--color-border)" }} />

            {/* Section: Paramètres */}
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onOpenSettings && onOpenSettings();
              }}
              style={menuItemStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span>⚙️</span>
              <span>Paramètres</span>
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout && onLogout();
              }}
              style={{
                ...menuItemStyle,
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span>🚪</span>
              <span>Se déconnecter</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
