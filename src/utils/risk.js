// src/utils/risk.js - Centralized UV risk logic and presentation helpers

export const RISK_LEVELS = {
  LOW: {
    level: 'LOW',
    label: 'Low Risk',
    minUvi: 0,
    maxUvi: 2.99,
    color: '#10b981', // emerald-500
    bgLight: '#ecfdf5', // emerald-50
    border: '#a7f3d0', // emerald-200
    textColor: '#065f46', // emerald-800
    badgeBg: '#d1fae5',
    description: 'Safe for normal outdoor activities with minimal risk of sunburn.',
    recommendations: [
      'Minimal sun protection required for most individuals.',
      'Wear sunglasses on bright days.'
    ],
    burnTime: '60+ minutes'
  },
  MODERATE: {
    level: 'MODERATE',
    label: 'Moderate Risk',
    minUvi: 3,
    maxUvi: 5.99,
    color: '#f59e0b', // amber-500
    bgLight: '#fffbeb', // amber-50
    border: '#fde68a', // amber-200
    textColor: '#92400e', // amber-800
    badgeBg: '#fef3c7',
    description: 'Moderate risk of harm from unprotected sun exposure.',
    recommendations: [
      'Apply broad spectrum SPF 30+ sunscreen.',
      'Wear sunglasses and a wide-brimmed hat.',
      'Seek shade during midday peak hours (11 AM - 3 PM).'
    ],
    burnTime: '30 - 45 minutes'
  },
  HIGH: {
    level: 'HIGH',
    label: 'High Risk',
    minUvi: 6,
    maxUvi: 7.99,
    color: '#f97316', // orange-500
    bgLight: '#fff7ed', // orange-50
    border: '#fed7aa', // orange-200
    textColor: '#9a3412', // orange-800
    badgeBg: '#ffedd5',
    description: 'High risk of harm from unprotected exposure. Skin damage can occur quickly.',
    recommendations: [
      'Reduce time in direct sun between 10 AM and 4 PM.',
      'Generously apply SPF 50+ sunscreen every 2 hours.',
      'Wear UV-blocking sunglasses, protective shirt, and hat.'
    ],
    burnTime: '15 - 25 minutes'
  },
  VERY_HIGH: {
    level: 'VERY HIGH',
    label: 'Very High Risk',
    minUvi: 8,
    maxUvi: 10.99,
    color: '#ef4444', // red-500
    bgLight: '#fef2f2', // red-50
    border: '#fecaca', // red-200
    textColor: '#991b1b', // red-800
    badgeBg: '#fee2e2',
    description: 'Very high risk of rapid skin and eye damage. Extra precautions essential.',
    recommendations: [
      'Minimize outdoor exposure during peak daylight.',
      'Seek shade whenever outdoors and wear full UV protection.',
      'Reapply water-resistant SPF 50+ sunscreen frequently.'
    ],
    burnTime: '10 - 15 minutes'
  },
  EXTREME: {
    level: 'EXTREME',
    label: 'Extreme Risk',
    minUvi: 11,
    maxUvi: 99,
    color: '#8b5cf6', // purple-500
    bgLight: '#f5f3ff', // purple-50
    border: '#ddd6fe', // purple-200
    textColor: '#5b21b6', // purple-800
    badgeBg: '#ede9fe',
    description: 'Critical danger of sunburn within minutes. Extreme unprotected UV hazard.',
    recommendations: [
      'Take all precautions: unprotected skin will burn in minutes.',
      'Avoid sun exposure between 10 AM and 4 PM if possible.',
      'Shirt, sunglasses, wide hat, and SPF 50+ sunscreen are mandatory.'
    ],
    burnTime: '< 10 minutes'
  }
};

export function getRiskFromUvi(uvi) {
  const val = parseFloat(uvi) || 0;
  if (val < 3) return RISK_LEVELS.LOW;
  if (val < 6) return RISK_LEVELS.MODERATE;
  if (val < 8) return RISK_LEVELS.HIGH;
  if (val < 11) return RISK_LEVELS.VERY_HIGH;
  return RISK_LEVELS.EXTREME;
}

export function getRiskLevelByName(name) {
  if (!name) return RISK_LEVELS.LOW;
  const key = String(name).trim().toUpperCase().replace(/\s+/g, '_');
  if (key === 'VERY_HIGH' || key === 'VERYHIGH') return RISK_LEVELS.VERY_HIGH;
  return RISK_LEVELS[key] || RISK_LEVELS.LOW;
}
