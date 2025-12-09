import { useEffect, useState } from "react";
import Text from "./components/Text";
import Panel from "./components/Panel";
import Button from "./components/Button";

/**
 * Dashboard Admin - Analytics pour améliorer l'accompagnement
 * Accessible via /?admin=helo2024admin
 */
export default function AdminDashboard({ api, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(
          `${api.base}/admin/analytics?key=helo2024admin`
        );
        const json = await res.json();
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      } catch (e) {
        setError("Impossible de charger les analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [api.base]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-background)",
        }}
      >
        <Text>Chargement des analytics...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-background)",
        }}
      >
        <Text color="error">{error}</Text>
      </div>
    );
  }

  const { summary, techniques, phases, total_interactions } = data;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a2e",
        padding: "var(--space-xl)",
        color: "white",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-2xl)",
          }}
        >
          <div>
            <Text
              as="h1"
              size="2xl"
              style={{ color: "white", marginBottom: "var(--space-xs)" }}
            >
              Dashboard Admin
            </Text>
            <Text size="sm" style={{ color: "#8892b0" }}>
              Analytics pour améliorer l'accompagnement HELŌ
            </Text>
          </div>
          <Button onClick={onBack} style={{ background: "#4a5568" }}>
            ← Retour
          </Button>
        </div>

        {/* KPIs principaux */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-lg)",
            marginBottom: "var(--space-2xl)",
          }}
        >
          <KPICard
            title="Sessions aujourd'hui"
            value={summary.sessions_today}
            subtitle={`${summary.sessions_week} cette semaine`}
            color="#4ade80"
          />
          <KPICard
            title="Utilisateurs uniques"
            value={summary.users_today}
            subtitle={`${summary.users_week} cette semaine`}
            color="#60a5fa"
          />
          <KPICard
            title="Messages échangés"
            value={summary.messages_today}
            subtitle={`${summary.messages_week} cette semaine`}
            color="#f472b6"
          />
          <KPICard
            title="Durée moy. session"
            value={`${summary.avg_session_duration_minutes} min`}
            subtitle="Temps passé avec HELŌ"
            color="#fbbf24"
          />
        </div>

        {/* Stats secondaires */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-xl)",
          }}
        >
          {/* Techniques utilisées */}
          <Panel
            style={{ background: "#16213e", border: "1px solid #2d3748", padding: "var(--space-lg)" }}
          >
            <Text
              as="h3"
              style={{ color: "white", marginBottom: "var(--space-md)" }}
            >
              Techniques thérapeutiques
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {Object.entries(techniques).length > 0 ? (
                Object.entries(techniques).map(([tech, count]) => (
                  <div
                    key={tech}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#a0aec0" }}>{tech}</Text>
                    <div
                      style={{
                        background: "#4ade80",
                        padding: "2px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {count}
                    </div>
                  </div>
                ))
              ) : (
                <Text style={{ color: "#64748b" }}>Aucune donnée encore</Text>
              )}
            </div>
          </Panel>

          {/* Phases */}
          <Panel
            style={{ background: "#16213e", border: "1px solid #2d3748", padding: "var(--space-lg)" }}
          >
            <Text
              as="h3"
              style={{ color: "white", marginBottom: "var(--space-md)" }}
            >
              Phases thérapeutiques
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {Object.entries(phases).length > 0 ? (
                Object.entries(phases).map(([phase, count]) => (
                  <div
                    key={phase}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#a0aec0" }}>{phase}</Text>
                    <div
                      style={{
                        background: "#60a5fa",
                        padding: "2px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {count}
                    </div>
                  </div>
                ))
              ) : (
                <Text style={{ color: "#64748b" }}>Aucune donnée encore</Text>
              )}
            </div>
          </Panel>

          {/* Santé système */}
          <Panel
            style={{ background: "#16213e", border: "1px solid #2d3748", padding: "var(--space-lg)" }}
          >
            <Text
              as="h3"
              style={{ color: "white", marginBottom: "var(--space-md)" }}
            >
              Santé du système
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#a0aec0" }}>Temps réponse moy.</Text>
                <Text style={{ color: summary.avg_response_time_ms < 3000 ? "#4ade80" : "#f87171" }}>
                  {summary.avg_response_time_ms} ms
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#a0aec0" }}>Fallbacks (erreurs)</Text>
                <Text style={{ color: summary.total_fallbacks > 10 ? "#f87171" : "#4ade80" }}>
                  {summary.total_fallbacks}
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#a0aec0" }}>Total interactions</Text>
                <Text style={{ color: "#fbbf24" }}>{total_interactions}</Text>
              </div>
            </div>
          </Panel>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "var(--space-2xl)",
            textAlign: "center",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          Ces données t'aident à comprendre ce qui fonctionne le mieux pour tes
          utilisateurs
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, color }) {
  return (
    <Panel
      style={{
        background: "#16213e",
        border: "1px solid #2d3748",
        padding: "var(--space-lg)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Text size="sm" style={{ color: "#8892b0", marginBottom: "var(--space-xs)" }}>
        {title}
      </Text>
      <Text
        as="div"
        size="2xl"
        style={{ color: "white", fontWeight: "700", marginBottom: "var(--space-xs)" }}
      >
        {value}
      </Text>
      <Text size="xs" style={{ color: "#64748b" }}>
        {subtitle}
      </Text>
    </Panel>
  );
}
