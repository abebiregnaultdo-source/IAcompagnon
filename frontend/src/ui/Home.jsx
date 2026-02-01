import { useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import UserMenu from "./components/UserMenu";
import SubscriptionBanner from "./components/SubscriptionBanner";
import MantrasQuickAccess from "./components/MantrasQuickAccess";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

/**
 * Page d'accueil après connexion - VERSION MINIMALISTE
 * Design épuré centré sur les actions principales
 */
export default function Home({
  user,
  onStartConversation,
  onStartCall,
  onOpenDashboard,
  onOpenSettings,
  onOpenResources,
  onOpenCreativity,
  onOpenDreams,
  onOpenSpiritualProfile,
  onLogout,
}) {
  const device = useDeviceDetection();
  const [showMantras, setShowMantras] = useState(false);
  const hasMantras = user?.extended_profile?.mantras?.length > 0;
  // Module spiritualité en beta - visible uniquement si l'utilisateur a un extended_profile
  const hasSpiritualAccess = user?.extended_profile && Object.keys(user.extended_profile).length > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* User menu en haut à droite */}
        <div
          style={{
            position: "absolute",
            top: "var(--space-lg)",
            right: "var(--space-lg)",
          }}
        >
          <UserMenu
            user={user}
            hasSpiritualAccess={hasSpiritualAccess}
            onOpenParcours={onOpenDashboard}
            onOpenLibrary={onOpenResources}
            onOpenCreativity={onOpenCreativity}
            onOpenDreams={onOpenDreams}
            onOpenSpiritualProfile={onOpenSpiritualProfile}
            onOpenSettings={onOpenSettings}
            onLogout={onLogout}
          />
        </div>

        {/* Subscription banner */}
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <SubscriptionBanner userId={user?.id} />
        </div>

        {/* Header simple avec logo */}
        <div style={{ marginBottom: "var(--space-2xl)" }}>
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <Logo size={60} showText={true} />
          </div>

          <h1
            style={{
              fontSize: device.isMobile ? "28px" : "32px",
              fontWeight: "var(--font-weight-normal)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-sm)",
            }}
          >
            Bonjour, {user?.first_name || "Ge"}
          </h1>

          <p
            style={{
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-secondary)",
              fontWeight: "var(--font-weight-normal)",
            }}
          >
            Je suis là pour vous
          </p>
        </div>

        {/* Actions principales */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            marginBottom: "var(--space-2xl)",
          }}
        >
          <Button
            onClick={onStartConversation}
            style={{
              fontSize: "var(--font-size-lg)",
              padding: "var(--space-xl)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-sm)",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              border: "none",
              boxShadow: "0 4px 12px rgba(123, 168, 192, 0.3)",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>💬</span>
            <span>Écrire un message</span>
          </Button>

          <Button
            onClick={onStartCall}
            variant="secondary"
            style={{
              fontSize: "var(--font-size-lg)",
              padding: "var(--space-xl)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-sm)",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
              <span style={{ fontSize: "1.5rem" }}>📞</span>
              <span>Appel visio</span>
            </div>
          </Button>
        </div>

        {/* GROUPE 1 : Moi & Spiritualité - Beta, visible uniquement si extended_profile */}
        {hasSpiritualAccess && <div style={{ marginBottom: "var(--space-xl)" }}>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "var(--space-sm)",
            }}
          >
            Moi & Spiritualité
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
            }}
          >
            <button
              onClick={onOpenSpiritualProfile}
              style={{
                padding: "var(--space-md) var(--space-lg)",
                background: "linear-gradient(135deg, rgba(123, 168, 192, 0.15), rgba(138, 186, 168, 0.15))",
                border: "1px solid var(--color-primary)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "var(--font-size-md)",
                color: "var(--color-text-primary)",
                transition: "var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(123, 168, 192, 0.25), rgba(138, 186, 168, 0.25))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(123, 168, 192, 0.15), rgba(138, 186, 168, 0.15))";
              }}
            >
              <span>🔮</span>
              <span>Mon Profil Spirituel</span>
            </button>

            <button
              onClick={onOpenDreams}
              style={{
                padding: "var(--space-md) var(--space-lg)",
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "var(--font-size-md)",
                color: "var(--color-text-primary)",
                transition: "var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-surface-2)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-surface-1)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <span>🌙</span>
              <span>Journal des Rêves</span>
            </button>

            {hasMantras && (
              <button
                onClick={() => setShowMantras(true)}
                style={{
                  padding: "var(--space-sm) var(--space-lg)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                  transition: "var(--transition-fast)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                <span>✨</span>
                <span>Accès rapide : Mes Mantras</span>
              </button>
            )}
          </div>
        </div>}

        {/* GROUPE 2 : Apprentissage */}
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "var(--space-sm)",
            }}
          >
            Apprentissage
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
            }}
          >
            <button
              onClick={onOpenDashboard}
              style={{
                padding: "var(--space-md) var(--space-lg)",
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "var(--font-size-md)",
                color: "var(--color-text-primary)",
                transition: "var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-surface-2)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-surface-1)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <span>📖</span>
              <span>Parcours</span>
            </button>

            <button
              onClick={onOpenResources}
              style={{
                padding: "var(--space-md) var(--space-lg)",
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "var(--font-size-md)",
                color: "var(--color-text-primary)",
                transition: "var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-surface-2)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-surface-1)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <span>📚</span>
              <span>Bibliothèque</span>
            </button>
          </div>
        </div>

        {/* GROUPE 3 : Expression */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "var(--space-sm)",
            }}
          >
            Expression
          </p>
          <button
            onClick={onOpenCreativity}
            style={{
              width: "100%",
              padding: "var(--space-md) var(--space-lg)",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-primary)",
              transition: "var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-surface-2)";
              e.currentTarget.style.borderColor = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-surface-1)";
              e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          >
            <span>🎨</span>
            <span>Créativité</span>
          </button>
        </div>

        {/* Modal Mantras */}
        {showMantras && (
          <MantrasQuickAccess user={user} onClose={() => setShowMantras(false)} />
        )}

        {/* Footer avec déconnexion */}
        <div style={{ paddingTop: "var(--space-lg)", borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={onLogout}
            style={{
              padding: "var(--space-sm) var(--space-lg)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-tertiary)",
              fontSize: "var(--font-size-sm)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
