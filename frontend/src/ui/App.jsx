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
import DreamJournal from "./DreamJournal";
import SpiritualProfile from "./SpiritualProfile";
import { Dashboard } from "./Dashboard";
import Pricing from "./Pricing";
import CGV from "./legal/CGV";
import MentionsLegales from "./legal/MentionsLegales";
import Confidentialite from "./legal/Confidentialite";
import AdminDashboard from "./AdminDashboard";
import ResetPassword from "./ResetPassword";
import Logo from "./components/Logo";
import EmotionalFeedback from "./components/EmotionalFeedback";
import AppFooter from "./components/AppFooter";
import { useDeviceClass } from "../hooks/useDeviceDetection";
import { supabase, getProfile, updateProfile, signOut } from "../lib/supabase";

export default function App() {
  // Détection d'appareil
  const deviceClass = useDeviceClass();

  // Appliquer la classe au body
  useEffect(() => {
    document.body.className = deviceClass;
  }, [deviceClass]);

  // Check for demo mode, admin mode, or reset-password in URL
  const urlParams = new URLSearchParams(window.location.search);
  const demoMode = urlParams.get("demo");
  const adminMode = urlParams.get("admin");
  const isResetPasswordPage = window.location.pathname === "/reset-password";

  const api = useMemo(() => ({
    base: import.meta.env.VITE_BACKEND_URL || "https://helo-backend.onrender.com"
  }), []);

  // Show admin dashboard if requested with correct key (from env variable)
  const adminKey = import.meta.env.VITE_ADMIN_KEY || "helo2024admin";
  if (adminMode && adminMode === adminKey) {
    return (
      <AdminDashboard
        api={api}
        onBack={() => (window.location.href = "/")}
      />
    );
  }

  // Show crisis demo if requested
  if (demoMode === "crisis") {
    return <CrisisDemo />;
  }

  // Show password reset page
  if (isResetPasswordPage) {
    return (
      <EmotionalFeedback state="calm">
        <ResetPassword
          onComplete={() => {
            window.location.href = "/";
          }}
        />
      </EmotionalFeedback>
    );
  }

  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' ou 'register' selon le bouton cliqué
  const [user, setUser] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true); // Ajout: chargement initial
  const [step, setStep] = useState("intro");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [emotionalState, setEmotionalState] = useState("calm");
  const [showResources, setShowResources] = useState(false);
  const [resourcesPage, setResourcesPage] = useState("home");
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCreativity, setShowCreativity] = useState(false);
  const [showDreams, setShowDreams] = useState(false);
  const [showSpiritualProfile, setShowSpiritualProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showLegalPage, setShowLegalPage] = useState(null); // 'cgv' | 'mentions' | 'confidentialite'
  const [showHome, setShowHome] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState(null);
  const [conversationMode, setConversationMode] = useState("chat"); // 'chat' | 'voice'

  // Restore user session on mount (Supabase)
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoadingSession(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // Mode dev désactivé - utiliser l'auth normale
        // Pour tester en local : se connecter avec un compte Supabase

        if (session?.user) {
          const profile = await getProfile(session.user.id);
          console.log('[HELO] Profile loaded:', profile);
          console.log('[HELO] Extended profile:', profile?.extended_profile);
          const userData = {
            id: session.user.id,
            email: session.user.email,
            first_name: profile?.first_name || session.user.user_metadata?.first_name || '',
            onboarding_completed: profile?.onboarding_completed === true
              || localStorage.getItem(`helo_onboarding_${session.user.id}`) === "true",
            preferences: profile?.preferences || {},
            ...profile,
          };
          setUser(userData);
          setShowLanding(false);
          setShowAuth(false);

          // Si onboarding terminé, aller directement à Home
          if (userData.onboarding_completed) {
            setShowHome(true);
          }
        }
      } catch (e) {
        console.error("Error restoring user session:", e);
      } finally {
        setIsLoadingSession(false);
      }
    };

    restoreSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowLanding(true);
        setShowHome(false);
      } else if ((event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') && session?.user) {
        // Après reset password ou connexion, récupérer le profil complet
        try {
          const profile = await getProfile(session.user.id);
          const userData = {
            id: session.user.id,
            email: session.user.email,
            first_name: profile?.first_name || session.user.user_metadata?.first_name || '',
            onboarding_completed: profile?.onboarding_completed === true
              || localStorage.getItem(`helo_onboarding_${session.user.id}`) === "true",
            preferences: profile?.preferences || {},
            ...profile,
          };
          setUser(userData);
          setShowLanding(false);
          setShowAuth(false);
          if (userData.onboarding_completed) {
            setShowHome(true);
          }
        } catch (e) {
          console.error("Error loading profile after auth change:", e);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ensure we show Home by default for authenticated users
  useEffect(() => {
    if (user) {
      // Only auto-open Home if onboarding is completed
      if (!user.onboarding_completed) return;

      const anyViewOpen =
        showHome ||
        showChat ||
        showSettings ||
        showDashboard ||
        showLibrary ||
        showCreativity ||
        showDreams ||
        showSpiritualProfile ||
        showResources ||
        showPricing ||
        showLegalPage;
      if (!anyViewOpen) setShowHome(true);
    }
  }, [user]);

  const handleUserReady = (profileData) => {
    // Fusionner le profil d'onboarding avec l'utilisateur existant
    const updatedUser = { ...user, ...profileData, onboarding_completed: true };

    // Sauvegarder dans Supabase en background (non-bloquant)
    const saveData = {
      first_name: profileData.first_name,
      preferences: {
        ...(profileData.preferences || {}),
        rhythm: profileData.rhythm,
        tone: profileData.tone,
      },
      onboarding_completed: true,
    };

    // Motif d'entrée (facultatif) → premier insight du contexte de vie.
    // Point de départ de la sédimentation : ce que la personne a nommé elle-même.
    if (profileData.initial_reason) {
      saveData.conversation_insights = {
        initial_reason: profileData.initial_reason,
        captured_at: new Date().toISOString(),
      };
    }

    // Fire-and-forget: retry en background, ne bloque JAMAIS la transition
    (async () => {
      let saved = false;
      for (let attempt = 0; attempt < 3 && !saved; attempt++) {
        try {
          await updateProfile(user.id, saveData);
          saved = true;
          console.log("[HELO] Onboarding saved to Supabase successfully");
        } catch (e) {
          console.error(`[HELO] Error saving onboarding (attempt ${attempt + 1}/3):`, e);
          if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
        }
      }
      if (!saved) {
        console.error("[HELO] CRITICAL: Failed to save onboarding after 3 attempts");
        // Fallback localStorage pour éviter que l'onboarding se relance
        localStorage.setItem(`helo_onboarding_${user.id}`, "true");
      }
    })();

    // Transition IMMÉDIATE vers Home — jamais bloquée par Supabase
    setIsTransitioning(true);
    setTimeout(() => {
      setUser(updatedUser);
      setIsTransitioning(false);
      setShowHome(true);
    }, 600);

    // Timeout de sécurité : si la transition est encore active après 3s, forcer la sortie
    setTimeout(() => {
      setIsTransitioning((still) => {
        if (still) {
          console.warn("[HELO] Safety timeout: forcing transition end");
          setUser(updatedUser);
          setShowHome(true);
          return false;
        }
        return still;
      });
    }, 3000);
  };

  const handleLogout = async () => {
    await signOut();
    if (user?.id) localStorage.removeItem(`helo_onboarding_${user.id}`);
    localStorage.removeItem("helo_current_user");
    setUser(null);
    setShowHome(false);
    setShowAuth(false);
    setShowChat(false);
    setShowSettings(false);
    setShowDashboard(false);
    setShowLibrary(false);
    setShowCreativity(false);
    setShowDreams(false);
    setShowSpiritualProfile(false);
    setShowResources(false);
    setShowPricing(false);
    setShowLegalPage(null);
    setShowLanding(true);
  };

  const handleAuthenticated = (userData) => {
    setUser(userData);
    setShowAuth(false);
    // Si l'utilisateur a déjà un profil configuré, aller à Home, sinon Onboarding
    if (userData.onboarding_completed) {
      setShowHome(true);
    }
    // Sinon, l'onboarding s'affichera automatiquement
  };

  // Footer commun aux vues internes (Réglages + pages légales, accessibles partout).
  const appFooter = (
    <div className="container">
      <AppFooter
        onOpenSettings={() => {
          setShowHome(false);
          setShowSettings(true);
        }}
        onOpenLegal={(page) => setShowLegalPage(page)}
      />
    </div>
  );

  // Show landing page first
  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={(mode) => {
          setAuthMode(mode === "register" ? "register" : "login");
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
          <Auth onAuthenticated={handleAuthenticated} mode={authMode} />
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

  // Pendant le chargement de la session, afficher un loader
  if (isLoadingSession) {
    return (
      <EmotionalFeedback state="calm">
        <div className="container">
          <div
            className="card"
            style={{ textAlign: "center", padding: "var(--space-3xl)" }}
          >
            <Logo size={60} showText={true} />
            <div
              style={{
                marginTop: "var(--space-xl)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Chargement...
            </div>
          </div>
        </div>
      </EmotionalFeedback>
    );
  }

  // Show Onboarding if user not authenticated or hasn't completed onboarding
  if (!user || !user.onboarding_completed) {
    return (
      <EmotionalFeedback state="calm">
        <div className="container">
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <main id="main-content" className="card">
            <Onboarding
              api={api}
              user={user}
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
          onOpenResources={() => {
            setShowHome(false);
            setShowLibrary(true);
          }}
          onOpenCreativity={() => {
            setShowHome(false);
            setShowCreativity(true);
          }}
          onOpenDreams={() => {
            setShowHome(false);
            setShowDreams(true);
          }}
          onOpenSpiritualProfile={() => {
            setShowHome(false);
            setShowSpiritualProfile(true);
          }}
          onOpenLegal={(page) => setShowLegalPage(page)}
          onOpenPricing={() => {
            setShowHome(false);
            setShowPricing(true);
          }}
          onLogout={handleLogout}
        />
      </EmotionalFeedback>
    );
  }

  // Afficher le chat vocal
  if (showChat && user && conversationMode === "voice") {
    return (
      <EmotionalFeedback state={emotionalState}>
        <VoiceChat
          user={user}
          api={api}
          onEmotionalStateChange={setEmotionalState}
          onBackToHome={() => {
            setShowChat(false);
            setShowHome(true);
            setConversationMode("chat");
          }}
        />
      </EmotionalFeedback>
    );
  }

  // Afficher le chat écrit
  if (showChat && user) {
    return (
      <EmotionalFeedback state={emotionalState}>
        <div className="container">
          <button
            onClick={() => {
              setShowChat(false);
              setShowHome(true);
              setConversationMode("chat");
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
          <Chat
            user={user}
            api={api}
            resumeSessionId={resumeSessionId}
            onEmotionalStateChange={setEmotionalState}
            onBackToHome={() => {
              setShowChat(false);
              setShowHome(true);
              setConversationMode("chat");
              setResumeSessionId(null);
            }}
            onSwitchToVoice={() => {
              setConversationMode("voice");
            }}
            onOpenCreativity={() => {
              setShowChat(false);
              setShowCreativity(true);
            }}
            onOpenLibrary={() => {
              setShowChat(false);
              setShowLibrary(true);
            }}
            onOpenDreams={() => {
              setShowChat(false);
              setShowDreams(true);
            }}
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
            onLogout={handleLogout}
          />
        </div>
      </EmotionalFeedback>
    );
  }

  // Afficher le dashboard si demandé
  if (showDashboard && user) {
    return (
      <EmotionalFeedback state="calm" footer={appFooter}>
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
            onResumeSession={(sessionId) => {
              setResumeSessionId(sessionId);
              setShowDashboard(false);
              setShowChat(true);
            }}
            onLogout={handleLogout}
          />
        </div>
      </EmotionalFeedback>
    );
  }

  // Afficher la bibliothèque si demandé
  if (showLibrary) {
    return (
      <EmotionalFeedback state="calm" footer={appFooter}>
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
      <EmotionalFeedback state="calm" footer={appFooter}>
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

  // Afficher le journal des rêves si demandé
  if (showDreams) {
    return (
      <EmotionalFeedback state="calm" footer={appFooter}>
        <DreamJournal
          user={user}
          onBack={() => {
            setShowDreams(false);
            setShowHome(true);
          }}
        />
      </EmotionalFeedback>
    );
  }

  // Afficher le profil spirituel si demandé
  if (showSpiritualProfile) {
    return (
      <EmotionalFeedback state="calm" footer={appFooter}>
        <SpiritualProfile
          user={user}
          onBack={() => {
            setShowSpiritualProfile(false);
            setShowHome(true);
          }}
        />
      </EmotionalFeedback>
    );
  }

  // Afficher les ressources si demandé
  if (showResources) {
    return (
      <EmotionalFeedback state="calm" footer={appFooter}>
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

  // Si aucun état n'est actif, retour à la landing page
  return (
    <LandingPage
      onGetStarted={(mode) => {
        setAuthMode(mode === "register" ? "register" : "login");
        setShowLanding(false);
        setShowAuth(true);
      }}
    />
  );
}