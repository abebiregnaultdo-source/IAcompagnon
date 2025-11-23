export default function ContextualSuggestion({
  suggestion,
  onClose,
  onAction,
}) {
  if (!suggestion) return null;
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
      <div style={{ fontSize: "var(--font-size-lg)" }}>💡</div>
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
          }}
        >
          Ouvrir
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
