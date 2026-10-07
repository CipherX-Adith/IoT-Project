// src/utils/geo.js - Geolocation and Proximity Calculations

/**
 * Calculates distance between two GPS coordinates using the Haversine formula
 * @returns distance in meters
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if a given distance is within the alert radius
 */
export function isWithinPerimeter(distanceMeters, radiusMeters = 300) {
  if (distanceMeters === null || distanceMeters === undefined) return false;
  return distanceMeters <= radiusMeters;
}

/**
 * Formats distance into meters or kilometers
 */
export function formatDistance(distanceMeters) {
  if (distanceMeters === null || distanceMeters === undefined) return 'Calculating...';
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }
  return `${(distanceMeters / 1000).toFixed(2)} km`;
}
