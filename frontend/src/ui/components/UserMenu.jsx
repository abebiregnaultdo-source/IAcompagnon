import { useState } from "react";

export default function UserMenu({
  user,
  onOpenParcours,
  onOpenLibrary,
  onOpenCreativity,
  onOpenSettings,
  onLogout,
}) {
  const [open, setOpen] = useState(false);

  const initials = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : "U";

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
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            boxShadow: "var(--shadow-md)",
            minWidth: 180,
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenParcours && onOpenParcours();
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Parcours
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenLibrary && onOpenLibrary();
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Bibliothèque
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenCreativity && onOpenCreativity();
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Créativité
          </button>
          <hr style={{ margin: 0 }} />
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenSettings && onOpenSettings();
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Paramètres
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout && onLogout();
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-primary)",
            }}
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
