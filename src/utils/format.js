// src/utils/format.js - Number and date/time formatting utilities

export function formatTime(timestamp) {
  if (!timestamp) return '--:--:--';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(timestamp) {
  if (!timestamp) return '---';
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '---';
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Never';
  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);

  if (diffSeconds < 5) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatUvIndex(val) {
  if (val === null || val === undefined || isNaN(val)) return '0.0';
  return Number(val).toFixed(1);
}

export function formatUvIntensity(val) {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  return Number(val).toFixed(2);
}

export function formatCoordinate(val, dir) {
  if (val === null || val === undefined || isNaN(val)) return '0.0000°';
  return `${Math.abs(Number(val)).toFixed(4)}° ${dir || ''}`;
}

export function formatDistance(distanceMeters) {
  if (distanceMeters === null || distanceMeters === undefined) return 'Calculating...';
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }
  return `${(distanceMeters / 1000).toFixed(2)} km`;
}

