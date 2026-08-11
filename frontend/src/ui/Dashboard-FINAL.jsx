import React, { useState, useEffect } from "react";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import Button from "./components/Button";
import { getConversations } from "../lib/supabase";
import { analyzeParcours } from "../lib/parcoursAnalysis";

/**
 * Page Parcours - Historique des sessions
 * Version minimaliste centrée sur l'historique des conversations
 */
export function Dashboard({ user, onClose, onResumeSession }) {
  const device = useDeviceDetection();
  const [sessions, setSessions] = useState([]);
  const [parcours, setParcours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, [user]);

  async function loadSessions() {
    try {
      setLoading(true);
      setError(null);
      // Lecture directe depuis Supabase (source de vérité des conversations),
      // au lieu d'un endpoint backend /api/history qui n'existe pas (404).
      const conversations = await getConversations(user.id, 50);
      // Adapter au format attendu par le rendu (created_at, emotional_themes…).
      const mapped = (conversations || []).map((c) => ({
        id: c.id,
        created_at: c.created_at || c.updated_at,
        messages: c.messages || [],
        message_count: Array.isArray(c.messages) ? c.messages.length : 0,
        summary: c.summary || "",
        emotional_themes:
          (c.emotional_state && c.emotional_state.themes) || [],
      }));
      setSessions(mapped);
      // Analyse d'évolution par IA (Haiku lit le sens, tous vocabulaires) ;
      // fallback local par mots-clés si le backend est indisponible.
      loadParcoursSynthese(conversations);
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError(err.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  // Récupère la synthèse d'évolution : d'abord l'IA (backend), sinon fallback
  // local par mots-clés. On normalise vers un format d'affichage commun.
  async function loadParcoursSynthese(conversations) {
    try {
      const res = await fetch(
        `https://helo-backend.onrender.com/api/parcours/${user.id}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.available && data.parcours) {
          const p = data.parcours;
          setParcours({
            source: "ia",
            themes: p.themes_recurrents || [],
            emerging: p.ce_qui_emerge || null,
            fading: p.ce_qui_sapaise || null,
            reflet: p.reflet || "",
          });
          return;
        }
      }
    } catch (e) {
      console.warn("[HELO] parcours IA indisponible, fallback local:", e);
    }
    // Fallback : analyse locale par mots-clés.
    const local = analyzeParcours(conversations);
    setParcours({
      source: "local",
      themes: (local.topThemes || []).map((t) => t.label),
      emerging: local.emerging ? local.emerging.label : null,
      fading: local.fading ? local.fading.label : null,
      reflet: "",
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === 1) {
      return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long'
    });
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-2xl)",
            paddingBottom: "var(--space-lg)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-md)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}
          >
            ← Retour
          </button>

          <h1
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-primary)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
            }}
          >
            📖 Mon parcours
          </h1>

          <div style={{ width: "60px" }} /> {/* Spacer for flex centering */}
        </header>

        {/* Synthèse d'évolution — le "parcours" au sens propre : ce qui revient,
            ce qui émerge, ce qui s'apaise. Analysé par IA (Haiku) à partir du sens
            des échanges, avec fallback local par mots-clés. */}
        {parcours && parcours.themes && parcours.themes.length > 0 && (
          <div
            style={{
              background: "var(--color-surface-1)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-xl)",
              marginBottom: "var(--space-xl)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontFamily: "var(--font-family-display)",
                color: "var(--color-text-primary)",
                margin: "0 0 var(--space-md)",
              }}
            >
              Votre cheminement
            </h2>
            {parcours.reflet && (
              <p
                style={{
                  fontSize: "var(--font-size-md)",
                  color: "var(--color-text-primary)",
                  margin: "0 0 var(--space-lg)",
                  lineHeight: 1.7,
                }}
              >
                {parcours.reflet}
              </p>
            )}
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                margin: "0 0 var(--space-md)",
                lineHeight: 1.6,
              }}
            >
              Ce qui revient le plus souvent dans ce que vous avez déposé :
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
              {parcours.themes.map((label, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "var(--font-size-sm)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--color-accent-calm)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            {(parcours.emerging || parcours.fading) && (
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                  margin: "var(--space-md) 0 0",
                  lineHeight: 1.6,
                }}
              >
                {parcours.emerging && (
                  <>Depuis quelque temps, un nouveau fil apparaît : <strong>{parcours.emerging}</strong>. </>
                )}
                {parcours.fading && (
                  <>Un thème qui revient moins qu'avant : <strong>{parcours.fading}</strong>.</>
                )}
              </p>
            )}
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-tertiary)",
                margin: "var(--space-md) 0 0",
                fontStyle: "italic",
              }}
            >
              Un reflet de vos mots, pas un diagnostic. Vous seul·e savez ce que
              vous traversez.
            </p>
          </div>
        )}

        {/* Sessions list */}
        <div style={{ marginBottom: "var(--space-xl)" }}>
          {sessions.length === 0 ? (
            <div
              style={{
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-2xl)",
                textAlign: "center",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--font-size-md)",
                  color: "var(--color-text-secondary)",
                  marginBottom: "var(--space-lg)",
                }}
              >
                Vous n'avez pas encore de sessions.
              </p>
              <Button
                onClick={onClose}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                💬 Commencer maintenant
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-lg)",
              }}
            >
              {sessions.map((session) => {
                return (
                  <div
                    key={session.id}
                    style={{
                      background: "var(--color-surface-1)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-xl)",
                      border: "1px solid var(--color-border)",
                      transition: "var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(123, 168, 192, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Session header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "var(--space-md)",
                        flexWrap: "wrap",
                        gap: "var(--space-sm)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--font-size-sm)",
                          color: "var(--color-text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-xs)",
                        }}
                      >
                        📅 {formatDate(session.created_at)}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--font-size-sm)",
                          color: "var(--color-text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-xs)",
                        }}
                      >
                        💬 {session.message_count || 0} échanges
                      </span>
                    </div>

                    {/* Session summary/themes */}
                    {session.emotional_themes && session.emotional_themes.length > 0 && (
                      <div
                        style={{
                          fontSize: "var(--font-size-md)",
                          color: "var(--color-text-primary)",
                          marginBottom: "var(--space-lg)",
                          fontStyle: "italic",
                        }}
                      >
                        {session.emotional_themes.join(", ")}
                      </div>
                    )}

                    {/* Actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-sm)",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        onClick={() => onResumeSession && onResumeSession(session.id)}
                        style={{
                          flex: "1 1 auto",
                          minWidth: "120px",
                        }}
                      >
                        Reprendre cette conversation
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Load more button */}
        {sessions.length > 0 && sessions.length >= 10 && (
          <div style={{ textAlign: "center" }}>
            <Button
              variant="secondary"
              onClick={loadSessions}
              style={{
                minWidth: "200px",
              }}
            >
              Charger plus
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export par défaut pour compatibilité
export default Dashboard;
