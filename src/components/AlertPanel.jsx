// src/components/AlertPanel.jsx - Location-Targeted Public Health Alerts Log
import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Radio, MapPin, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../utils/format';
import { getRiskLevelByName } from '../utils/risk';

export default function AlertPanel({ alerts = [] }) {
  const displayAlerts = alerts.slice(0, 10);

  return (
    <div className="brutal-card alert-card">
      <div className="card-top-bar">
        <div className="bar-title-wrap">
          <Bell size={16} strokeWidth={2.5} />
          <span className="card-section-heading font-mono">LOCATION HAZARDS LOG</span>
        </div>
        <span className="brutal-tag font-mono tag-warning">
          {alerts.length} ALERTS
        </span>
      </div>

      <div className="alerts-stack">
        {displayAlerts.length === 0 ? (
          <div className="alerts-empty-notice font-mono">
            <CheckCircle size={22} className="text-success" />
            <p>NO ACTIVE LOCATION-BASED HAZARDS</p>
            <span>Monitored perimeter is within safe exposure thresholds</span>
          </div>
        ) : (
          displayAlerts.map((alert, idx) => {
            const riskInfo = getRiskLevelByName(alert.risk || 'HIGH');
            const locationName = alert.locationName || 'College Ground';
            const alertRadius = alert.alertRadius || 300;
            const mapsUrl = alert.latitude && alert.longitude 
              ? `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`
              : null;

            return (
              <div
                key={alert.id || idx}
                className="brutal-alert-tile"
                style={{
                  borderLeftColor: riskInfo.color,
                  backgroundColor: riskInfo.bgLight
                }}
              >
                <div className="alert-tile-top font-mono">
                  <div className="alert-badge-group">
                    <AlertTriangle size={14} style={{ color: riskInfo.color }} />
                    <span style={{ color: riskInfo.textColor }}>
                      {alert.risk} HAZARD
                    </span>
                  </div>
                  <span className="alert-time-stamp">
                    {formatRelativeTime(alert.timestamp)}
                  </span>
                </div>

                <div className="alert-tile-body">
                  <p className="alert-text" style={{ color: riskInfo.textColor }}>
                    {alert.message || `${alert.risk} UV radiation detected in ${locationName}`}
                  </p>

                  <div className="alert-footer-tags font-mono">
                    <span className="alert-node-tag">
                      <MapPin size={10} /> {locationName} ({alertRadius}m)
                    </span>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="alert-map-link"
                      >
                        <span>MAP</span>
                        <ExternalLink size={9} />
                      </a>
                    )}
                    <span className="alert-ntfy-tag">
                      <Radio size={10} /> NTFY TARGETED
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
