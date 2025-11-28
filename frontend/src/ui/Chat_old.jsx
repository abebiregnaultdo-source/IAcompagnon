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
          // Convertir les logs en messages
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
          <div>
            <Text as="h1" size="lg" style={{ margin: 0 }}>
              Conversation
            </Text>
            <Text size="sm" color="secondary">
              Explorez votre ressenti avec Helō
            </Text>
          </div>
        </div>

        {/* Chat Content */}
        <Panel
          className="avatar-chat-wrap"
          style={{ padding: "var(--space-lg)", boxShadow: "var(--shadow-xs)" }}
        >
          <div aria-label="Avatar thérapeutique">
            <AvatarRoom context={{ phase: scores.phase, scores }} />
          </div>
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
    </div>
  );
}
