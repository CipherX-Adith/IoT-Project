// src/components/RealtimeDeploymentMap.jsx - Interactive Real-Time Deployment & Geofence Map
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minimize2, Crosshair, Navigation, Radio, MapPin } from 'lucide-react';

export default function RealtimeDeploymentMap({
  latitude,
  longitude,
  alertRadius = 300,
  locationName = 'Deployment Zone',
  userCoords = null,
  isElevatedRisk = false,
  currentUvi = 0,
  isUserInsidePerimeter = false,
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stationMarkerRef = useRef(null);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const [isEnlarged, setIsEnlarged] = useState(false);

  const latNum = parseFloat(latitude) || 10.063;
  const lonNum = parseFloat(longitude) || 76.326;
  const radNum = parseInt(alertRadius, 10) || 300;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [latNum, lonNum],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Add high-clarity OpenStreetMap tile layer (no API key required)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add zoom control in bottom-left
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const lastCenterRef = useRef({ lat: latNum, lon: lonNum });
  const lastRiskRef = useRef(isElevatedRisk);

  // Pan map only when coordinates actually move
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (!userCoords) {
      const dLat = Math.abs(lastCenterRef.current.lat - latNum);
      const dLon = Math.abs(lastCenterRef.current.lon - lonNum);
      if (dLat > 0.0001 || dLon > 0.0001) {
        lastCenterRef.current = { lat: latNum, lon: lonNum };
        map.panTo([latNum, lonNum]);
      }
    }
  }, [latNum, lonNum, userCoords]);

  // Update Station Marker & Geofence Circle with minimal DOM thrashing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const stationColor = isElevatedRisk ? '#ef4444' : '#10b981';

    const getStationIcon = (risk) =>
      L.divIcon({
        html: `
          <div class="station-map-pin ${risk ? 'risk-high' : 'risk-normal'}">
            <div class="station-pulse-ring"></div>
            <div class="station-pin-head">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="station-badge-label font-mono">SS-001</div>
          </div>
        `,
        className: 'station-div-icon',
        iconSize: [36, 42],
        iconAnchor: [18, 40],
        popupAnchor: [0, -36]
      });

    if (!stationMarkerRef.current) {
      stationMarkerRef.current = L.marker([latNum, lonNum], { icon: getStationIcon(isElevatedRisk) }).addTo(map);
      lastRiskRef.current = isElevatedRisk;
    } else {
      stationMarkerRef.current.setLatLng([latNum, lonNum]);
      if (lastRiskRef.current !== isElevatedRisk) {
        stationMarkerRef.current.setIcon(getStationIcon(isElevatedRisk));
        lastRiskRef.current = isElevatedRisk;
      }
    }

    // Update popup content efficiently
    const popupContent = `
      <div class="map-station-popup font-mono">
        <div class="popup-hdr">SUNSHIELD STATION [SS-001]</div>
        <div class="popup-loc">${locationName}</div>
        <div class="popup-row">
          <span>COORDS:</span>
          <strong>${latNum.toFixed(4)}°N, ${lonNum.toFixed(4)}°E</strong>
        </div>
        <div class="popup-row">
          <span>GEOFENCE:</span>
          <strong>${radNum}M RADIUS</strong>
        </div>
        <div class="popup-row">
          <span>STATUS:</span>
          <strong style="color: ${stationColor}">${currentUvi.toFixed(1)} UVI (${isElevatedRisk ? 'HAZARD' : 'NOMINAL'})</strong>
        </div>
      </div>
    `;
    if (!stationMarkerRef.current.getPopup()) {
      stationMarkerRef.current.bindPopup(popupContent);
    } else {
      stationMarkerRef.current.setPopupContent(popupContent);
    }

    // Geofence Circle
    if (!circleRef.current) {
      circleRef.current = L.circle([latNum, lonNum], {
        radius: radNum,
        color: stationColor,
        weight: 2,
        dashArray: isElevatedRisk ? '5, 5' : '2, 4',
        fillColor: stationColor,
        fillOpacity: isElevatedRisk ? 0.18 : 0.12
      }).addTo(map);
    } else {
      circleRef.current.setLatLng([latNum, lonNum]);
      circleRef.current.setRadius(radNum);
      circleRef.current.setStyle({
        color: stationColor,
        dashArray: isElevatedRisk ? '5, 5' : '2, 4',
        fillColor: stationColor,
        fillOpacity: isElevatedRisk ? 0.18 : 0.12
      });
    }
  }, [latNum, lonNum, radNum, isElevatedRisk, locationName, currentUvi]);

  // Update User Live Location Marker & Connecting Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords && typeof userCoords.latitude === 'number' && typeof userCoords.longitude === 'number') {
      const uLat = userCoords.latitude;
      const uLon = userCoords.longitude;

      const userHtml = `
        <div class="user-map-pin">
          <div class="user-pulse-wave"></div>
          <div class="user-pin-core"></div>
          <div class="user-badge-label font-mono">YOU</div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-div-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([uLat, uLon], { icon: userIcon }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([uLat, uLon]);
        userMarkerRef.current.setIcon(userIcon);
      }

      userMarkerRef.current.bindPopup(`
        <div class="map-station-popup font-mono">
          <div class="popup-hdr" style="color: #0284c7">USER PHYSICAL GPS</div>
          <div class="popup-row">
            <span>POSITION:</span>
            <strong>${uLat.toFixed(4)}°N, ${uLon.toFixed(4)}°E</strong>
          </div>
          <div class="popup-row">
            <span>PERIMETER:</span>
            <strong style="color: ${isUserInsidePerimeter ? (isElevatedRisk ? '#ef4444' : '#10b981') : '#f59e0b'}">
              ${isUserInsidePerimeter ? 'INSIDE ZONE' : 'OUTSIDE ZONE'}
            </strong>
          </div>
        </div>
      `);

      // Draw dashed distance polyline
      if (!polylineRef.current) {
        polylineRef.current = L.polyline([[latNum, lonNum], [uLat, uLon]], {
          color: '#0284c7',
          weight: 2,
          dashArray: '4, 6',
          opacity: 0.8
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs([[latNum, lonNum], [uLat, uLon]]);
      }

      // Auto fit bounds to show both station and user if far apart
      try {
        const bounds = L.latLngBounds([
          [latNum, lonNum],
          [uLat, uLon]
        ]);
        map.fitBounds(bounds.pad(0.25), { maxZoom: 16 });
      } catch (e) {}
    } else {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
    }
  }, [userCoords, latNum, lonNum, isUserInsidePerimeter, isElevatedRisk]);

  // Invalidate map size on enlarge toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [isEnlarged]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latNum, lonNum], 15, { duration: 0.8 });
    }
  };

  return (
    <div
      className={`realtime-map-wrapper ${isEnlarged ? 'map-enlarged' : 'map-minimized'} ${className}`}
    >
      {/* Top HUD Badges */}
      <div className="map-hud-top-bar font-mono">
        <div className="map-radar-tag">
          <span className="radar-live-dot"></span>
          <Radio size={10} className="radar-icon-pulse" />
          <span>REAL-TIME RADAR</span>
        </div>

        <div className="map-hud-actions">
          <button
            type="button"
            className="btn-map-control font-mono"
            onClick={handleRecenter}
            title="Recenter map on station"
          >
            <Crosshair size={11} />
            <span>RECENTER</span>
          </button>

          <button
            type="button"
            className="btn-map-control font-mono btn-enlarge"
            onClick={() => setIsEnlarged(!isEnlarged)}
            title={isEnlarged ? 'Minimize map' : 'Enlarge map view'}
          >
            {isEnlarged ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            <span>{isEnlarged ? 'COLLAPSE' : 'ENLARGE'}</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="realtime-map-canvas" />

      {/* Bottom HUD Badges */}
      <div className="map-hud-bottom-bar font-mono">
        <div className={`map-radius-pill ${isElevatedRisk ? 'pill-danger' : 'pill-safe'}`}>
          <span className="pill-dot"></span>
          <span>{radNum}M GEOFENCE PERIMETER</span>
        </div>

        <div className="map-coords-pill">
          <span>{latNum.toFixed(4)}° N, {lonNum.toFixed(4)}° E</span>
        </div>
      </div>
    </div>
  );
}
