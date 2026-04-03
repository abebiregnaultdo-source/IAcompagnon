import { useEffect, useState } from "react";

/**
 * Dashboard Admin - Analytics pour améliorer l'accompagnement
 * Accessible via /?admin=<VITE_ADMIN_KEY>
 */
export default function AdminDashboard({ api, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const adminKey = import.meta.env.VITE_ADMIN_KEY || "helo2024admin";

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${api.base}/admin/analytics?key=${adminKey}`
      );
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
        setLastRefresh(new Date());
      }
    } catch (e) {
      setError("Impossible de charger les analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [api.base]);

  if (loading && !data) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader} />
        <p style={styles.loadingText}>Chargement des analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <p style={styles.errorText}>{error}</p>
        <button onClick={fetchAnalytics} style={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  const { summary, techniques, phases, total_interactions } = data;

  return (
    <div style={styles.container}>
      {/* Background gradient */}
      <div style={styles.backgroundGradient} />

      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoContainer}>
              <span style={styles.logo}>HELŌ</span>
              <span style={styles.badge}>Admin</span>
            </div>
            <h1 style={styles.title}>Tableau de bord</h1>
            <p style={styles.subtitle}>
              Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <div style={styles.headerRight}>
            <button
              onClick={fetchAnalytics}
              style={styles.refreshButton}
              disabled={loading}
            >
              {loading ? '↻' : '⟳'} Actualiser
            </button>
            <button onClick={onBack} style={styles.backButton}>
              ← Retour
            </button>
          </div>
        </header>

        {/* KPIs Grid */}
        <section style={styles.kpiGrid}>
          <KPICard
            icon="📊"
            title="Sessions"
            value={summary.sessions_today}
            subtitle={`${summary.sessions_week} cette semaine`}
            trend={summary.sessions_today > 0 ? "up" : "neutral"}
            color="#10B981"
          />
          <KPICard
            icon="👥"
            title="Utilisateurs"
            value={summary.users_today}
            subtitle={`${summary.users_week} cette semaine`}
            trend={summary.users_today > 0 ? "up" : "neutral"}
            color="#3B82F6"
          />
          <KPICard
            icon="💬"
            title="Messages"
            value={summary.messages_today}
            subtitle={`${summary.messages_week} cette semaine`}
            trend={summary.messages_today > 0 ? "up" : "neutral"}
            color="#8B5CF6"
          />
          <KPICard
            icon="⏱️"
            title="Durée moyenne"
            value={`${summary.avg_session_duration_minutes}m`}
            subtitle="par session"
            trend="neutral"
            color="#F59E0B"
          />
        </section>

        {/* Main Grid */}
        <section style={styles.mainGrid}>
          {/* Techniques Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <span style={styles.cardIcon}>🧠</span>
                Techniques utilisées
              </h3>
            </div>
            <div style={styles.cardContent}>
              {Object.entries(techniques).length > 0 ? (
                Object.entries(techniques).map(([tech, count], index) => (
                  <div key={tech} style={styles.listItem}>
                    <div style={styles.listItemLeft}>
                      <span style={{...styles.listRank, background: getRankColor(index)}}>
                        {index + 1}
                      </span>
                      <span style={styles.listItemText}>{formatTechnique(tech)}</span>
                    </div>
                    <div style={styles.progressContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${Math.min((count / Math.max(...Object.values(techniques))) * 100, 100)}%`,
                          background: `linear-gradient(90deg, #10B981, #059669)`
                        }}
                      />
                      <span style={styles.listItemCount}>{count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>📭</span>
                  <p>Aucune donnée encore</p>
                  <p style={styles.emptyHint}>Les techniques apparaîtront ici après les premières conversations</p>
                </div>
              )}
            </div>
          </div>

          {/* Phases Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <span style={styles.cardIcon}>🎯</span>
                Phases thérapeutiques
              </h3>
            </div>
            <div style={styles.cardContent}>
              {Object.entries(phases).length > 0 ? (
                Object.entries(phases).map(([phase, count]) => (
                  <div key={phase} style={styles.phaseItem}>
                    <div style={styles.phaseInfo}>
                      <span style={{...styles.phaseDot, background: getPhaseColor(phase)}} />
                      <span style={styles.phaseName}>{formatPhase(phase)}</span>
                    </div>
                    <span style={styles.phaseCount}>{count}</span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>🌱</span>
                  <p>En attente de données</p>
                </div>
              )}
            </div>
          </div>

          {/* System Health Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <span style={styles.cardIcon}>⚡</span>
                Santé système
              </h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.healthItem}>
                <div style={styles.healthLabel}>
                  <span style={styles.healthIcon}>🚀</span>
                  Temps de réponse
                </div>
                <div style={{
                  ...styles.healthValue,
                  color: summary.avg_response_time_ms < 3000 ? '#10B981' : '#EF4444'
                }}>
                  {summary.avg_response_time_ms > 0
                    ? `${(summary.avg_response_time_ms / 1000).toFixed(1)}s`
                    : '—'}
                </div>
              </div>

              <div style={styles.healthDivider} />

              <div style={styles.healthItem}>
                <div style={styles.healthLabel}>
                  <span style={styles.healthIcon}>🛡️</span>
                  Fallbacks
                </div>
                <div style={{
                  ...styles.healthValue,
                  color: summary.total_fallbacks > 10 ? '#EF4444' : '#10B981'
                }}>
                  {summary.total_fallbacks}
                  {summary.total_fallbacks === 0 && <span style={styles.healthBadge}>Parfait</span>}
                </div>
              </div>

              <div style={styles.healthDivider} />

              <div style={styles.healthItem}>
                <div style={styles.healthLabel}>
                  <span style={styles.healthIcon}>📈</span>
                  Total interactions
                </div>
                <div style={styles.healthValue}>
                  {total_interactions}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>Ces métriques t'aident à comprendre et améliorer l'accompagnement HELŌ</p>
        </footer>
      </div>
    </div>
  );
}

function KPICard({ icon, title, value, subtitle, trend, color }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiHeader}>
        <span style={styles.kpiIcon}>{icon}</span>
        <span style={styles.kpiTitle}>{title}</span>
      </div>
      <div style={styles.kpiValue}>
        <span style={{...styles.kpiNumber, color}}>{value}</span>
        {trend === "up" && <span style={styles.trendUp}>↑</span>}
      </div>
      <div style={styles.kpiSubtitle}>{subtitle}</div>
    </div>
  );
}

// Helper functions
function formatTechnique(tech) {
  const names = {
    'TIPI': 'TIPI (Régulation émotionnelle)',
    'validation_emotionnelle': 'Validation émotionnelle',
    'logotherapie': 'Logothérapie',
    'ancrage': 'Techniques d\'ancrage',
    'respiration': 'Exercices respiratoires',
  };
  return names[tech] || tech;
}

function formatPhase(phase) {
  const names = {
    'ancrage': '🌿 Ancrage',
    'exploration': '🔍 Exploration',
    'integration': '✨ Intégration',
    'cloture': '🎯 Clôture',
  };
  return names[phase] || phase;
}

function getRankColor(index) {
  const colors = ['#F59E0B', '#9CA3AF', '#CD7F32', '#6B7280', '#6B7280'];
  return colors[index] || '#6B7280';
}

function getPhaseColor(phase) {
  const colors = {
    'ancrage': '#10B981',
    'exploration': '#3B82F6',
    'integration': '#8B5CF6',
    'cloture': '#F59E0B',
  };
  return colors[phase] || '#6B7280';
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '400px',
    background: 'linear-gradient(135deg, rgba(123, 168, 192, 0.15) 0%, rgba(90, 143, 168, 0.05) 100%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0F172A',
    gap: '16px',
  },
  loader: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(123, 168, 192, 0.2)',
    borderTopColor: '#7BA8C0',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: '16px',
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0F172A',
    gap: '16px',
  },
  errorIcon: {
    fontSize: '48px',
  },
  errorText: {
    color: '#F87171',
    fontSize: '18px',
  },
  retryButton: {
    padding: '12px 24px',
    background: '#7BA8C0',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {},
  headerRight: {
    display: 'flex',
    gap: '12px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #7BA8C0, #5A8FA8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '2px',
  },
  badge: {
    padding: '4px 12px',
    background: 'rgba(123, 168, 192, 0.2)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#7BA8C0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#F8FAFC',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    margin: 0,
  },
  refreshButton: {
    padding: '10px 20px',
    background: 'rgba(123, 168, 192, 0.1)',
    border: '1px solid rgba(123, 168, 192, 0.3)',
    borderRadius: '8px',
    color: '#7BA8C0',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  backButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94A3B8',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  kpiCard: {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.4))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  kpiIcon: {
    fontSize: '20px',
  },
  kpiTitle: {
    fontSize: '14px',
    color: '#94A3B8',
    fontWeight: '500',
  },
  kpiValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  kpiNumber: {
    fontSize: '36px',
    fontWeight: '700',
  },
  trendUp: {
    color: '#10B981',
    fontSize: '20px',
  },
  kpiSubtitle: {
    fontSize: '13px',
    color: '#64748B',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  card: {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.4))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#F8FAFC',
    margin: 0,
  },
  cardIcon: {
    fontSize: '20px',
  },
  cardContent: {
    padding: '20px 24px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
  },
  listItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  listRank: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0F172A',
  },
  listItemText: {
    fontSize: '14px',
    color: '#E2E8F0',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '120px',
  },
  progressBar: {
    height: '6px',
    borderRadius: '3px',
    flex: 1,
    transition: 'width 0.3s ease',
  },
  listItemCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#10B981',
    minWidth: '30px',
    textAlign: 'right',
  },
  phaseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
  },
  phaseInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  phaseDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  phaseName: {
    fontSize: '14px',
    color: '#E2E8F0',
  },
  phaseCount: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#F8FAFC',
  },
  healthItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
  },
  healthLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#94A3B8',
  },
  healthIcon: {
    fontSize: '18px',
  },
  healthValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#F8FAFC',
  },
  healthBadge: {
    padding: '2px 8px',
    background: 'rgba(16, 185, 129, 0.2)',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#10B981',
  },
  healthDivider: {
    height: '1px',
    background: 'rgba(71, 85, 105, 0.3)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#64748B',
  },
  emptyIcon: {
    fontSize: '40px',
    display: 'block',
    marginBottom: '12px',
  },
  emptyHint: {
    fontSize: '12px',
    color: '#475569',
    marginTop: '4px',
  },
  footer: {
    textAlign: 'center',
    padding: '24px',
    color: '#475569',
    fontSize: '13px',
  },
};

// Add keyframe animation for loader
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
