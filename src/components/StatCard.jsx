// src/components/StatCard.jsx - Integrated Dark Glass Metric Card
import React from 'react';

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  accentColor = '#38bdf8',
  subtext,
  badge,
  badgeType = 'neutral'
}) {
  return (
    <div className="glass-card stat-tile" style={{ '--accent-color': accentColor }}>
      <div className="stat-top-row">
        <span className="stat-label-text font-mono">{title}</span>
        {Icon && (
          <div className="stat-icon-gem" style={{ color: accentColor, borderColor: `${accentColor}40` }}>
            <Icon size={15} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="stat-value-group">
        <div className="stat-number-line">
          <span className="stat-number-val font-mono">{value}</span>
          {unit && <span className="stat-number-unit font-mono">{unit}</span>}
        </div>

        {(subtext || badge) && (
          <div className="stat-bottom-line">
            {badge && (
              <span className={`stat-badge-chip font-mono badge-${badgeType}`}>
                {badge}
              </span>
            )}
            {subtext && <span className="stat-subtext-label">{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
