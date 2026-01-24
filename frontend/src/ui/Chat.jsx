import { useEffect, useRef, useState, useCallback } from "react";
import AvatarRoom from "./avatar/AvatarRoom";
import Message from "./components/Message";
import Button from "./components/Button";
import Text from "./components/Text";
import Panel from "./components/Panel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

// ============================================================================
// SYNTHÈSE VOCALE - Text-to-Speech natif du navigateur
// ============================================================================
const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const utteranceRef = useRef(null);

  // Obtenir une voix française de qualité
  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    // Priorité: voix françaises premium
    const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
    // Préférer les voix "premium" (Google, Microsoft)
    const premiumVoice = frenchVoices.find(v =>
      v.name.includes('Google') ||
      v.name.includes('Microsoft') ||
      v.name.includes('Natural') ||
      v.name.includes('Neural')
    );
    return premiumVoice || frenchVoices[0] || voices[0];
  }, []);

  const speak = useCallback((text) => {
    if (!voiceEnabled || !text) return;

    // Annuler toute lecture en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getVoice();
    utterance.rate = 0.9; // Légèrement plus lent pour la thérapie
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, getVoice]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleVoice = useCallback(() => {
    if (isSpeaking) stop();
    setVoiceEnabled(prev => !prev);
  }, [isSpeaking, stop]);

  // Charger les voix au démarrage
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return { speak, stop, isSpeaking, voiceEnabled, toggleVoice };
};

