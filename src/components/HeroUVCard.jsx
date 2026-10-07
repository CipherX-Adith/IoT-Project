// src/components/HeroUVCard.jsx - Integrated Obsidian Hero UV Analysis Card
import React from 'react';
import { getRiskFromUvi } from '../utils/risk';
import { formatUvIndex, formatUvIntensity } from '../utils/format';
import { Activity, Clock, ShieldAlert, Zap } from 'lucide-react';

export default function HeroUVCard({ latestReading }) {
  const hasReading = Boolean(latestReading);
  const uvi = hasReading ? Number(latestReading.uvIndex || 0) : null;
  const intensity = hasReading ? Number(latestReading.uvIntensity || 0) : null;
  const riskInfo = uvi !== null ? getRiskFromUvi(uvi) : null;
  const nodeId = latestReading?.nodeId || 'SS-001';
  const locationName = latestReading?.locationName || 'College Ground';

  const indicatorPercent = uvi !== null ? Math.min(100, Math.max(0, (uvi / 12) * 100)) : 0;

  return (
    <div className="glass-card hero-uv-card">
      <div className="hero-content-row">
        {/* Left Telemetry & Advisory Area */}
        <div className="hero-left-col">
          <div className="hero-status-pill font-mono">
            <span className="telemetry-live-dot"></span>
            <span>
              {hasReading
                ? `TELEMETRY ACTIVE // ${nodeId} (${locationName.toUpperCase()})`
                : 'WAITING FOR DATA FROM ESP32 SIMULATION...'}
            </span>
          </div>

          {hasReading ? (
            <div className="hero-submetrics-strip font-mono">
              <div className="submetric-item">
                <Activity size={13} className="text-sky-400" />
                <span className="submetric-key">FLUX:</span>
                <span className="submetric-val">{formatUvIntensity(intensity)} mW/cm²</span>
              </div>
              <div className="submetric-item">
                <Clock size={13} style={{ color: riskInfo.color }} />
                <span className="submetric-key">BURNOUT LIMIT:</span>
                <span className="submetric-val" style={{ color: riskInfo.color }}>
                  {riskInfo.burnTime}
                </span>
              </div>
            </div>
          ) : (
            <p className="hero-waiting-hint">
              Start your Wokwi ESP32 simulation to stream live solar radiation telemetry.
            </p>
          )}

          {hasReading && (
            <div className="hero-directive-snippet">
              <span className="directive-tag font-mono">
                <Zap size={11} style={{ color: riskInfo.color }} /> DIRECTIVE:
              </span>
              <span className="directive-text">{riskInfo.description}</span>
            </div>
          )}
        </div>

        {/* Right Big Metric Readout */}
        <div className="hero-right-col">
          {hasReading ? (
            <div className="hero-readout-active">
              <div className="hero-number-cluster">
                <span className="hero-huge-uvi font-mono" style={{ color: riskInfo.color }}>
                  {formatUvIndex(uvi)}
                </span>
                <span className="hero-unit-tag font-mono">UVI</span>
              </div>
              <div
                className="hero-risk-pill font-mono"
                style={{
                  backgroundColor: `${riskInfo.color}22`,
                  color: riskInfo.color,
                  borderColor: riskInfo.color
                }}
              >
                <ShieldAlert size={14} />
                <span>{riskInfo.level}</span>
              </div>
            </div>
          ) : (
            <div className="hero-readout-empty">
              <h2 className="hero-empty-heading">No reading yet</h2>
              <span className="hero-empty-subtext">Awaiting initial sensor packet</span>
            </div>
          )}
        </div>
      </div>

      {/* Signature Segmented Rainbow UV Meter Scale */}
      <div className="uv-scale-section">
        <div className="uv-scale-track">
          <div className="scale-seg seg-low" style={{ flex: 3 }} title="0-3 Low"></div>
          <div className="scale-seg seg-mod" style={{ flex: 3 }} title="3-6 Moderate"></div>
          <div className="scale-seg seg-high" style={{ flex: 2 }} title="6-8 High"></div>
          <div className="scale-seg seg-vhigh" style={{ flex: 3 }} title="8-11 Very High"></div>
          <div className="scale-seg seg-ext" style={{ flex: 1 }} title="11-12+ Extreme"></div>

          {/* Dynamic Pin Indicator */}
          {hasReading && (
            <div
              className="scale-active-pin"
              style={{ left: `${indicatorPercent}%`, borderColor: riskInfo.color }}
            >
              <div className="pin-head-dot" style={{ backgroundColor: riskInfo.color }}></div>
            </div>
          )}
        </div>

        <div className="scale-ticks-row font-mono">
          <span>0</span>
          <span>3</span>
          <span>6</span>
          <span>8</span>
          <span>11</span>
          <span>12+</span>
        </div>
      </div>
    </div>
  );
}
