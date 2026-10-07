// src/components/MonitoringLocations.jsx - Integrated Authority Monitoring Locations Table
import React from 'react';
import { formatRelativeTime, formatUvIndex } from '../utils/format';
import { getRiskFromUvi } from '../utils/risk';
import { ShieldCheck, Radio } from 'lucide-react';

export default function MonitoringLocations({ nodes = [], latestReading }) {
  const hasActiveDevices = Boolean(latestReading);

  return (
    <div className="glass-card monitoring-authority-card">
      <div className="locations-card-header">
        <div className="header-label-group">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h3 className="section-title">Monitoring locations (authority view)</h3>
        </div>
        <div className="authority-status-badge font-mono">
          <Radio size={11} className="text-emerald-400 animate-pulse" />
          <span>{hasActiveDevices ? '1 DEVICE STREAMING' : '0 DEVICES ACTIVE'}</span>
        </div>
      </div>

      <div className="locations-table-container">
        {!hasActiveDevices ? (
          <div className="locations-empty-box font-mono">
            <div className="table-header-mock">
              <span>Node</span>
              <span>Location</span>
              <span>UV index</span>
              <span>Level</span>
              <span>Last seen</span>
            </div>
            <p className="no-devices-msg">No devices online yet. Start the Wokwi simulation to connect.</p>
          </div>
        ) : (
          <table className="glass-authority-table">
            <thead>
              <tr className="font-mono">
                <th>Node</th>
                <th>Location</th>
                <th>UV index</th>
                <th>Level</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node, idx) => {
                const isCurrent = node.id === (latestReading?.nodeId || 'SS-001');
                const uvi = isCurrent ? Number(latestReading?.uvIndex || 0) : (node.lastUvIndex || 0);
                const riskInfo = getRiskFromUvi(uvi);
                const lastSeen = isCurrent ? (latestReading?.timestamp || Date.now()) : (node.lastSeen || Date.now());
                const locationName = node.locationName || latestReading?.locationName || 'College Ground';

                return (
                  <tr key={node.id || idx}>
                    <td className="node-id-cell font-mono">
                      <span className="live-green-dot"></span>
                      <span>{node.id || 'SS-001'}</span>
                    </td>
                    <td className="location-cell">{locationName}</td>
                    <td className="uvi-cell font-mono font-bold" style={{ color: riskInfo.color }}>
                      {formatUvIndex(uvi)} UVI
                    </td>
                    <td>
                      <span
                        className="level-badge font-mono"
                        style={{
                          backgroundColor: `${riskInfo.color}22`,
                          color: riskInfo.color,
                          borderColor: `${riskInfo.color}55`
                        }}
                      >
                        {riskInfo.level}
                      </span>
                    </td>
                    <td className="time-cell font-mono">{formatRelativeTime(lastSeen)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