// ============================================================================
// COMPOSANT CHAT PRINCIPAL
// ============================================================================
export default function Chat({
  api,
  user,
  onEmotionalStateChange,
  onBackToHome,
  onSwitchToVoice,
}) {
  const device = useDeviceDetection();
  const [messages, setMessages] = useState([]);
  const [welcomeLoaded, setWelcomeLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [scores, setScores] = useState({
    detresse: 50,
    espoir: 50,
    energie: 50,
    phase: "ancrage",
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showAvatarFullscreen, setShowAvatarFullscreen] = useState(false);

  // Synthèse vocale
  const { speak, stop, isSpeaking, voiceEnabled, toggleVoice } = useSpeechSynthesis();

  const viewRef = useRef(null);
  const inputRef = useRef(null);

  // === TRACKING SILENCIEUX ===
  const sessionStartRef = useRef(Date.now());
  const lastResponseTimeRef = useRef(null);
  const messageCountRef = useRef(0);
  const lastTechniqueRef = useRef(null);

  const trackSession = async (eventType, extraData = {}) => {
    try {
      await fetch(api.base + "/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          user_id_hash: user.id,
          event_type: eventType,
          session_duration_ms: Date.now() - sessionStartRef.current,
          message_count: messageCountRef.current,
          timestamp: new Date().toISOString(),
          ...extraData,
        }),
      });
    } catch (e) {
      // Silencieux
    }
  };

  const trackReadingTime = async () => {
    if (lastResponseTimeRef.current) {
      const readingTimeMs = Date.now() - lastResponseTimeRef.current;
      try {
        await fetch(api.base + "/feedback/implicit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            user_id_hash: user.id,
            target: { technique: lastTechniqueRef.current },
            reading_ms: readingTimeMs,
            response_latency_ms: null,
          }),
        });
      } catch (e) {
        // Silencieux
      }
    }
  };

  // Track session start
  useEffect(() => {
    trackSession("session_start");
    return () => {
      trackSession("session_end");
      stop(); // Arrêter la synthèse vocale
    };
  }, []);

  // Charger le message d'accueil
  useEffect(() => {
    const loadWelcomeMessage = async () => {
      if (welcomeLoaded) return;
      setIsTyping(true);

      try {
        const response = await fetch(api.base + "/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: [],
            profile: {
              first_name: user.first_name,
              user_id_hash: user.id,
              is_first_message: true
            },
            policy: {
              tone: user.tone || "neutre",
              phase: "ancrage",
              scores: { detresse: 50, espoir: 50, energie: 50 },
              is_welcome: true
            },
          }),
        });

        if (!response.ok) throw new Error("Backend non disponible");

        const data = await response.json();
        const welcomeText = data.text;
        setMessages([{ role: "assistant", content: welcomeText }]);

        // Lire le message d'accueil si voix activée
        if (voiceEnabled) {
          speak(welcomeText);
        }

        lastTechniqueRef.current = data.technique || "welcome";
        lastResponseTimeRef.current = Date.now();

      } catch (error) {
        const fallbackWelcome = `Bonjour ${user.first_name}. Je suis Helō, ton compagnon. Comment te sens-tu aujourd'hui ?`;
        setMessages([{ role: "assistant", content: fallbackWelcome }]);
        if (voiceEnabled) speak(fallbackWelcome);
      } finally {
        setIsTyping(false);
        setWelcomeLoaded(true);
        setHistoryLoaded(true);
      }
    };

    loadWelcomeMessage();
  }, [api.base, user.first_name, user.id, user.tone, welcomeLoaded]);

  // Auto-scroll
  useEffect(() => {
    viewRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, isTyping]);

  // Sauvegarder l'historique des conversations dans localStorage
  // Pour que la section Créativité puisse proposer des thèmes personnalisés
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(`helo_chat_history_${user.id}`, JSON.stringify(messages));
      } catch (e) {
        // localStorage peut échouer en mode privé
      }
    }
  }, [messages, user.id]);

  // Focus input après chargement
  useEffect(() => {
    if (historyLoaded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [historyLoaded]);

  const send = async () => {
    if (!input.trim() || isSending) return;

    trackReadingTime();
    stop(); // Arrêter toute lecture en cours

    const userMessage = input.trim();
    const newMsgs = [...messages, { role: "user", content: userMessage }];
    setMessages(newMsgs);
    setInput("");
    setIsSending(true);
    setIsTyping(true);
    messageCountRef.current += 1;

    const sendStartTime = Date.now();

    try {
      const cr = await fetch(api.base + "/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
          profile: { first_name: user.first_name, user_id_hash: user.id },
          policy: { tone: user.tone || "neutre", phase: scores.phase, scores },
        }),
      });

      if (!cr.ok) throw new Error("Backend non disponible");

      const data = await cr.json();
      const aiResponse = data.text;

      setIsTyping(false);
      setMessages((m) => [...m, { role: "assistant", content: aiResponse }]);

      // Lire la réponse si voix activée
      if (voiceEnabled) {
        speak(aiResponse);
      }

      lastResponseTimeRef.current = Date.now();
      lastTechniqueRef.current = data.technique || "unknown";

      trackSession("message_exchange", {
        technique: data.technique,
        response_time_ms: Date.now() - sendStartTime,
        phase: scores.phase,
      });

      if (onEmotionalStateChange) {
        onEmotionalStateChange("calm");
      }
    } catch (error) {
      setIsTyping(false);
      const fallbackResponses = [
        `Je t'entends, ${user.first_name}. Prends le temps qu'il te faut. Je suis là.`,
        `Merci de partager cela avec moi. Qu'est-ce qui te pèse le plus ?`,
        `Je comprends. Mettre des mots sur ce qu'on ressent est déjà important.`,
        `Ce que tu vis semble difficile. Je suis là, sans jugement.`,
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setMessages((m) => [...m, { role: "assistant", content: randomResponse }]);
      if (voiceEnabled) speak(randomResponse);
      trackSession("fallback_used", { reason: "backend_error" });
    } finally {
      setIsSending(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      className="fade-in"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafb 0%, #eef3f6 100%)",
        padding: device.isMobile ? "16px" : "32px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header modernisé */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            padding: "16px 20px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={onBackToHome}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                padding: "8px",
                borderRadius: "8px",
                color: "#5A8FA8",
              }}
              aria-label="Retour"
            >
              ←
            </button>

            <div>
              <Text as="h1" size="lg" style={{ margin: 0, color: "#2d3748" }}>
                Helō
              </Text>
              <Text size="sm" style={{ color: "#718096", margin: 0 }}>
                {isSpeaking ? "Je parle..." : isTyping ? "Je réfléchis..." : "Je t'écoute"}
              </Text>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {/* Bouton voix */}
            <button
              onClick={toggleVoice}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: voiceEnabled ? "#5A8FA8" : "#e2e8f0",
                border: "none",
                color: voiceEnabled ? "white" : "#718096",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              title={voiceEnabled ? "Désactiver la voix" : "Activer la voix"}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>

            {/* Bouton consultation vidéo */}
            <button
              onClick={() => setShowAvatarFullscreen(true)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #5A8FA8 0%, #7BA8C0 100%)",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(90, 143, 168, 0.3)",
              }}
              title="Mode consultation"
            >
              📹
            </button>
          </div>
        </div>

        {/* Zone de conversation */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Messages */}
          <div
            ref={viewRef}
            style={{
              minHeight: "400px",
              maxHeight: "calc(100vh - 320px)",
              overflowY: "auto",
              padding: "24px",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "14px 18px",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: m.role === "user"
                      ? "linear-gradient(135deg, #5A8FA8 0%, #7BA8C0 100%)"
                      : "#f7fafc",
                    color: m.role === "user" ? "white" : "#2d3748",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    boxShadow: m.role === "user"
                      ? "0 2px 8px rgba(90, 143, 168, 0.25)"
                      : "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
                <div
                  style={{
                    padding: "14px 18px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "#f7fafc",
                    color: "#718096",
                  }}
                >
                  <span className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div
            style={{
              padding: "16px 24px 24px",
              borderTop: "1px solid #edf2f7",
              background: "#fafbfc",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-end",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Écris ce qui te vient..."
                disabled={isSending}
                rows={1}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "16px",
                  fontSize: "15px",
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                  minHeight: "52px",
                  maxHeight: "120px",
                }}
                onFocus={(e) => e.target.style.borderColor = "#5A8FA8"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              <button
                onClick={send}
                disabled={!input.trim() || isSending}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: input.trim() && !isSending
                    ? "linear-gradient(135deg, #5A8FA8 0%, #7BA8C0 100%)"
                    : "#e2e8f0",
                  border: "none",
                  color: input.trim() && !isSending ? "white" : "#a0aec0",
                  fontSize: "20px",
                  cursor: input.trim() && !isSending ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: input.trim() && !isSending
                    ? "0 2px 8px rgba(90, 143, 168, 0.3)"
                    : "none",
                }}
              >
                {isSending ? "..." : "→"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode consultation plein écran */}
      {showAvatarFullscreen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1000,
            background: "linear-gradient(180deg, #1a202c 0%, #2d3748 100%)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header consultation */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Text as="h2" size="lg" style={{ margin: 0, color: "white" }}>
                Consultation avec Helō
              </Text>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: isSpeaking ? "#48bb78" : "#68d391",
                  animation: isSpeaking ? "pulse 1s infinite" : "none",
                }}
              />
            </div>

            <button
              onClick={() => setShowAvatarFullscreen(false)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Avatar + conversation */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
            {/* Avatar */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <AvatarRoom
                context={{ phase: scores.phase, scores }}
                mode="overlay"
                isSpeaking={isSpeaking || isTyping}
              />
            </div>

            {/* Dernier message + contrôles */}
            <div style={{ textAlign: "center", marginTop: "auto" }}>
              {/* Dernier message de l'IA */}
              {messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "20px 32px",
                    borderRadius: "20px",
                    marginBottom: "24px",
                    maxWidth: "600px",
                    margin: "0 auto 24px",
                  }}
                >
                  <Text style={{ color: "white", fontSize: "16px", lineHeight: "1.6" }}>
                    "{messages[messages.length - 1].content}"
                  </Text>
                </div>
              )}

              {/* Contrôles voix */}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <button
                  onClick={toggleVoice}
                  style={{
                    padding: "14px 28px",
                    borderRadius: "30px",
                    background: voiceEnabled ? "#48bb78" : "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "white",
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {voiceEnabled ? "🔊 Voix activée" : "🔇 Activer la voix"}
                </button>

                {isSpeaking && (
                  <button
                    onClick={stop}
                    style={{
                      padding: "14px 28px",
                      borderRadius: "30px",
                      background: "#e53e3e",
                      border: "none",
                      color: "white",
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    ⏹ Arrêter
                  </button>
                )}
              </div>

              {/* Indicateur d'état */}
              <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: "16px", fontSize: "14px" }}>
                {isSpeaking ? "Helō parle..." : isTyping ? "Helō réfléchit..." : "En attente de votre message"}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* CSS pour l'animation des points */}
      <style>{`
        .typing-dots span {
          animation: blink 1.4s infinite both;
          font-size: 24px;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
