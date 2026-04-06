const MODULE_ICONS = {
  creativity: "✨",
  library: "📚",
  dreams: "🌙",
};

const MODULE_LABELS = {
  creativity: "Ouvrir",
  library: "Découvrir",
  dreams: "Explorer",
};

export default function ContextualSuggestion({
  suggestion,
  onClose,
  onAction,
}) {
  if (!suggestion) return null;

  const moduleType = suggestion.module || "creativity";
  const icon = MODULE_ICONS[moduleType] || "💡";
  const actionLabel = MODULE_LABELS[moduleType] || "Ouvrir";

  return (
    <div
      style={{
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-md)",
        display: "flex",
        gap: "var(--space-md)",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "var(--font-size-lg)" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: "var(--color-text-primary)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          {suggestion.title || "Suggestion"}
        </div>
        <div
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {suggestion.message}
        </div>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface-2)",
            cursor: "pointer",
            color: "var(--color-text-primary)",
          }}
        >
          {actionLabel}
        </button>
      )}
      <button
        onClick={onClose}
        aria-label="Fermer"
        style={{
          padding: 6,
          border: "none",
          background: "transparent",
          color: "var(--color-text-tertiary)",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    </div>
  );
}
