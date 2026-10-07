// src/components/UVChart.jsx - Light Theme Analytical History Chart
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatTime } from '../utils/format';
import { getRiskFromUvi } from '../utils/risk';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function UVChart({ readings = [] }) {
  const sorted = [...readings].slice(0, 50).reverse();

  const labels = sorted.map((r) => formatTime(r.timestamp));
  const uviData = sorted.map((r) => Number(r.uvIndex || 0));

  const latestUvi = uviData.length > 0 ? uviData[uviData.length - 1] : 0;
  const currentRisk = getRiskFromUvi(latestUvi);

  const chartData = {
    labels: labels.length > 0 ? labels : ['0', '10', '20', '30', '40', '50'],
    datasets: [
      {
        label: 'UV index',
        data: uviData.length > 0 ? uviData : [],
        borderColor: '#0f172a',
        backgroundColor: (context) => {
          const ctx = context.chart?.ctx;
          if (!ctx) return 'rgba(15, 23, 42, 0.05)';
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, `${currentRisk.color}44`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.25,
        borderWidth: 2.5,
        pointRadius: uviData.length > 25 ? 2 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: currentRisk.color,
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#e2e8f0',
        bodyColor: '#38bdf8',
        titleFont: { family: 'JetBrains Mono', size: 11, weight: '700' },
        bodyFont: { family: 'JetBrains Mono', size: 12, weight: '700' },
        borderColor: '#0f172a',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          title: (items) => `TIME: ${items[0]?.label || ''}`,
          label: (item) => `UV INDEX: ${item.formattedValue} UVI`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { family: 'JetBrains Mono', size: 10 },
          color: '#64748b',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6
        }
      },
      y: {
        min: 0,
        max: 12,
        grid: {
          color: 'rgba(15, 23, 42, 0.07)'
        },
        title: {
          display: true,
          text: 'UV index',
          color: '#64748b',
          font: { family: 'JetBrains Mono', size: 10, weight: '700' }
        },
        ticks: {
          font: { family: 'JetBrains Mono', size: 10 },
          color: '#64748b',
          stepSize: 2
        }
      }
    }
  };

  return (
    <div className="glass-card chart-card-wrapper">
      <div className="card-header-line">
        <div className="header-label-group">
          <TrendingUp size={15} className="text-sky-600" />
          <h3 className="section-title">UV index, last 50 readings</h3>
        </div>
        <div className="chart-legend-chips font-mono">
          <span className="legend-pill pill-low">0-3 LOW</span>
          <span className="legend-pill pill-mod">3-6 MOD</span>
          <span className="legend-pill pill-high">6-8 HIGH</span>
          <span className="legend-pill pill-vhigh">8-11 V.HIGH</span>
          <span className="legend-pill pill-ext">11+ EXT</span>
        </div>
      </div>

      <div className="chart-canvas-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
