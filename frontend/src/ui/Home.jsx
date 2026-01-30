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
  const hasExtendedProfile = user?.extended_profile != null;

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
            onOpenParcours={onOpenDashboard}
            onOpenLibrary={onOpenResources}
            onOpenCreativity={onOpenCreativity}
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

        {/* Navigation rapide - 3 boutons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            marginBottom: "var(--space-xl)",
          }}
        >
          <button
            onClick={onOpenDashboard}
            style={{
              padding: "var(--space-lg)",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              textAlign: "center",
              transition: "var(--transition-fast)",
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-primary)",
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
            📖 Parcours
          </button>

          <button
            onClick={onOpenResources}
            style={{
              padding: "var(--space-lg)",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              textAlign: "center",
              transition: "var(--transition-fast)",
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-primary)",
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
            📚 Bibliothèque
          </button>

          <button
            onClick={onOpenCreativity}
            style={{
              padding: "var(--space-lg)",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              textAlign: "center",
              transition: "var(--transition-fast)",
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-primary)",
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
            🎨 Créativité
          </button>

          <button
            onClick={onOpenDreams}
            style={{
              padding: "var(--space-lg)",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              textAlign: "center",
              transition: "var(--transition-fast)",
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-primary)",
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
            🌙 Journal des Rêves
          </button>
        </div>

        {/* Accès au profil spirituel (si disponible) */}
        {hasExtendedProfile && (
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <button
              onClick={onOpenSpiritualProfile}
              style={{
                width: "100%",
                padding: "var(--space-md)",
                background: "linear-gradient(135deg, rgba(123, 168, 192, 0.1), rgba(138, 186, 168, 0.1))",
                border: "1px dashed var(--color-primary)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "center",
                fontSize: "var(--font-size-md)",
                color: "var(--color-primary)",
                transition: "var(--transition-fast)",
                marginBottom: "var(--space-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(123, 168, 192, 0.2), rgba(138, 186, 168, 0.2))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(123, 168, 192, 0.1), rgba(138, 186, 168, 0.1))";
              }}
            >
              🔮 Mon Profil Spirituel
            </button>

            {/* Accès rapide aux mantras */}
            {hasMantras && (
              <button
                onClick={() => setShowMantras(true)}
                style={{
                  width: "100%",
                  padding: "var(--space-sm)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "center",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                  transition: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                ✨ Accès rapide : Mes Mantras
              </button>
            )}
          </div>
        )}

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
