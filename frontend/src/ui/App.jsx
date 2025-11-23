import { useMemo, useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import Auth from "./Auth";
import Onboarding from "./Onboarding";
import Home from "./Home";
import Chat from "./Chat";
import VoiceChat from "./VoiceChat";
import Settings from "./Settings";
import CrisisDemo from "./CrisisDemo";
import Resources from "./Resources";
import Library from "./Library";
import Creativity from "./Creativity";
import { Dashboard } from "./Dashboard";
import Pricing from "./Pricing";
import CGV from "./legal/CGV";
import MentionsLegales from "./legal/MentionsLegales";
import Confidentialite from "./legal/Confidentialite";
import Logo from "./components/Logo";
import EmotionalFeedback from "./components/EmotionalFeedback";
import { useDeviceClass } from "../hooks/useDeviceDetection";

export default function App() {
  // Détection d'appareil
  const deviceClass = useDeviceClass();

  // Appliquer la classe au body
  useEffect(() => {
    document.body.className = deviceClass;
  }, [deviceClass]);

  // Check for demo mode in URL
  const urlParams = new URLSearchParams(window.location.search);
  const demoMode = urlParams.get("demo");

  // Show crisis demo if requested
  if (demoMode === "crisis") {
    return <CrisisDemo />;
  }

  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [step, setStep] = useState("intro");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [emotionalState, setEmotionalState] = useState("calm");
  const [showResources, setShowResources] = useState(false);
  const [resourcesPage, setResourcesPage] = useState("home");
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCreativity, setShowCreativity] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showLegalPage, setShowLegalPage] = useState(null); // 'cgv' | 'mentions' | 'confidentialite'
  const [showHome, setShowHome] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [conversationMode, setConversationMode] = useState("chat"); // 'chat' | 'voice'

  const api = useMemo(() => ({ base: "http://localhost:8000" }), []);

  // Restore user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("helo_current_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setShowLanding(false);
        setShowAuth(false);
      } catch (e) {
        console.error("Error restoring user session:", e);
      }
    }
  }, []);

  // Ensure we show Home by default for authenticated users
  useEffect(() => {
    if (user) {
      // Only auto-open Home if the user profile looks configured
      const profileConfigured = user?.first_name && user?.rhythm;
      if (!profileConfigured) return;

      const anyViewOpen =
        showHome ||
        showChat ||
        showSettings ||
        showDashboard ||
        showLibrary ||
        showCreativity ||
        showResources ||
        showPricing ||
        showLegalPage;
      if (!anyViewOpen) setShowHome(true);
    }
  }, [user]);

  const handleUserReady = (userData) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setUser(userData);
      setIsTransitioning(false);
      setShowHome(true); // Afficher la page d'accueil après l'onboarding
    }, 600);
  };

  const handleAuthenticated = (userData) => {
    localStorage.setItem("helo_current_user", JSON.stringify(userData));
    setUser(userData);
    setShowAuth(false);
    // Si l'utilisateur a déjà un profil configuré, aller à Home, sinon Onboarding
    if (userData.first_name && userData.rhythm) {
      setShowHome(true);
    }
    // Sinon, l'onboarding s'affichera automatiquement (user existe mais pas de first_name)
  };

  // Show landing page first
  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={() => {
          setShowLanding(false);
          setShowAuth(true);
        }}
      />
    );
  }

  // Show legal pages
  if (showLegalPage === "cgv") {
    return <CGV onBack={() => setShowLegalPage(null)} />;
  }
  if (showLegalPage === "mentions") {
    return <MentionsLegales onBack={() => setShowLegalPage(null)} />;
  }
  if (showLegalPage === "confidentialite") {
    return <Confidentialite onBack={() => setShowLegalPage(null)} />;
  }

  // Show pricing page
  if (showPricing) {
    return <Pricing onBack={() => setShowPricing(false)} user={user} />;
  }

  // Show auth page if user not authenticated
  if (showAuth) {
    return (
      <EmotionalFeedback state="calm">
        <div className="auth-container">
          <Auth onAuthenticated={handleAuthenticated} />
        </div>
      </EmotionalFeedback>
    );
  }

  if (isTransitioning) {
    return (
      <EmotionalFeedback state={emotionalState}>
        <div className="container">
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <div
            className="card"
            style={{ textAlign: "center", padding: "var(--space-3xl)" }}
            role="status"
            aria-live="polite"
          >
            <Logo size={60} showText={true} />
            <div
              style={{
                marginTop: "var(--space-xl)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Préparation de votre espace...
            </div>
          </div>
        </div>
      </EmotionalFeedback>
    );
  }

  if (!user) {
    return (
      <EmotionalFeedback state="calm">
        <div className="container">
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <main id="main-content" className="card">
            <Onboarding
              api={api}
              step={step}
              setStep={setStep}
              onReady={handleUserReady}
            />
          </main>
        </div>
      </EmotionalFeedback>
    );
  }

  // If user exists but hasn't completed onboarding, show Onboarding
  if (user && (!user.first_name || !user.rhythm)) {
    return (
      <EmotionalFeedback state="calm">
        <div className="container">
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <main id="main-content" className="card">
            <Onboarding
              api={api}
              step={step}
              setStep={setStep}
              onReady={handleUserReady}
            />
          </main>
        </div>
      </EmotionalFeedback>
    );
  }

  // Afficher la page d'accueil (Home)
  if (showHome && user) {
    return (
      <EmotionalFeedback state="calm">
        <Home
          user={user}
          onStartConversation={() => {
            setShowHome(false);
            setShowChat(true);
          }}
          onStartCall={() => {
            setConversationMode("voice");
            setShowHome(false);
            setShowChat(true);
          }}
          onOpenDashboard={() => {
            setShowHome(false);
            setShowDashboard(true);
          }}
          onOpenSettings={() => {
            setShowHome(false);
            setShowSettings(true);
          }}
          onOpenGuide={() => {
            setShowHome(false);
            setShowResources(true);
          }}
          onOpenResources={() => {
            setShowHome(false);
            setShowLibrary(true);
          }}
          onOpenCreativity={() => {
            setShowHome(false);
            setShowCreativity(true);
          }}
          onLogout={() => {
            // Nettoyer la session localStorage
            localStorage.removeItem("helo_current_user");
            // Réinitialiser tous les états
            setUser(null);
            setShowHome(false);
            setShowAuth(false);
            setShowChat(false);
            setShowSettings(false);
            setShowDashboard(false);
            setShowLibrary(false);
            setShowCreativity(false);
            setShowResources(false);
            setShowPricing(false);
            setShowLegalPage(null);
            // Retourner à la landing page
            setShowLanding(true);
          }}
        />
      </EmotionalFeedback>
    );
  }

  // Afficher le chat si demandé
  if (showChat && user) {
    const ChatComponent = conversationMode === "voice" ? VoiceChat : Chat;
    return (
      <EmotionalFeedback state={emotionalState}>
        <div className="container">
          <button
            onClick={() => {
              setShowChat(false);
              setShowHome(true);
            }}
            style={{
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-primary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "var(--space-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}
          >
            ← Retour à l'accueil
          </button>
          <ChatComponent
            user={user}
            api={api}
            onEmotionalStateChange={setEmotionalState}
          />
        </div>
      </EmotionalFeedback>
    );
  }

  // Afficher les paramètres si demandé
  if (showSettings) {
    return (
      <EmotionalFeedback state="calm">
        <div className="container">
          <button
            onClick={() => {
              setShowSettings(false);
              setShowHome(true);
            }}
            style={{
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-primary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "var(--space-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}
          >
            ← Retour à l'accueil
          </button>
          <Settings
            user={user}
            api={api}
            onSave={(settings) => {
              setConversationMode(settings.conversationMode);
              setShowSettings(false);
              setShowHome(true);
            }}
            onBackToHome={() => {
              setShowSettings(false);
              setShowHome(true);
            }}
            onOpenLegal={(page) => {
              setShowSettings(false);
              setShowLegalPage(page);
            }}
            onLogout={() => {
              // Nettoyer la session localStorage
              localStorage.removeItem("helo_current_user");
              // Réinitialiser tous les états
              setUser(null);
              setShowHome(false);
              setShowAuth(false);
              setShowChat(false);
              setShowSettings(false);
              setShowDashboard(false);
              setShowLibrary(false);
              setShowCreativity(false);
              setShowResources(false);
              setShowPricing(false);
              setShowLegalPage(null);
              // Retourner à la landing page
              setShowLanding(true);
            }}
          />
        </div>
      </EmotionalFeedback>
    );
  }

  // Afficher le dashboard si demandé
  if (showDashboard && user) {
    return (
      <EmotionalFeedback state="calm">
        <div className="container">
          <button
            onClick={() => {
              setShowDashboard(false);
              setShowHome(true);
            }}
            style={{
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-primary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "var(--space-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}
          >
            ← Retour à l'accueil
          </button>
          <Dashboard
            user={user}
            onClose={() => {
              setShowDashboard(false);
              setShowHome(true);
            }}
            onLogout={() => {
              // Nettoyer la session localStorage
              localStorage.removeItem("helo_current_user");
              // Réinitialiser tous les états
              setUser(null);
              setShowHome(false);
              setShowAuth(false);
              setShowChat(false);
              setShowSettings(false);
              setShowDashboard(false);
              setShowLibrary(false);
              setShowCreativity(false);
              setShowResources(false);
              setShowPricing(false);
              setShowLegalPage(null);
              // Retourner à la landing page
              setShowLanding(true);
            }}
          />
        </div>
      </EmotionalFeedback>
    );
  }

  // Afficher la bibliothèque si demandé
  if (showLibrary) {
    return (
      <EmotionalFeedback state="calm">
        <Library
          onBackToHome={() => {
            setShowLibrary(false);
            setShowHome(true);
          }}
        />
      </EmotionalFeedback>
    );
  }

  // Afficher la créativité si demandé
  if (showCreativity) {
    return (
      <EmotionalFeedback state="calm">
        <Creativity
          user={user}
          api={api}
          onBackToHome={() => {
            setShowCreativity(false);
            setShowHome(true);
          }}
        />
      </EmotionalFeedback>
    );
  }

  // Afficher les ressources si demandé
  if (showResources) {
    return (
      <EmotionalFeedback state="calm">
        <Resources
          onBack={() => {
            setShowResources(false);
            if (user) {
              setShowHome(true);
            }
          }}
          initialPage={resourcesPage}
        />
      </EmotionalFeedback>
    );
  }

  // If nothing matched, show landing/get-started

  // Si aucun état n'est actif, retour à la landing page
  return (
    <LandingPage
      onGetStarted={() => {
        setShowLanding(false);
        setShowAuth(true);
      }}
    />
  );
}
