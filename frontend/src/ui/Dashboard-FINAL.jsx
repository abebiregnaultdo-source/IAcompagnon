import React from "react";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { useDashboardData } from "../hooks/useDashboardData";
import CreationCard from "./components/CreationCard";
import ResourceCard from "./components/ResourceCard";
import InsightCard from "./components/InsightCard";
import Text from "./components/Text";
import "../styles/dashboard.css";

/**
 * Dashboard helō - Version thérapeutique
 * Sans graphiques, sans onglets, avec insights qualitatifs
 */
export function Dashboard({ user, onClose }) {
  const device = useDeviceDetection();
  const { history, creations, resources, loading, error } = useDashboardData(
    user.id
  );

  // ============================================
  // CALCUL DES INSIGHTS QUALITATIFS
  // ============================================
  const insights = React.useMemo(() => {
    if (!history || history.length === 0) {
      return {
        hasWrittenToday: false,
        energyTrend: null,
        lastCreationDate: null,
        isEmpty: true,
      };
    }

    const today = new Date().toDateString();
    const hasWrittenToday = history.some(
      (h) => new Date(h.date || h.created_at).toDateString() === today
    );

    // Moyenne d'énergie sur les 7 derniers jours
    const recentSessions = history.slice(-7);
    const avgEnergie =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, h) => sum + (h.energie || 0), 0) /
          recentSessions.length
        : 0;

    const energyTrend =
      avgEnergie > 5
        ? "semble un peu plus présente"
        : avgEnergie > 3
        ? "est là, même discrète"
        : "est difficile, c'est normal";

    const lastCreationDate =
      creations && creations.length > 0
        ? new Date(
            creations[0].date || creations[0].created_at
          ).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
          })
        : null;

    return {
      hasWrittenToday,
      energyTrend,
      lastCreationDate,
      isEmpty: false,
    };
  }, [history, creations]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="helo-container helo-loading">
        <div className="helo-spinner">Un instant...</div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      className="helo-container"
      style={{ padding: device.isMobile ? "20px" : undefined }}
    >
      <div className="helo-inner">
        {/* ============================================ */}
        {/* HEADER                                       */}
        {/* ============================================ */}
        <header className="helo-header">
          <div>
            <Text
              as="h1"
              size="xl"
              className="helo-title"
              style={{ margin: 0, fontWeight: 500 }}
            >
              Votre espace
            </Text>
            <Text
              size="sm"
              color="secondary"
              style={{ marginTop: 4, display: "block" }}
            >
              Un lieu pour vous, à votre rythme
            </Text>
          </div>
          <button
            className="helo-btn-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </header>

        {/* ============================================ */}
        {/* INSIGHTS DOUX (PAS DE STATS)                */}
        {/* ============================================ */}
        <div className="helo-insights">
          {insights.isEmpty ? (
            <InsightCard
              icon="💙"
              text="Bienvenue dans votre espace. Prenez le temps qu'il vous faut."
              variant="welcome"
            />
          ) : (
            <>
              {insights.hasWrittenToday && (
                <InsightCard icon="✨" text="Vous avez écrit aujourd'hui" />
              )}

              {insights.energyTrend && history.length > 3 && (
                <InsightCard
                  icon="🌊"
                  text={`Votre énergie ${insights.energyTrend} ces derniers jours`}
                />
              )}

              {insights.lastCreationDate && (
                <InsightCard
                  icon="🕊️"
                  text={`Vous avez créé quelque chose le ${insights.lastCreationDate}`}
                />
              )}
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION : VOS CRÉATIONS                     */}
        {/* ============================================ */}
        <section className="helo-section">
          <Text
            as="h2"
            size="lg"
            style={{ marginBottom: 16, fontWeight: 600 }}
          >
            Ce que vous avez créé
          </Text>

          {!creations || creations.length === 0 ? (
            <div className="helo-empty-state">
              <Text
                size="sm"
                color="secondary"
                style={{ textAlign: "center", lineHeight: 1.6 }}
              >
                Vos créations apparaîtront ici. Il n'y a pas d'urgence.
              </Text>
            </div>
          ) : (
            <div className="helo-creations-grid">
              {creations.map((creation, i) => (
                <CreationCard key={creation.id || i} creation={creation} />
              ))}
            </div>
          )}
        </section>

        {/* ============================================ */}
        {/* SECTION : RESSOURCES (DISCRÈTES)           */}
        {/* ============================================ */}
        {resources && resources.length > 0 && (
          <section className="helo-section">
            <Text
              as="h2"
              size="lg"
              style={{ marginBottom: 16, fontWeight: 600 }}
            >
              Quelques ressources
            </Text>
            <div className="helo-resources-grid">
              {resources.slice(0, 3).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}

        {/* ============================================ */}
        {/* ERREUR (si présente)                        */}
        {/* ============================================ */}
        {error && (
          <div className="helo-error-card">
            <Text size="sm" style={{ color: "var(--text-secondary)" }}>
              Une erreur est survenue : {error}
            </Text>
          </div>
        )}

        {/* ============================================ */}
        {/* FOOTER DOUX                                 */}
        {/* ============================================ */}
        <footer className="helo-footer">
          <Text
            size="xs"
            color="secondary"
            style={{ textAlign: "center", lineHeight: 1.5 }}
          >
            Vous avancez à votre rythme. Aucune pression.
          </Text>
        </footer>
      </div>
    </div>
  );
}
