"use client";

import type { SiteMetrics } from "@/lib/siteMetrics";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  ArcElement,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const chartFont = { family: "var(--font-outfit), sans-serif" };
const gridColor = "rgba(201,168,76,0.08)";
const tickColor = "#a09888";

const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: "65%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: tickColor,
        font: { ...chartFont, size: 12 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: "#1a1a1a",
      titleColor: "#f5f0e8",
      bodyColor: "#c9a84c",
      borderColor: "rgba(201,168,76,0.3)",
      borderWidth: 1,
      cornerRadius: 8,
      titleFont: { ...chartFont, weight: "bold" },
      bodyFont: chartFont,
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
      },
    },
  },
};

const barOptionsBase: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          font: { ...chartFont, size: 11 },
          callback: (v) => `${v}%`,
          stepSize: 25,
        },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: tickColor,
          font: { ...chartFont, size: 11 },
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a1a",
        titleColor: "#f5f0e8",
        bodyColor: "#c9a84c",
        borderColor: "rgba(201,168,76,0.3)",
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { ...chartFont, weight: "bold" },
        bodyFont: chartFont,
        callbacks: {
          label: (ctx) => ` Success Rate: ${ctx.parsed.y}%`,
        },
      },
    },
};

const COLORS = ["#c9a84c", "#e8d48b", "#8a6f2e", "#e85d75", "#6bb5ff", "#9b86bd", "#5cdba4"];

export function DataCharts({ metrics }: { metrics: SiteMetrics }) {
  const doughnutData: ChartData<"doughnut"> = useMemo(() => {
    const slices = metrics.category_distribution;
    return {
      labels: slices.map((s) => s.label),
      datasets: [
        {
          data: slices.map((s) => s.value),
          backgroundColor: slices.map((_, i) => COLORS[i % COLORS.length]),
          borderColor: "#0e0e0e",
          borderWidth: 3,
          hoverBorderColor: "#f5f0e8",
          hoverBorderWidth: 2,
        },
      ],
    };
  }, [metrics.category_distribution]);

  const barData: ChartData<"bar"> = useMemo(() => {
    const rows = [...metrics.placement_by_year].sort((a, b) => a.year - b.year);
    return {
      labels: rows.map((r) => String(r.year)),
      datasets: [
        {
          label: "Placement Rate",
          data: rows.map((r) => r.rate),
          borderColor: "#c9a84c",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false as const,
          barThickness: 36,
          backgroundColor: (context: {
            chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } };
          }) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "#c9a84c";
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "#c9a84c");
            gradient.addColorStop(1, "rgba(201,168,76,0.15)");
            return gradient;
          },
        },
      ],
    };
  }, [metrics.placement_by_year]);

  const barOptions = useMemo(() => barOptionsBase, []);

  return (
    <div className="charts-grid">
      <div className="chart-card reveal reveal-delay-1">
        <h3 className="chart-title">Model Category Distribution</h3>
        <p className="chart-subtitle">Breakdown of represented talent segments</p>
        <div className="chart-canvas-wrap">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
      <div className="chart-card reveal reveal-delay-2">
        <h3 className="chart-title">Placement Success Rate</h3>
        <p className="chart-subtitle">Year-over-year growth in successful placements</p>
        <div className="chart-canvas-wrap">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
