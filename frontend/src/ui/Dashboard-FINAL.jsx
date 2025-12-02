import React, { useState, useEffect } from "react";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import Button from "./components/Button";

/**
 * Page Parcours - Historique des sessions
 * Version minimaliste centrée sur l'historique des conversations
 */
export function Dashboard({ user, onClose, onResumeSession }) {
  const device = useDeviceDetection();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, [user]);

  async function loadSessions() {
    try {
      setLoading(true);
      const response = await fetch(`/api/history/${user.id}`);

      if (!response.ok) {
        throw new Error("Impossible de charger l'historique");
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError(err.message);
      // Mode démo si erreur
      setSessions([]);
    } finally {
      setLoading(false);
    }
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
                const isToday = formatDate(session.created_at).startsWith("Aujourd'hui");

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
                      {isToday && (
                        <Button
                          onClick={() => onResumeSession && onResumeSession(session.id)}
                          style={{
                            flex: "1 1 auto",
                            minWidth: "120px",
                          }}
                        >
                          Reprendre
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={() => {
                          // TODO: Implémenter vue détaillée session
                          console.log("View session:", session.id);
                        }}
                        style={{
                          flex: "1 1 auto",
                          minWidth: "120px",
                        }}
                      >
                        Relire
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
