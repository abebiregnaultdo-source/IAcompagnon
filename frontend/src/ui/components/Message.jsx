/**
 * Bulle de message pour le chat - Style SMS moderne
 */
export default function Message({
  role,
  children,
  isTyping = false,
  timestamp,
}) {
  if (isTyping) {
    return (
      <div
        className="chat-message chat-message-assistant fade-in-left"
        role="status"
        aria-live="polite"
      >
        <div className="chat-bubble chat-bubble-assistant">
          <div
            className="typing-indicator"
            aria-label="Helō est en train d'écrire"
          >
            <div className="typing-dot" aria-hidden="true"></div>
            <div className="typing-dot" aria-hidden="true"></div>
            <div className="typing-dot" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    );
  }

  const isUser = role === "user";
  const label = isUser ? "Vous" : "Helō";
  const animationClass = isUser ? "fade-in-right" : "fade-in-left";

  // Format timestamp si fourni
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={`chat-message chat-message-${role} ${animationClass}`}
      role="article"
      aria-label={`Message de ${label}`}
    >
      <div className={`chat-bubble chat-bubble-${role}`}>
        <div style={{ whiteSpace: "pre-wrap" }}>{children}</div>
      </div>
      {timeStr && (
        <div className="chat-bubble-timestamp" aria-hidden="true">
          {timeStr}
        </div>
      )}
    </div>
  );
}
