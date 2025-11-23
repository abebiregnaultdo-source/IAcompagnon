import Logo from "./components/Logo";
import Button from "./components/Button";
import UserMenu from "./components/UserMenu";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

/**
 * Page d'accueil après connexion
 * Affiche le profil thérapeutique et permet de démarrer une conversation
 */
export default function Home({
  user,
  onStartConversation,
  onStartCall,
  onOpenDashboard,
  onOpenSettings,
  onOpenResources,
  onOpenCreativity,
  onOpenGuide,
  onLogout,
}) {
  const device = useDeviceDetection();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
      }}
    >
      <div
        style={{
          maxWidth: device.isDesktop ? "1100px" : "900px",
          margin: "0 auto",
        }}
      >
        {/* En-tête with top-right user menu */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-2xl)",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <Logo size={50} showText={false} />
            <h1
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-sm)",
              }}
            >
              Bonjour, {user?.first_name || "Ami"}
            </h1>
            <p
              style={{
                fontSize: "var(--font-size-md)",
                color: "var(--color-text-secondary)",
                fontWeight: "var(--font-weight-normal)",
                letterSpacing: "0.01em",
              }}
            >
              Vous n'êtes pas seul·e
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <UserMenu
              user={user}
              onOpenParcours={onOpenDashboard}
              onOpenLibrary={onOpenResources}
              onOpenCreativity={onOpenCreativity}
              onOpenSettings={onOpenSettings}
              onLogout={onLogout}
            />
          </div>
        </div>

        {/* Profil thérapeutique configuré */}
        <div
          style={{
            background: "var(--color-surface-1)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-xl)",
            marginBottom: "var(--space-xl)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-lg)",
            }}
          >
            Votre accompagnement personnalisé
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: device.isMobile
                ? "1fr"
                : device.isTablet
                  ? "repeat(2, 1fr)"
                  : "repeat(3, 1fr)",
              gap: device.isMobile ? "var(--space-md)" : "var(--space-lg)",
            }}
          >
            {/* Rythme */}
            <div
              style={{
                padding: "var(--space-md)",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "var(--space-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Rythme
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-primary)",
                }}
              >
                {user?.rhythm === 1
                  ? "Lent et progressif"
                  : user?.rhythm === 3
                    ? "Enveloppant et présent"
                    : "Équilibré"}
              </div>
            </div>

            {/* Ton */}
            <div
              style={{
                padding: "var(--space-md)",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "var(--space-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Ton
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-primary)",
                }}
              >
                {user?.tone || "Neutre"}
              </div>
            </div>

            {/* Module actif */}
            <div
              style={{
                padding: "var(--space-md)",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "var(--space-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Accompagnement
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-primary)",
                }}
              >
                Deuil et perte
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "var(--space-lg)",
              textAlign: "center",
            }}
          >
            <button
              onClick={onOpenSettings}
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-primary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Modifier mes préférences
            </button>
          </div>
        </div>

        {/* Action principale : Démarrer une conversation */}
        <div
          style={{
            background: "var(--color-surface-1)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-2xl)",
            marginBottom: "var(--space-xl)",
            border: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-md)",
            }}
          >
            Prêt·e à échanger ?
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-xl)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Helō est là pour vous accompagner, à votre rythme, dans votre
            cheminement.
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--space-md)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              onClick={onStartConversation}
              style={{
                fontSize: "var(--font-size-md)",
                padding: "var(--space-md) var(--space-2xl)",
                minWidth: "250px",
              }}
            >
              Commencer une conversation
            </Button>

            <Button
              onClick={() => {
                onStartCall && onStartCall();
              }}
              style={{
                fontSize: "var(--font-size-md)",
                padding: "var(--space-md) var(--space-lg)",
              }}
            >
              Lancer un appel
            </Button>
          </div>
        </div>

        {/* Accès rapides: mettre Parcours, Bibliothèque, Créativité sur la même ligne */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-md)",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={onOpenDashboard}
            style={{
              flex: "1 1 30%",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-lg)",
              cursor: "pointer",
              textAlign: "center",
              transition: "var(--transition-fast)",
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
            <div
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-xs)",
              }}
            >
              Mon parcours
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-tertiary)",
              }}
            >
              Voir ma progression
            </div>
          </button>

          {/* Settings quick access removed; use the profile menu at top-right */}

          {/* Guide Helō removed from quick access */}
          <button
            onClick={onOpenResources}
            style={{
              flex: "1 1 30%",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-lg)",
              cursor: "pointer",
              textAlign: "center",
              transition: "var(--transition-fast)",
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
            <div
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-xs)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-xs)",
              }}
            >
              📚 Bibliothèque
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-tertiary)",
              }}
            >
              Livres, podcasts, articles
            </div>
          </button>

          <button
            onClick={onOpenCreativity}
            style={{
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-lg)",
              cursor: "pointer",
              textAlign: "center",
              transition: "var(--transition-fast)",
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
            <div
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-xs)",
              }}
            >
              Créativité
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-tertiary)",
              }}
            >
              Outils d'expression
            </div>
          </button>
        </div>

        {/* Bouton de déconnexion */}
        <div
          style={{
            marginTop: "var(--space-2xl)",
            paddingTop: "var(--space-xl)",
            borderTop: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          <button
            onClick={onLogout}
            style={{
              padding: "var(--space-sm) var(--space-lg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "transparent",
              color: "var(--color-text-tertiary)",
              fontSize: "var(--font-size-sm)",
              cursor: "pointer",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.color = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text-tertiary)";
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
