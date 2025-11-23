import React, { useEffect, useRef } from "react";
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export function Radar({ scores }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Détresse", "Espoir", "Énergie"],
        datasets: [
          {
            label: "État émotionnel",
            data: [scores.detresse, scores.espoir, scores.energie],
            backgroundColor: "rgba(123, 168, 192, 0.15)",
            borderColor: "rgba(123, 168, 192, 0.6)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(123, 168, 192, 0.8)",
            pointBorderColor: "rgba(123, 168, 192, 1)",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              color: "rgba(122, 128, 136, 0.6)",
              font: {
                size: 11,
                family: "Inter, sans-serif",
              },
            },
            grid: {
              color: "rgba(197, 217, 227, 0.3)",
            },
            pointLabels: {
              color: "rgba(58, 64, 72, 0.8)",
              font: {
                size: 13,
                family: "Inter, sans-serif",
                weight: 500,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(242, 246, 247, 0.95)",
            titleColor: "rgba(58, 64, 72, 1)",
            bodyColor: "rgba(90, 96, 104, 1)",
            borderColor: "rgba(197, 217, 227, 0.5)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 13,
              family: "Inter, sans-serif",
              weight: 600,
            },
            bodyFont: {
              size: 12,
              family: "Inter, sans-serif",
            },
          },
        },
        animation: {
          duration: 800,
          easing: "easeOutQuart",
        },
      },
    });
    return () => chart.destroy();
  }, [scores]);

  return (
    <div
      style={{
        background: "var(--color-surface-2)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-lg)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "var(--space-md)",
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-secondary)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        Phase actuelle :{" "}
        <span
          style={{
            color: "var(--color-primary)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          {scores.phase || "ancrage"}
        </span>
      </div>
      <canvas ref={canvasRef} width={260} height={260} />
      <div
        style={{
          marginTop: "var(--space-md)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-tertiary)",
          textAlign: "center",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        Cette visualisation reflète votre état émotionnel actuel
      </div>
    </div>
  );
}
