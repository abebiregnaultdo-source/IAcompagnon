import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { useDashboardData } from "../hooks/useDashboardData";
import CreationCard from "./components/CreationCard";
import ResourceCard from "./components/ResourceCard";
import Text from "./components/Text";
import Panel from "./components/Panel";
import Tabs from "./components/Tabs";
import "../styles/dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export function Dashboard({ user, onClose }) {
  const device = useDeviceDetection();
  const { history, creations, resources, loading, error } = useDashboardData(
    user.id,
  );
  const [activeTab, setActiveTab] = useState("progression");

  const chartData = React.useMemo(() => {
    if (!history || history.length === 0) return null;
    return {
      labels: history.map((_, i) => `Session ${i + 1}`),
      datasets: [
        {
          label: "Détresse",
          data: history.map((h) => h.detresse || 0),
          borderColor: "#e76f51",
          backgroundColor: "rgba(231,111,81,0.08)",
          fill: true,
        },
        {
          label: "Espoir",
          data: history.map((h) => h.espoir || 0),
          borderColor: "#98c1d9",
          backgroundColor: "rgba(152,193,217,0.08)",
          fill: true,
        },
        {
          label: "Énergie",
          data: history.map((h) => h.energie || 0),
          borderColor: "#f4a261",
          backgroundColor: "rgba(244,162,97,0.08)",
          fill: true,
        },
      ],
    };
  }, [history]);

  if (loading)
    return (
      <div
        className="dc-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>Chargement...</div>
      </div>
    );

  return (
    <div
      className="dc-container"
      style={{ padding: device.isMobile ? "var(--space-md)" : undefined }}
    >
      <div className="dc-inner">
        <div className="dc-header">
          <div>
            <Text as="h1" size="lg" style={{ margin: 0 }}>
              Mon parcours
            </Text>
            <Text size="sm" color="secondary">
              Progression & créations
            </Text>
          </div>
          <div>
            <button className="dc-btn" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
        <Tabs
          tabs={[
            { key: "progression", label: "progression" },
            { key: "creations", label: "creations" },
            { key: "ressources", label: "ressources" },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        <div className="dc-grid">
          <Panel className="dc-panel">
            {activeTab === "progression" && (
              <div>
                {chartData ? (
                  <div style={{ height: 340 }}>
                    <Line data={chartData} />
                  </div>
                ) : (
                  <div>Aucune donnée</div>
                )}
              </div>
            )}

            {activeTab === "creations" && (
              <div style={{ display: "grid", gap: 12 }}>
                {creations.length === 0 ? (
                  <div>Aucune création</div>
                ) : (
                  creations.map((c, i) => <CreationCard key={i} creation={c} />)
                )}
              </div>
            )}

            {activeTab === "ressources" && (
              <div style={{ display: "grid", gap: 12 }}>
                {resources.length === 0 ? (
                  <div>Aucune ressource</div>
                ) : (
                  resources.map((r) => <ResourceCard key={r.id} resource={r} />)
                )}
              </div>
            )}
          </Panel>

          <aside className="dc-aside">
            <div className="dc-card">
              <Text as="div" style={{ fontWeight: 600 }}>
                Résumé
              </Text>
              <Text size="sm" color="secondary">
                {history.length} sessions — {creations.length} créations —{" "}
                {resources.length} ressources
              </Text>
            </div>

            {error && (
              <div className="dc-card" style={{ color: "var(--color-danger)" }}>
                Erreur: {error}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
