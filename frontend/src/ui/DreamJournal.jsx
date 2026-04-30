import { useState, useEffect } from "react";
import { getDreams, addDream, updateDream, deleteDream } from "../lib/supabase";
import Button from "./components/Button";
import Input from "./components/Input";

/**
 * Journal des rêves avec interprétation
 */
const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://helo-backend.onrender.com";

export default function DreamJournal({ user, onBack }) {
  const [dreams, setDreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);
  const [error, setError] = useState(null);
  const [analyzingDreamId, setAnalyzingDreamId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    dream_date: new Date().toISOString().slice(0, 10),
    therapeutic_context: "",
    self_interpretation: "",
    emotional_intensity: 5,
    is_recurring: false,
    themes: [],
  });

  const COMMON_THEMES = [
    "famille", "perte", "transformation", "eau", "vol",
    "poursuite", "maison", "voyage", "travail", "ancêtres"
  ];

  useEffect(() => {
    loadDreams();
  }, [user?.id]);

  const loadDreams = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getDreams(user.id);
      setDreams(data);
    } catch (e) {
      console.error("Error loading dreams:", e);
      setError("Erreur lors du chargement des rêves");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      setError("Le contenu du rêve est requis");
      return;
    }

    setIsLoading(true);
    try {
      if (selectedDream) {
        await updateDream(selectedDream.id, formData);
      } else {
        await addDream(user.id, formData);
      }
      await loadDreams();
      resetForm();
    } catch (e) {
      console.error("Error saving dream:", e);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (dreamId) => {
    if (!confirm("Supprimer ce rêve ?")) return;
    try {
      await deleteDream(dreamId);
      await loadDreams();
      if (selectedDream?.id === dreamId) {
        resetForm();
      }
    } catch (e) {
      console.error("Error deleting dream:", e);
      setError("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      dream_date: new Date().toISOString().slice(0, 10),
      therapeutic_context: "",
      self_interpretation: "",
      emotional_intensity: 5,
      is_recurring: false,
      themes: [],
    });
    setSelectedDream(null);
    setShowForm(false);
  };

  const editDream = (dream) => {
    setSelectedDream(dream);
    setFormData({
      title: dream.title || "",
      content: dream.content || "",
      dream_date: dream.dream_date || new Date().toISOString().slice(0, 10),
      therapeutic_context: dream.therapeutic_context || "",
      self_interpretation: dream.self_interpretation || "",
      emotional_intensity: dream.emotional_intensity || 5,
      is_recurring: dream.is_recurring || false,
      themes: dream.themes || [],
    });
    setShowForm(true);
  };

  const toggleTheme = (theme) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }));
  };

  const requestAIAnalysis = async (dream) => {
    if (analyzingDreamId) return;
    setAnalyzingDreamId(dream.id);
    try {
      const dreamContext = [
        `Contenu du rêve : ${dream.content}`,
        dream.themes?.length ? `Thèmes identifiés : ${dream.themes.join(", ")}` : "",
        dream.therapeutic_context ? `Contexte thérapeutique : ${dream.therapeutic_context}` : "",
        dream.self_interpretation ? `Interprétation personnelle : ${dream.self_interpretation}` : "",
        dream.is_recurring ? "Ce rêve est récurrent." : "",
        `Intensité émotionnelle : ${dream.emotional_intensity}/10`,
      ].filter(Boolean).join("\n");

      const response = await fetch(`${API_BASE}/generate/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Je voudrais ton éclairage sur ce rêve que j'ai fait :\n\n${dreamContext}`,
            },
          ],
          profile: {
            first_name: user?.user_metadata?.first_name || "ami",
            user_id_hash: user?.id ? user.id.slice(0, 16) : "anon",
            dream_analysis_mode: true,
          },
          policy: {
            tone: "enveloppant",
            phase: "exploration",
            dream_analysis: true,
          },
        }),
      });

      let fullText = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === "chunk" && parsed.text) {
                fullText += parsed.text;
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }
      }

      if (fullText.trim()) {
        await updateDream(dream.id, { ai_interpretation: fullText.trim() });
        await loadDreams();
      }
    } catch (e) {
      console.error("Error requesting AI analysis:", e);
      setError("Erreur lors de l'analyse. Le serveur met peut-être un moment à se réveiller — réessaie dans 30 secondes.");
    } finally {
      setAnalyzingDreamId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Retour
        </button>
        <h1 style={styles.title}>Journal des Rêves</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          {showForm ? "Annuler" : "+ Nouveau rêve"}
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError(null)} style={styles.dismissError}>x</button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>
            {selectedDream ? "Modifier le rêve" : "Enregistrer un rêve"}
          </h2>

          <div style={styles.formRow}>
            <Input
              label="Date du rêve"
              type="date"
              value={formData.dream_date}
              onChange={(e) => setFormData({ ...formData, dream_date: e.target.value })}
            />
            <Input
              label="Titre (optionnel)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Un titre pour te souvenir..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contenu du rêve *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Décris ton rêve avec le plus de détails possible..."
              style={styles.textarea}
              rows={5}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contexte thérapeutique</label>
            <input
              type="text"
              value={formData.therapeutic_context}
              onChange={(e) => setFormData({ ...formData, therapeutic_context: e.target.value })}
              placeholder="Ex: Travail transgénérationnel, hypnose régression..."
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mon interprétation</label>
            <textarea
              value={formData.self_interpretation}
              onChange={(e) => setFormData({ ...formData, self_interpretation: e.target.value })}
              placeholder="Qu'est-ce que ce rêve signifie pour toi ?"
              style={styles.textarea}
              rows={3}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Intensité émotionnelle: {formData.emotional_intensity}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.emotional_intensity}
                onChange={(e) => setFormData({ ...formData, emotional_intensity: parseInt(e.target.value) })}
                style={styles.slider}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                />
                Rêve récurrent
              </label>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Thèmes</label>
            <div style={styles.themesGrid}>
              {COMMON_THEMES.map(theme => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => toggleTheme(theme)}
                  style={{
                    ...styles.themeChip,
                    ...(formData.themes.includes(theme) ? styles.themeChipActive : {})
                  }}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.formActions}>
            <Button type="button" variant="secondary" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sauvegarde..." : selectedDream ? "Modifier" : "Enregistrer"}
            </Button>
          </div>
        </form>
      )}

      {/* Dreams list */}
      {isLoading && !showForm ? (
        <div style={styles.loading}>Chargement...</div>
      ) : dreams.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🌙</div>
          <p>Aucun rêve enregistré</p>
          <p style={styles.emptyHint}>
            Les rêves sont une porte vers l'inconscient.
            Commence à les noter pour mieux te connaître.
          </p>
        </div>
      ) : (
        <div style={styles.dreamsList}>
          {dreams.map(dream => (
            <div key={dream.id} style={styles.dreamCard}>
              <div style={styles.dreamHeader}>
                <div>
                  <div style={styles.dreamDate}>{formatDate(dream.dream_date)}</div>
                  {dream.title && <div style={styles.dreamTitle}>{dream.title}</div>}
                </div>
                <div style={styles.dreamMeta}>
                  {dream.is_recurring && <span style={styles.recurringBadge}>Récurrent</span>}
                  <span style={styles.intensityBadge}>
                    Intensité: {dream.emotional_intensity}/10
                  </span>
                </div>
              </div>

              <div style={styles.dreamContent}>
                {dream.content.length > 200
                  ? dream.content.slice(0, 200) + "..."
                  : dream.content}
              </div>

              {dream.themes?.length > 0 && (
                <div style={styles.dreamThemes}>
                  {dream.themes.map(theme => (
                    <span key={theme} style={styles.themeTag}>{theme}</span>
                  ))}
                </div>
              )}

              {dream.therapeutic_context && (
                <div style={styles.dreamContext}>
                  Contexte: {dream.therapeutic_context}
                </div>
              )}

              {dream.self_interpretation && (
                <div style={styles.dreamInterpretation}>
                  <strong>Mon interprétation:</strong> {dream.self_interpretation}
                </div>
              )}

              {dream.ai_interpretation && (
                <div style={styles.aiInterpretation}>
                  <strong>Interprétation Helō:</strong> {dream.ai_interpretation}
                </div>
              )}

              {analyzingDreamId === dream.id && (
                <div style={styles.analyzingState}>
                  <div style={styles.analyzingDots}>
                    <span style={styles.dot} />
                    <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                    <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                  </div>
                  Helō analyse ton rêve...
                </div>
              )}

              <div style={styles.dreamActions}>
                {!dream.ai_interpretation && (
                  <button
                    onClick={() => requestAIAnalysis(dream)}
                    disabled={!!analyzingDreamId}
                    style={{
                      ...styles.actionButton,
                      color: analyzingDreamId ? "var(--color-text-tertiary)" : "var(--color-accent-calm)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Demander l'éclairage de Helō
                  </button>
                )}
                {dream.ai_interpretation && (
                  <button
                    onClick={() => requestAIAnalysis(dream)}
                    disabled={!!analyzingDreamId}
                    style={{
                      ...styles.actionButton,
                      color: "var(--color-text-tertiary)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    Renouveler l'analyse
                  </button>
                )}
                <button onClick={() => editDream(dream)} style={styles.actionButton}>
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(dream.id)}
                  style={{ ...styles.actionButton, color: "var(--color-accent-alert)" }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "var(--color-background)",
    padding: "var(--space-lg)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--space-xl)",
    flexWrap: "wrap",
    gap: "var(--space-md)",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "var(--color-primary)",
    cursor: "pointer",
    fontSize: "var(--font-size-md)",
    padding: "var(--space-sm)",
  },
  title: {
    fontSize: "var(--font-size-xl)",
    fontWeight: "var(--font-weight-semibold)",
    margin: 0,
  },
  addButton: {
    background: "var(--color-primary)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-sm) var(--space-md)",
    cursor: "pointer",
    fontSize: "var(--font-size-sm)",
  },
  error: {
    background: "var(--color-accent-alert)",
    color: "white",
    padding: "var(--space-md)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--space-lg)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dismissError: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "1.2rem",
  },
  form: {
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-xl)",
    marginBottom: "var(--space-xl)",
  },
  formTitle: {
    fontSize: "var(--font-size-lg)",
    marginBottom: "var(--space-lg)",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--space-md)",
    marginBottom: "var(--space-md)",
  },
  formGroup: {
    marginBottom: "var(--space-md)",
  },
  label: {
    display: "block",
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    marginBottom: "var(--space-xs)",
  },
  input: {
    width: "100%",
    padding: "var(--space-md)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-md)",
    background: "var(--color-background)",
    color: "var(--color-text-primary)",
  },
  textarea: {
    width: "100%",
    padding: "var(--space-md)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-md)",
    background: "var(--color-background)",
    color: "var(--color-text-primary)",
    resize: "vertical",
    fontFamily: "inherit",
  },
  slider: {
    width: "100%",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-sm)",
    cursor: "pointer",
    fontSize: "var(--font-size-md)",
  },
  themesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-sm)",
  },
  themeChip: {
    padding: "var(--space-xs) var(--space-sm)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-full)",
    background: "transparent",
    cursor: "pointer",
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    transition: "var(--transition-fast)",
  },
  themeChipActive: {
    background: "var(--color-primary)",
    color: "white",
    borderColor: "var(--color-primary)",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "var(--space-md)",
    marginTop: "var(--space-lg)",
  },
  loading: {
    textAlign: "center",
    padding: "var(--space-2xl)",
    color: "var(--color-text-tertiary)",
  },
  empty: {
    textAlign: "center",
    padding: "var(--space-2xl)",
    color: "var(--color-text-secondary)",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "var(--space-lg)",
  },
  emptyHint: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
    maxWidth: "300px",
    margin: "var(--space-md) auto 0",
  },
  dreamsList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-lg)",
  },
  dreamCard: {
    background: "var(--color-surface-1)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-lg)",
    border: "1px solid var(--color-border)",
  },
  dreamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "var(--space-md)",
    flexWrap: "wrap",
    gap: "var(--space-sm)",
  },
  dreamDate: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
  },
  dreamTitle: {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
  },
  dreamMeta: {
    display: "flex",
    gap: "var(--space-sm)",
    alignItems: "center",
  },
  recurringBadge: {
    background: "var(--color-accent-calm)",
    color: "var(--color-text-primary)",
    padding: "var(--space-xs) var(--space-sm)",
    borderRadius: "var(--radius-full)",
    fontSize: "var(--font-size-xs)",
  },
  intensityBadge: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-tertiary)",
  },
  dreamContent: {
    lineHeight: "var(--line-height-relaxed)",
    color: "var(--color-text-primary)",
    marginBottom: "var(--space-md)",
  },
  dreamThemes: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-xs)",
    marginBottom: "var(--space-md)",
  },
  themeTag: {
    background: "var(--color-surface-2)",
    padding: "var(--space-xs) var(--space-sm)",
    borderRadius: "var(--radius-full)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-secondary)",
  },
  dreamContext: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
    fontStyle: "italic",
    marginBottom: "var(--space-sm)",
  },
  dreamInterpretation: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    background: "var(--color-surface-2)",
    padding: "var(--space-md)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--space-sm)",
  },
  aiInterpretation: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-primary)",
    background: "rgba(123, 168, 192, 0.1)",
    padding: "var(--space-md)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--space-sm)",
  },
  dreamActions: {
    display: "flex",
    gap: "var(--space-md)",
    marginTop: "var(--space-md)",
    paddingTop: "var(--space-md)",
    borderTop: "1px solid var(--color-border)",
  },
  actionButton: {
    background: "none",
    border: "none",
    color: "var(--color-primary)",
    cursor: "pointer",
    fontSize: "var(--font-size-sm)",
    padding: 0,
  },
  analyzingState: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-sm)",
    padding: "var(--space-md)",
    background: "rgba(123, 168, 192, 0.08)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-sm)",
    color: "var(--color-primary)",
    fontStyle: "italic",
    marginBottom: "var(--space-sm)",
  },
  analyzingDots: {
    display: "flex",
    gap: "4px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--color-primary)",
    animation: "pulse 1s ease-in-out infinite",
  },
};
