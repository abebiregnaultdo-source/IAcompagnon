import { useState } from "react";

/**
 * Composant d'accès rapide aux mantras personnels
 * Affichable en overlay ou en modal
 */
export default function MantrasQuickAccess({ user, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const extendedProfile = user?.extended_profile;
  const mantras = extendedProfile?.mantras || [];
  const messageCentral = extendedProfile?.message_central;
  const faSign = extendedProfile?.fa_divination;
  const numerologie = extendedProfile?.numerologie;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!extendedProfile) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button style={styles.closeButton} onClick={onClose}>x</button>
          <h2 style={styles.title}>Mes Mantras</h2>
          <p style={styles.emptyMessage}>
            Ton profil spirituel n'a pas encore été créé.
            Parle avec Helō pour explorer tes mantras personnels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>x</button>

        <h2 style={styles.title}>Mes Mantras</h2>

        {/* Message central */}
        {messageCentral && (
          <div style={styles.centralMessage}>
            <div style={styles.sectionLabel}>Message Central</div>
            <p style={styles.centralText}>"{messageCentral}"</p>
          </div>
        )}

        {/* Mantras */}
        {mantras.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Mantras Personnels</div>
            <div style={styles.mantrasList}>
              {mantras.map((mantra, index) => (
                <div
                  key={index}
                  style={styles.mantraCard}
                  onClick={() => copyToClipboard(mantra, index)}
                >
                  <span style={styles.mantraText}>"{mantra}"</span>
                  <span style={styles.copyHint}>
                    {copiedIndex === index ? "Copié !" : "Tap pour copier"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signe Fâ */}
        {faSign && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Signe Fâ</div>
            <div style={styles.faCard}>
              <div style={styles.faName}>{faSign.signe}</div>
              <div style={styles.faSignification}>"{faSign.signification}"</div>
            </div>
          </div>
        )}

        {/* Guidance numérologique */}
        {numerologie?.chemin_signification && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Chemin de Vie {numerologie.chemin_de_vie}</div>
            <p style={styles.numerologieText}>{numerologie.chemin_signification}</p>
          </div>
        )}

        {/* Bouton de respiration */}
        <div style={styles.breathingSection}>
          <p style={styles.breathingText}>
            Prends une respiration profonde et répète ton mantra préféré
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "var(--space-lg)",
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "var(--color-background)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-xl)",
    maxWidth: "500px",
    width: "100%",
    maxHeight: "80vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  closeButton: {
    position: "absolute",
    top: "var(--space-md)",
    right: "var(--space-md)",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "var(--color-text-tertiary)",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "var(--transition-fast)",
  },
  title: {
    fontSize: "var(--font-size-xl)",
    fontWeight: "var(--font-weight-semibold)",
    marginBottom: "var(--space-xl)",
    color: "var(--color-text-primary)",
    textAlign: "center",
  },
  centralMessage: {
    background: "linear-gradient(135deg, var(--color-primary), var(--color-primary))",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
    marginBottom: "var(--space-lg)",
    color: "white",
  },
  centralText: {
    fontSize: "var(--font-size-md)",
    fontStyle: "italic",
    margin: 0,
    lineHeight: "var(--line-height-relaxed)",
  },
  section: {
    marginBottom: "var(--space-lg)",
  },
  sectionLabel: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "var(--space-sm)",
    fontWeight: "var(--font-weight-medium)",
  },
  mantrasList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-sm)",
  },
  mantraCard: {
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-md)",
    cursor: "pointer",
    transition: "var(--transition-fast)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-xs)",
  },
  mantraText: {
    fontSize: "var(--font-size-md)",
    color: "var(--color-text-primary)",
    fontStyle: "italic",
  },
  copyHint: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-tertiary)",
  },
  faCard: {
    background: "var(--color-surface-2)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-md)",
    textAlign: "center",
  },
  faName: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-primary)",
    marginBottom: "var(--space-xs)",
  },
  faSignification: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    fontStyle: "italic",
  },
  numerologieText: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    margin: 0,
    lineHeight: "var(--line-height-relaxed)",
  },
  breathingSection: {
    marginTop: "var(--space-xl)",
    paddingTop: "var(--space-lg)",
    borderTop: "1px solid var(--color-border)",
    textAlign: "center",
  },
  breathingText: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
    fontStyle: "italic",
    margin: 0,
  },
  emptyMessage: {
    color: "var(--color-text-secondary)",
    textAlign: "center",
    lineHeight: "var(--line-height-relaxed)",
  },
};
