// src/components/NodeStatus.jsx - Semi-Brutalist Hardware Node Status
import React from 'react';
import { Cpu, Wifi, WifiOff, Clock } from 'lucide-react';
import { formatTime, formatRelativeTime } from '../utils/format';

export default function NodeStatus({ node, latestReading }) {
  const nodeId = node?.id || latestReading?.nodeId || 'SS-001';
  const nodeName = node?.name || 'Wokwi ESP32 Node';
  const lastSeen = node?.lastSeen || latestReading?.timestamp || null;

  const isOnline = lastSeen ? (Date.now() - lastSeen < 120000 || node?.status === 'ONLINE') : false;

  return (
    <div className="brutal-card node-card">
      <div className="card-top-bar">
        <div className="bar-title-wrap">
          <Cpu size={16} strokeWidth={2.5} />
          <span className="card-section-heading font-mono">NODE TELEMETRY</span>
        </div>
        <div className={`brutal-tag font-mono ${isOnline ? 'tag-online' : 'tag-offline'}`}>
          {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
          <span>{isOnline ? 'ONLINE' : 'STANDBY'}</span>
        </div>
      </div>

      <div className="node-specs-list">
        <div className="spec-row">
          <span className="spec-key font-mono">NODE_ID</span>
          <span className="spec-val font-mono text-bold">{nodeId}</span>
        </div>

        <div className="spec-row">
          <span className="spec-key font-mono">STATION</span>
          <span className="spec-val">{nodeName}</span>
        </div>

        <div className="spec-row">
          <span className="spec-key font-mono">LAST_PING</span>
          <span className="spec-val font-mono">
            {lastSeen ? `${formatTime(lastSeen)} (${formatRelativeTime(lastSeen)})` : 'Awaiting packet'}
          </span>
        </div>

        <div className="spec-row spec-hw-stack">
          <span className="spec-key font-mono">HARDWARE</span>
          <div className="hw-chips-wrap">
            <span className="hw-badge font-mono">ESP32</span>
            <span className="hw-badge font-mono">ML8511 UV</span>
            <span className="hw-badge font-mono">LCD 16x2</span>
            <span className="hw-badge font-mono">RGB LED</span>
            <span className="hw-badge font-mono">BUZZER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
