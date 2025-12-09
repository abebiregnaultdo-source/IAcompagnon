import { useEffect, useRef, useState } from "react";
import AvatarRoom from "./avatar/AvatarRoom";
import Message from "./components/Message";
import Input from "./components/Input";
import Button from "./components/Button";
import Text from "./components/Text";
import Panel from "./components/Panel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

export default function Chat({
  api,
  user,
  onEmotionalStateChange,
  onBackToHome,
  onSwitchToVoice,
}) {
  const device = useDeviceDetection();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Bonjour ${user.first_name}. Je suis là pour vous accompagner. Prenez votre temps, nous avançons à votre rythme.`,
    },
  ]);
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

  // État pour gérer l'affichage avatar
  const [showAvatarFullscreen, setShowAvatarFullscreen] = useState(false);

  const viewRef = useRef(null);

  // === TRACKING SILENCIEUX ===
  const sessionStartRef = useRef(Date.now());
  const lastResponseTimeRef = useRef(null);
  const messageCountRef = useRef(0);
  const lastTechniqueRef = useRef(null);

  // Envoyer les analytics de session (silencieux, non-bloquant)
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
      // Silencieux - on ne bloque pas l'UX
    }
  };

  // Tracker le temps de lecture (temps entre réponse reçue et nouveau message)
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

    // Track session end on unmount
    return () => {
      trackSession("session_end");
    };
  }, []);

  // Charger l'historique au démarrage
  useEffect(() => {
    setHistoryLoaded(true);
  }, []);

  useEffect(() => {
    viewRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async () => {
    if (!input.trim() || isSending) return;

    // Track temps de lecture avant d'envoyer un nouveau message
    trackReadingTime();

    const userMessage = input.trim();
    const newMsgs = [...messages, { role: "user", content: userMessage }];
    setMessages(newMsgs);
    setInput("");
    setIsSending(true);
    setIsTyping(true);
    messageCountRef.current += 1;

    const sendStartTime = Date.now();

    try {
      // Essayer d'appeler le backend
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
      setIsTyping(false);
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);

      // Track la réponse reçue
      lastResponseTimeRef.current = Date.now();
      lastTechniqueRef.current = data.technique || "unknown";

      // Track message échange
      trackSession("message_exchange", {
        technique: data.technique,
        response_time_ms: Date.now() - sendStartTime,
        phase: scores.phase,
      });

      // Mettre à jour l'état émotionnel si disponible
      if (onEmotionalStateChange) {
        onEmotionalStateChange("calm");
      }
    } catch (error) {
      // Mode dégradé: réponse empathique locale
      setIsTyping(false);
      const fallbackResponses = [
        `Je t'entends, ${user.first_name}. Prends le temps qu'il te faut pour exprimer ce que tu ressens. Je suis là.`,
        `Merci de partager cela avec moi. C'est important ce que tu traverses. Qu'est-ce qui te pèse le plus en ce moment ?`,
        `Je comprends. Parfois, mettre des mots sur ce qu'on ressent est déjà un premier pas. Continue, je t'écoute.`,
        `Ce que tu vis semble difficile. N'hésite pas à en dire plus si tu le souhaites. Il n'y a pas de jugement ici.`,
        `Je suis là pour t'accompagner. Prends ton temps, et dis-moi ce dont tu as besoin.`,
      ];
      const randomResponse =
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setMessages((m) => [
        ...m,
        { role: "assistant", content: randomResponse },
      ]);

      // Track fallback utilisé
      trackSession("fallback_used", { reason: "backend_error" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fade-in"
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
            marginBottom: "var(--space-xl)",
            paddingBottom: "var(--space-md)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={onBackToHome}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              padding: "0",
              color: "var(--color-primary)",
            }}
            aria-label="Retour à l'accueil"
          >
            ←
          </button>
          
          {/* Mini avatar cliquable */}
          <div
            onClick={() => setShowAvatarFullscreen(true)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7BA8C0 0%, #5A8FA8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s",
              fontSize: "20px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            title="Voir l'avatar en consultation"
          >
            ✨
          </div>

          <div style={{ flex: 1 }}>
            <Text as="h1" size="lg" style={{ margin: 0 }}>
              Conversation
            </Text>
            <Text size="sm" color="secondary">
              Explorez votre ressenti avec Helō
            </Text>
          </div>

          {/* Bouton vidéo call */}
          <button
            onClick={() => setShowAvatarFullscreen(true)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(123, 168, 192, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(123, 168, 192, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(123, 168, 192, 0.3)";
            }}
            title="Voir en consultation"
            aria-label="Ouvrir la vue consultation avec avatar"
          >
            📹
          </button>
        </div>

        {/* Chat Content - SANS avatar inline */}
        <Panel
          className="avatar-chat-wrap"
          style={{ padding: "var(--space-lg)", boxShadow: "var(--shadow-xs)" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
          >
            <div
              className="chat-container"
              ref={viewRef}
              role="log"
              aria-live="polite"
              aria-label="Historique de conversation"
              style={{
                minHeight: "400px",
                maxHeight: "600px",
                overflowY: "auto",
                padding: "var(--space-md)",
              }}
            >
              {messages.map((m, i) => (
                <Message key={i} role={m.role}>
                  {m.content}
                </Message>
              ))}
              {isTyping && <Message role="assistant" isTyping={true} />}
            </div>

            <Panel
              style={{
                padding: "var(--space-md)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Écrivez ce qui vous vient..."
                helpText="Appuyez sur Entrée pour envoyer"
                disabled={isSending}
                aria-label="Message à envoyer"
              />
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-sm)",
                  marginTop: "var(--space-sm)",
                }}
              >
                <Button
                  onClick={send}
                  disabled={!input.trim() || isSending}
                  style={{ flex: 1 }}
                >
                  {isSending ? "Envoi..." : "Envoyer"}
                </Button>
                <button
                  onClick={() => {
                    // Basculer vers le mode vocal (VoiceChat)
                    if (window.confirm("Passer en mode appel vocal avec votre compagnon ?")) {
                      if (onSwitchToVoice) {
                        onSwitchToVoice();
                      }
                    }
                  }}
                  style={{
                    padding: "var(--space-md) var(--space-lg)",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #7BA8C0, #5A8FA8)",
                    border: "none",
                    color: "white",
                    fontSize: "var(--font-size-lg)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(123, 168, 192, 0.3)",
                  }}
                  title="Passer en mode vocal (appel)"
                  aria-label="Basculer vers le mode vocal"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(123, 168, 192, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(123, 168, 192, 0.3)";
                  }}
                >
                  🎤
                </button>
              </div>
            </Panel>
          </div>
        </Panel>
      </div>

      {/* Avatar en plein écran (mode overlay) - SANS transcription redondante */}
      {showAvatarFullscreen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1000,
            background: "var(--color-background)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header plein écran */}
          <div
            style={{
              padding: "var(--space-lg)",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
              <Text as="h2" size="lg" style={{ margin: 0 }}>
                Consultation
              </Text>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#4CAF50",
                  animation: "pulse 2s infinite",
                }}
              />
              <Text size="sm" color="secondary">
                En ligne
              </Text>
            </div>

            <button
              onClick={() => setShowAvatarFullscreen(false)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "var(--color-error)",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              aria-label="Fermer la consultation"
              title="Retour au chat"
            >
              ✕
            </button>
          </div>

          {/* Avatar Room plein écran */}
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center" 
          }}>
            <AvatarRoom 
              context={{ phase: scores.phase, scores }} 
              mode="overlay"
              isSpeaking={isTyping}
            />
            
            {/* État simple en bas (PAS de transcription redondante) */}
            <div
              style={{
                marginTop: "var(--space-xl)",
                textAlign: "center",
                padding: "var(--space-md) var(--space-xl)",
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "var(--radius-full)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Text size="sm" color={isTyping ? "primary" : "secondary"} weight="medium">
                {isTyping ? "✨ Je réfléchis..." : "💭 Je vous écoute"}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
