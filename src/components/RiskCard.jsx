// src/components/RiskCard.jsx - Dynamic Responsive Semi-Brutalist Risk Card
import React from 'react';
import { AlertTriangle, ShieldCheck, Clock, Zap } from 'lucide-react';
import { getRiskFromUvi } from '../utils/risk';

export default function RiskCard({ uvIndex = 0 }) {
  const riskInfo = getRiskFromUvi(uvIndex);
  const uviValue = parseFloat(uvIndex) || 0;
  const meterPercent = Math.min(100, Math.max(0, (uviValue / 14) * 100));

  return (
    <div
      className="brutal-card risk-evaluation-card"
      style={{
        '--risk-color': riskInfo.color,
        '--risk-bg': riskInfo.bgLight
      }}
    >
      <div className="risk-card-header">
        <div className="risk-title-group">
          <span className="card-micro-label font-mono">RISK ASSESSMENT</span>
          <div
            className="brutal-risk-hero"
            style={{
              backgroundColor: riskInfo.color,
              color: '#ffffff'
            }}
          >
            {uviValue >= 6 ? (
              <AlertTriangle size={18} strokeWidth={2.5} />
            ) : (
              <ShieldCheck size={18} strokeWidth={2.5} />
            )}
            <span className="font-mono">{riskInfo.level}</span>
          </div>
        </div>

        <div className="burntime-stat-box">
          <div className="burntime-micro-label font-mono">
            <Clock size={12} />
            <span>BURNOUT LIMIT</span>
          </div>
          <span className="burntime-huge font-mono" style={{ color: riskInfo.color }}>
            {riskInfo.burnTime}
          </span>
        </div>
      </div>

      {/* Brutalist Segmented UV Meter */}
      <div className="brutal-meter-block">
        <div className="meter-label-row font-mono">
          <span>UV SCALE // 0 — 14+</span>
          <span className="current-uvi-badge font-mono">{uviValue.toFixed(1)} UVI</span>
        </div>
        <div className="brutal-meter-track">
          <div
            className="brutal-meter-bar"
            style={{
              width: `${meterPercent}%`,
              backgroundColor: riskInfo.color
            }}
          />
          <div className="meter-grid-line" style={{ left: '21.4%' }} title="Moderate (3.0)" />
          <div className="meter-grid-line" style={{ left: '42.8%' }} title="High (6.0)" />
          <div className="meter-grid-line" style={{ left: '57.1%' }} title="Very High (8.0)" />
          <div className="meter-grid-line" style={{ left: '78.5%' }} title="Extreme (11.0)" />
        </div>
        <div className="meter-scale-markers font-mono">
          <span>0 LOW</span>
          <span>3 MOD</span>
          <span>6 HIGH</span>
          <span>8 V.HIGH</span>
          <span>11+ EXT</span>
        </div>
      </div>

      {/* Advisory recommendations */}
      <div className="risk-advisory-box">
        <div className="advisory-title font-mono">
          <Zap size={14} style={{ color: riskInfo.color }} />
          <span>HEALTH DIRECTIVE:</span>
        </div>
        <p className="advisory-desc">{riskInfo.description}</p>
        <div className="advisory-bullets">
          {riskInfo.recommendations.map((rec, idx) => (
            <div key={idx} className="advisory-item">
              <span className="advisory-bullet-point font-mono">[{idx + 1}]</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
