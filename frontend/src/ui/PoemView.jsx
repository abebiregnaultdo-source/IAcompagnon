import Button from "./components/Button";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { POEMS } from "./poems-data";

export default function PoemView({ poemId, onBack }) {
  const device = useDeviceDetection();
  const poem = POEMS[poemId];

  if (!poem) {
    return (
      <div style={{ padding: "var(--space-xl)", textAlign: "center" }}>
        <p>Poème introuvable.</p>
        <Button onClick={onBack} variant="secondary">Retour</Button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf8f3 0%, #f5f0e8 100%)",
        padding: device.isMobile ? "var(--space-lg)" : "var(--space-2xl)",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <button
          onClick={onBack}
          style={{
            marginBottom: "var(--space-xl)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-primary)",
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            padding: "var(--space-sm) var(--space-md)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          ← Retour
        </button>

        <div
          style={{
            background: "var(--color-surface-1)",
            borderRadius: "var(--radius-xl)",
            padding: device.isMobile ? "var(--space-xl)" : "var(--space-2xl)",
            border: "1px solid rgba(180, 140, 80, 0.2)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: device.isMobile ? "30px" : "38px",
              fontWeight: 400,
              color: "#2a2520",
              textAlign: "center",
              marginBottom: "var(--space-sm)",
              letterSpacing: "0.03em",
            }}
          >
            {poem.title}
          </h1>

          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-tertiary)",
              textAlign: "center",
              fontStyle: "italic",
              marginBottom: "var(--space-md)",
            }}
          >
            {poem.author} {poem.year ? `(${poem.year})` : ""}
          </p>

          <div
            style={{
              width: "60px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #c9a050, transparent)",
              margin: "0 auto var(--space-xl)",
            }}
          />

          {poem.intro && (
            <p
              style={{
                fontSize: "var(--font-size-base)",
                color: "var(--color-text-secondary)",
                fontStyle: "italic",
                textAlign: "center",
                maxWidth: "560px",
                margin: "0 auto var(--space-xl)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              {poem.intro}
            </p>
          )}

          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: device.isMobile ? "16px" : "18px",
              lineHeight: 1.9,
              color: "#3a3530",
              textAlign: "center",
            }}
          >
            {poem.stanzas && poem.stanzas.length > 0 ? (
              poem.stanzas.map((stanza, i) => (
                <div key={i} style={{ marginBottom: "var(--space-lg)" }}>
                  {stanza.map((line, j) => (
                    <p key={j} style={{ margin: 0 }}>{line}</p>
                  ))}
                </div>
              ))
            ) : (
              <p style={{ color: "var(--color-text-tertiary)", fontStyle: "italic" }}>
                Le texte de ce poème n'est pas encore disponible.
              </p>
            )}
          </div>

          {poem.note && (
            <div
              style={{
                marginTop: "var(--space-2xl)",
                paddingTop: "var(--space-lg)",
                borderTop: "1px solid rgba(180, 140, 80, 0.2)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-tertiary)",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              {poem.note}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "var(--space-xl)" }}>
          <Button onClick={onBack} variant="secondary">
            Retour à la bibliothèque
          </Button>
        </div>
      </div>
    </div>
  );
}
