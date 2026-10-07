// src/components/RecentReadings.jsx - Recent Telemetry Packet Log in Left Column
import React from 'react';
import { Clock } from 'lucide-react';
import { formatTime, formatUvIndex, formatUvIntensity } from '../utils/format';
import { getRiskFromUvi, getRiskLevelByName } from '../utils/risk';

export default function RecentReadings({ readings = [] }) {
  const displayList = readings.slice(0, 6);

  if (displayList.length === 0) return null;

  return (
    <div className="glass-card telemetry-mini-table-card">
      <div className="card-header-line">
        <div className="header-label-group">
          <Clock size={14} className="text-sky-400" />
          <h3 className="section-title">Recent telemetry packets</h3>
        </div>
        <span className="font-mono text-xs text-muted-chip">{readings.length} total</span>
      </div>

      <div className="table-responsive-box">
        <table className="mini-telemetry-table font-mono">
          <thead>
            <tr>
              <th>TIME</th>
              <th>ZONE / NODE</th>
              <th>INTENSITY</th>
              <th>UV INDEX</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {displayList.map((row, idx) => {
              const uvi = Number(row.uvIndex || 0);
              const riskInfo = row.risk ? getRiskLevelByName(row.risk) : getRiskFromUvi(uvi);
              const locationName = row.locationName || 'College Ground';

              return (
                <tr key={row.id || idx}>
                  <td className="text-muted">{formatTime(row.timestamp)}</td>
                  <td>
                    <span className="node-tag-chip">{row.nodeId || 'SS-001'}</span>
                    <span className="loc-sub-tag">{locationName}</span>
                  </td>
                  <td>{formatUvIntensity(row.uvIntensity)} mW/cm²</td>
                  <td className="font-bold" style={{ color: riskInfo.color }}>
                    {formatUvIndex(uvi)} UVI
                  </td>
                  <td>
                    <span
                      className="risk-tag-badge"
                      style={{
                        backgroundColor: `${riskInfo.color}22`,
                        color: riskInfo.color,
                        borderColor: `${riskInfo.color}55`
                      }}
                    >
                      {riskInfo.level}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
