// src/components/SessionStatsAndAlerts.jsx - Integrated Session Analytics & Location Radar
import React, { useState } from 'react';
import { formatRelativeTime } from '../utils/format';
import { getRiskLevelByName } from '../utils/risk';
import { calculateDistanceMeters, isWithinPerimeter, formatDistance } from '../utils/geo';
import { MapPin, Navigation, Radio, ExternalLink, ShieldAlert, ShieldCheck, Crosshair, Edit3, Check, X, Bell } from 'lucide-react';

export default function SessionStatsAndAlerts({
  readings = [],
  alerts = [],
  node,
  latestReading,
  onUpdateLocation
}) {
  // Session metrics
  const totalReadings = readings.length;
  const uviList = readings.map((r) => Number(r.uvIndex || 0));
  const peakUvi = uviList.length > 0 ? Math.max(...uviList).toFixed(1) : '--';
  const avgUvi =
    uviList.length > 0
      ? (uviList.reduce((acc, v) => acc + v, 0) / uviList.length).toFixed(1)
      : '--';

  const latitude = node?.latitude ?? latestReading?.latitude ?? 10.063;
  const longitude = node?.longitude ?? latestReading?.longitude ?? 76.326;
  const alertRadius = node?.alertRadius || 300;
  const locationName = node?.locationName || 'College Ground / Campus Field';

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(locationName);
  const [editLat, setEditLat] = useState(String(latitude));
  const [editLon, setEditLon] = useState(String(longitude));
  const [editRadius, setEditRadius] = useState(String(alertRadius));

  const [userCoords, setUserCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Compute live user distance
  const userDistance = userCoords
    ? calculateDistanceMeters(userCoords.latitude, userCoords.longitude, latitude, longitude)
    : null;

  const isUserInsidePerimeter = isWithinPerimeter(userDistance, alertRadius);
  const currentUvi = Number(latestReading?.uvIndex || 0);
  const isElevatedRisk = currentUvi >= 6;

  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('GPS not supported in browser');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lon = Number(pos.coords.longitude.toFixed(5));
        setUserCoords({ latitude: lat, longitude: lon });
        setEditLat(String(lat));
        setEditLon(String(lon));

        if (onUpdateLocation) {
          onUpdateLocation({
            locationName: editName || 'My Real Location',
            latitude: lat,
            longitude: lon,
            alertRadius: parseInt(editRadius, 10) || 300
          });
        }
        setIsLocating(false);
      },
      (err) => {
        setGeoError(err.message || 'Unable to fetch GPS location');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    const lat = parseFloat(editLat);
    const lon = parseFloat(editLon);
    const rad = parseInt(editRadius, 10) || 300;

    if (onUpdateLocation && !isNaN(lat) && !isNaN(lon)) {
      onUpdateLocation({
        locationName: editName.trim() || 'Custom Sector',
        latitude: lat,
        longitude: lon,
        alertRadius: rad
      });
    }
    setIsEditing(false);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const displayAlerts = alerts.slice(0, 4);

  return (
    <div className="glass-card session-sidebar-card">
      {/* 1. This Session Analytics */}
      <div className="sidebar-section">
        <h3 className="section-title">This session</h3>

        <div className="session-numbers-grid">
          <div className="session-stat-tile">
            <span className="stat-big-num font-mono">{peakUvi}</span>
            <span className="stat-label-muted">Peak</span>
          </div>

          <div className="session-stat-tile">
            <span className="stat-big-num font-mono">{avgUvi}</span>
            <span className="stat-label-muted">Average</span>
          </div>

          <div className="session-stat-tile">
            <span className="stat-big-num font-mono">{totalReadings}</span>
            <span className="stat-label-muted">Readings</span>
          </div>
        </div>
      </div>

      <div className="section-divider"></div>

      {/* 2. Deployment Radar & Location Geofence */}
      <div className="sidebar-section">
        <div className="section-header-row">
          <div className="header-label-group">
            <MapPin size={14} className="text-emerald-400" />
            <h3 className="section-title">Deployment zone</h3>
          </div>
          <button
            className="btn-glass-edit font-mono"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={11} />
            <span>{isEditing ? 'CLOSE' : 'CONFIGURE'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveLocation} className="location-dark-form font-mono">
            <div className="form-gps-row">
              <button
                type="button"
                className="btn-gps-action"
                onClick={handleAutoDetectGPS}
                disabled={isLocating}
              >
                <Crosshair size={11} />
                <span>{isLocating ? 'LOCATING...' : 'USE MY CURRENT GPS'}</span>
              </button>
            </div>

            <div className="form-field-group">
              <label>ZONE NAME:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="dark-input font-mono"
              />
            </div>

            <div className="coords-input-grid">
              <div className="form-field-group">
                <label>LATITUDE:</label>
                <input
                  type="number"
                  step="any"
                  value={editLat}
                  onChange={(e) => setEditLat(e.target.value)}
                  className="dark-input font-mono"
                />
              </div>
              <div className="form-field-group">
                <label>LONGITUDE:</label>
                <input
                  type="number"
                  step="any"
                  value={editLon}
                  onChange={(e) => setEditLon(e.target.value)}
                  className="dark-input font-mono"
                />
              </div>
            </div>

            <div className="form-buttons-strip">
              <button type="submit" className="btn-save-action">
                <Check size={11} /> SAVE
              </button>
              <button
                type="button"
                className="btn-cancel-action"
                onClick={() => setIsEditing(false)}
              >
                <X size={11} /> CANCEL
              </button>
            </div>
          </form>
        ) : (
          <div className="location-info-stack">
            <div className="location-top-bar">
              <span className="loc-name-text font-mono">{locationName}</span>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="maps-link-tag font-mono"
              >
                <span>MAP</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="coords-chips-line font-mono">
              <span>{Number(latitude).toFixed(4)}° N, {Number(longitude).toFixed(4)}° E</span>
              <span className="radius-chip">RADIUS: {alertRadius}M</span>
            </div>

            {/* Proximity Checker */}
            <div className="proximity-dark-strip font-mono">
              <div className="proximity-top-line">
                <span className="text-micro">DEVICE PROXIMITY:</span>
                <button
                  className="btn-gps-sync font-mono"
                  onClick={handleAutoDetectGPS}
                  disabled={isLocating}
                >
                  <Navigation size={10} />
                  <span>{isLocating ? 'LOCATING...' : userCoords ? 'RE-SYNC GPS' : 'SYNC MY GPS'}</span>
                </button>
              </div>

              {userCoords ? (
                <div
                  className={`proximity-badge-box ${
                    isUserInsidePerimeter
                      ? isElevatedRisk
                        ? 'box-danger'
                        : 'box-safe'
                      : 'box-outside'
                  }`}
                >
                  {isUserInsidePerimeter ? (
                    <>
                      <ShieldAlert size={13} />
                      <span>{formatDistance(userDistance)} AWAY — INSIDE {alertRadius}M ALERT PERIMETER</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={13} />
                      <span>{formatDistance(userDistance)} AWAY — OUTSIDE PERIMETER</span>
                    </>
                  )}
                </div>
              ) : (
                <span className="proximity-hint-text">
                  Tap "SYNC MY GPS" to verify your physical distance to this station.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="section-divider"></div>

      {/* 3. Alert Log */}
      <div className="sidebar-section">
        <div className="section-header-row">
          <div className="header-label-group">
            <Bell size={14} className="text-rose-400" />
            <h3 className="section-title">Alert log</h3>
          </div>
          <span className="alerts-count-tag font-mono">{alerts.length} ALERTS</span>
        </div>

        <div className="alerts-container">
          {displayAlerts.length === 0 ? (
            <p className="empty-alerts-text">No alerts yet.</p>
          ) : (
            <div className="alerts-dark-list">
              {displayAlerts.map((alert, idx) => {
                const riskInfo = getRiskLevelByName(alert.risk || 'HIGH');
                return (
                  <div key={alert.id || idx} className="alert-item-card">
                    <div className="alert-item-header font-mono">
                      <span
                        className="alert-level-badge"
                        style={{
                          backgroundColor: `${riskInfo.color}22`,
                          color: riskInfo.color,
                          borderColor: `${riskInfo.color}40`
                        }}
                      >
                        {alert.risk}
                      </span>
                      <span className="alert-timestamp-text">
                        {formatRelativeTime(alert.timestamp)}
                      </span>
                    </div>
                    <p className="alert-item-body">{alert.message || `${alert.risk} radiation detected`}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
