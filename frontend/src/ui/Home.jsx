import { useState } from "react";
import Logo from "./components/Logo";
import UserMenu from "./components/UserMenu";
import SubscriptionBanner from "./components/SubscriptionBanner";
import MantrasQuickAccess from "./components/MantrasQuickAccess";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

/**
 * Page d'accueil après connexion - VERSION PREMIUM
 * Design thérapeutique épuré, chaleureux et professionnel
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
  onOpenLegal,
  onOpenPricing,
  onLogout,
}) {
  const device = useDeviceDetection();
  const [showMantras, setShowMantras] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const hasMantras = user?.extended_profile?.mantras?.length > 0;
  const hasSpiritualAccess = user?.extended_profile && Object.keys(user.extended_profile).length > 0;

  // Style de carte réutilisable
  const cardStyle = (id) => ({
    padding: device.isMobile ? "16px 18px" : "18px 22px",
    background: hoveredCard === id
      ? "linear-gradient(135deg, rgba(123, 168, 192, 0.08), rgba(138, 186, 168, 0.06))"
      : "rgba(242, 246, 247, 0.6)",
    border: hoveredCard === id
      ? "1px solid rgba(123, 168, 192, 0.3)"
      : "1px solid rgba(123, 168, 192, 0.1)",
    borderRadius: "14px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: device.isMobile ? "14px" : "15px",
    color: "#3a4048",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    width: "100%",
    transform: hoveredCard === id ? "translateY(-1px)" : "none",
    boxShadow: hoveredCard === id
      ? "0 4px 16px rgba(123, 168, 192, 0.12)"
      : "0 1px 4px rgba(0, 0, 0, 0.03)",
  });

  const iconCircle = (bg) => ({
    width: device.isMobile ? "38px" : "42px",
    height: device.isMobile ? "38px" : "42px",
    borderRadius: "12px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: device.isMobile ? "18px" : "20px",
    flexShrink: 0,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f5f2ed 0%, #eef3f6 50%, #f5f2ed 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: device.isMobile ? "16px 16px 32px" : "40px 24px 48px",
        overflowY: "auto",
      }}
    >
      {/* Top bar: menu utilisateur */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: device.isMobile ? "8px" : "16px",
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

      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Subscription banner */}
        <div style={{ marginBottom: "24px" }}>
          <SubscriptionBanner userId={user?.id} createdAt={user?.created_at} onOpenPricing={onOpenPricing} />
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: device.isMobile ? "28px" : "36px" }}>
          <div style={{ marginBottom: "20px" }}>
            <Logo size={52} showText={true} />
          </div>

          <h1
            style={{
              fontSize: device.isMobile ? "26px" : "30px",
              fontWeight: 400,
              color: "#3a4048",
              marginBottom: "6px",
              letterSpacing: "-0.3px",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Bonjour, {user?.first_name || "vous"}
          </h1>

          <p
            style={{
              fontSize: device.isMobile ? "15px" : "16px",
              color: "#7a8490",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Comment allez-vous aujourd'hui ?
          </p>
        </div>

        {/* Action principale : Écrire */}
        <button
          onClick={onStartConversation}
          onMouseEnter={() => setHoveredCard("main")}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: "100%",
            padding: device.isMobile ? "20px 24px" : "24px 28px",
            background: hoveredCard === "main"
              ? "linear-gradient(135deg, #6a9db8 0%, #7BA8C0 100%)"
              : "linear-gradient(135deg, #7BA8C0 0%, #8ab4c8 100%)",
            border: "none",
            borderRadius: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: device.isMobile ? "28px" : "36px",
            transition: "all 0.35s ease",
            transform: hoveredCard === "main" ? "translateY(-2px)" : "none",
            boxShadow: hoveredCard === "main"
              ? "0 8px 28px rgba(123, 168, 192, 0.35)"
              : "0 4px 16px rgba(123, 168, 192, 0.2)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "rgba(242, 246, 247, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0,
            }}
          >
            💬
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: device.isMobile ? "16px" : "17px",
                fontWeight: 500,
                color: "#F2F6F7",
                marginBottom: "2px",
              }}
            >
              Commencer une conversation
            </div>
            <div
              style={{
                fontSize: device.isMobile ? "12px" : "13px",
                color: "rgba(242, 246, 247, 0.75)",
                fontWeight: 400,
              }}
            >
              Je suis là pour vous écouter
            </div>
          </div>
        </button>

        {/* Action secondaire : Appel vocal */}
        <button
          onClick={onStartCall}
          onMouseEnter={() => setHoveredCard("voice")}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: "100%",
            padding: device.isMobile ? "14px 20px" : "16px 24px",
            background: hoveredCard === "voice"
              ? "linear-gradient(135deg, rgba(138, 186, 168, 0.12), rgba(123, 168, 192, 0.08))"
              : "rgba(242, 246, 247, 0.7)",
            border: hoveredCard === "voice"
              ? "1px solid rgba(138, 186, 168, 0.35)"
              : "1px solid rgba(123, 168, 192, 0.15)",
            borderRadius: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: device.isMobile ? "28px" : "36px",
            transition: "all 0.35s ease",
            transform: hoveredCard === "voice" ? "translateY(-1px)" : "none",
            boxShadow: hoveredCard === "voice"
              ? "0 4px 16px rgba(138, 186, 168, 0.15)"
              : "0 1px 4px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div style={{
            width: device.isMobile ? "38px" : "42px",
            height: device.isMobile ? "38px" : "42px",
            borderRadius: "12px",
            background: "rgba(138, 186, 168, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: device.isMobile ? "18px" : "20px",
            flexShrink: 0,
          }}>
            🎙️
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{
              fontSize: device.isMobile ? "15px" : "16px",
              fontWeight: 450,
              color: "#3a4048",
              marginBottom: "1px",
            }}>
              Appel vocal
            </div>
            <div style={{
              fontSize: device.isMobile ? "12px" : "13px",
              color: "#7a8490",
              fontWeight: 400,
            }}>
              Parlez directement avec Helō
            </div>
          </div>
        </button>

        {/* Grille de fonctionnalités */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: device.isMobile ? "10px" : "12px",
            marginBottom: "24px",
          }}
        >
          {/* Parcours */}
          <button
            onClick={onOpenDashboard}
            onMouseEnter={() => setHoveredCard("parcours")}
            onMouseLeave={() => setHoveredCard(null)}
            style={cardStyle("parcours")}
          >
            <div style={iconCircle("rgba(123, 168, 192, 0.12)")}>📖</div>
            <span style={{ fontWeight: 450 }}>Parcours</span>
          </button>

          {/* Bibliothèque */}
          <button
            onClick={onOpenResources}
            onMouseEnter={() => setHoveredCard("biblio")}
            onMouseLeave={() => setHoveredCard(null)}
            style={cardStyle("biblio")}
          >
            <div style={iconCircle("rgba(138, 186, 168, 0.12)")}>📚</div>
            <span style={{ fontWeight: 450 }}>Bibliothèque</span>
          </button>

          {/* Créativité */}
          <button
            onClick={onOpenCreativity}
            onMouseEnter={() => setHoveredCard("crea")}
            onMouseLeave={() => setHoveredCard(null)}
            style={cardStyle("crea")}
          >
            <div style={iconCircle("rgba(192, 168, 123, 0.12)")}>🎨</div>
            <span style={{ fontWeight: 450 }}>Créativité</span>
          </button>

          {/* Spiritualité ou placeholder */}
          {hasSpiritualAccess ? (
            <button
              onClick={onOpenSpiritualProfile}
              onMouseEnter={() => setHoveredCard("spirit")}
              onMouseLeave={() => setHoveredCard(null)}
              style={cardStyle("spirit")}
            >
              <div style={iconCircle("rgba(168, 140, 192, 0.12)")}>🔮</div>
              <span style={{ fontWeight: 450 }}>Profil Spirituel</span>
            </button>
          ) : (
            <div style={{ ...cardStyle("empty"), cursor: "default", opacity: 0 }} />
          )}
        </div>

        {/* Modules secondaires si spiritual access */}
        {hasSpiritualAccess && (
          <div
            style={{
              display: "flex",
              gap: device.isMobile ? "10px" : "12px",
              marginBottom: "24px",
            }}
          >
            <button
              onClick={onOpenDreams}
              onMouseEnter={() => setHoveredCard("dreams")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ ...cardStyle("dreams"), flex: 1 }}
            >
              <div style={iconCircle("rgba(140, 160, 192, 0.12)")}>🌙</div>
              <span style={{ fontWeight: 450 }}>Journal des Rêves</span>
            </button>

            {hasMantras && (
              <button
                onClick={() => setShowMantras(true)}
                onMouseEnter={() => setHoveredCard("mantras")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ ...cardStyle("mantras"), flex: 1 }}
              >
                <div style={iconCircle("rgba(192, 180, 140, 0.12)")}>✨</div>
                <span style={{ fontWeight: 450 }}>Mes Mantras</span>
              </button>
            )}
          </div>
        )}

        {/* Footer discret — liens légaux + déconnexion */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "36px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* Ligne légale : CGV · Confidentialité · Mentions */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[
              { label: "CGV", key: "cgv" },
              { label: "Confidentialité", key: "confidentialite" },
              { label: "Mentions légales", key: "mentions" },
            ].map(({ label, key }, i) => (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span style={{ color: "#c8cdd3", fontSize: "10px" }}>·</span>}
                <button
                  onClick={() => onOpenLegal?.(key)}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#7a8490"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#b8bfc7"}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: "#b8bfc7",
                    fontSize: "11px",
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                    letterSpacing: "0.01em",
                  }}
                >
                  {label}
                </button>
              </span>
            ))}
          </div>

          {/* Déconnexion */}
          <button
            onClick={onLogout}
            onMouseEnter={(e) => e.currentTarget.style.color = "#7a8490"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#b8bfc7"}
            style={{
              padding: "6px 12px",
              border: "none",
              background: "transparent",
              color: "#b8bfc7",
              fontSize: "11px",
              cursor: "pointer",
              transition: "color 0.3s ease",
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Modal Mantras */}
      {showMantras && (
        <MantrasQuickAccess user={user} onClose={() => setShowMantras(false)} />
      )}
    </div>
  );
}
