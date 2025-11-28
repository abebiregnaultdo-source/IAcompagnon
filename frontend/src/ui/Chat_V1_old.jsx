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
  
  // NOUVEAU: État pour gérer l'affichage avatar
  const [showAvatarFullscreen, setShowAvatarFullscreen] = useState(false);
  
  const viewRef = useRef(null);

  // Charger l'historique au démarrage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(
          `${api.base}/api/chat/history/${user.id}?limit=20`,
        );
        const data = await res.json();

        if (data.messages && data.messages.length > 0) {
          const historicalMessages = [];
          data.messages.forEach((log) => {
            if (log.messages && Array.isArray(log.messages)) {
              log.messages.forEach((msg) => {
                if (msg.role && msg.content) {
                  historicalMessages.push({
                    role: msg.role,
                    content: msg.content,
                  });
                }
              });
            }
          });

          if (historicalMessages.length > 0) {
            setMessages(historicalMessages);
          }
        }

        setHistoryLoaded(true);
      } catch (error) {
        console.error("Erreur chargement historique:", error);
        setHistoryLoaded(true);
      }
    };

    if (!historyLoaded) {
      loadHistory();
    }
  }, [api.base, user.id, historyLoaded]);

  useEffect(() => {
    viewRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    const newMsgs = [...messages, { role: "user", content: userMessage }];
    setMessages(newMsgs);
    setInput("");
    setIsSending(true);
    setIsTyping(true);

    try {
      // analyze
      const ar = await fetch(api.base + "/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: userMessage }),
      });
      const sc = await ar.json();
      setScores({
        detresse: sc.detresse,
        espoir: sc.espoir,
        energie: sc.energie,
        phase: sc.phase,
      });

      // Mettre à jour l'état émotionnel global
      if (onEmotionalStateChange) {
        if (sc.detresse > 70) {
          onEmotionalStateChange("distress");
        } else if (sc.espoir > 60) {
          onEmotionalStateChange("hope");
        } else {
          onEmotionalStateChange("calm");
        }
      }

      // chat
      const cr = await fetch(api.base + "/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: user.id, messages: newMsgs }),
      });
      const data = await cr.json();

      if (data?.scores?.phase) {
        setScores((s) => ({ ...s, phase: data.scores.phase }));
      }

      setIsTyping(false);
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);
    } catch (error) {
      setIsTyping(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Je rencontre une difficulté technique. Prenons un moment, puis réessayons ensemble.",
        },
      ]);
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
          
          {/* NOUVEAU: Mini avatar cliquable */}
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

          {/* NOUVEAU: Bouton vidéo call */}
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
              </div>
            </Panel>
          </div>
        </Panel>
      </div>

      {/* NOUVEAU: Avatar en plein écran (mode overlay) */}
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
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <AvatarRoom 
              context={{ phase: scores.phase, scores }} 
              mode="overlay"
              isSpeaking={isTyping}
            />
          </div>

          {/* Transcription en bas */}
          <div
            style={{
              padding: "var(--space-lg)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderTop: "1px solid var(--color-border)",
              maxHeight: "30vh",
              overflowY: "auto",
            }}
          >
            <Text size="sm" color="secondary" style={{ marginBottom: "var(--space-sm)" }}>
              Transcription en direct
            </Text>
            {messages.slice(-3).map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "var(--space-sm)",
                  marginBottom: "var(--space-xs)",
                  borderRadius: "var(--radius-md)",
                  background: m.role === "user" ? "var(--color-primary-light)" : "var(--color-surface-1)",
                }}
              >
                <Text size="sm" weight="medium" color={m.role === "user" ? "primary" : "default"}>
                  {m.role === "user" ? "Vous" : "Helō"}:
                </Text>
                <Text size="sm">{m.content}</Text>
              </div>
            ))}
            {isTyping && (
              <div
                style={{
                  padding: "var(--space-sm)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface-1)",
                }}
              >
                <Text size="sm" color="secondary">
                  Helō réfléchit...
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
