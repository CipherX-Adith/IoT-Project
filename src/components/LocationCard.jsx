// src/components/LocationCard.jsx - Semi-Brutalist Dynamic Location Geofencing & Station Config
import React, { useState } from 'react';
import { MapPin, Radio, Navigation, ExternalLink, ShieldAlert, ShieldCheck, Edit3, Check, X, Crosshair } from 'lucide-react';
import { calculateDistanceMeters, formatDistance, isWithinPerimeter } from '../utils/geo';

export default function LocationCard({ node, latestReading, currentUvi = 0, onUpdateLocation }) {
  const [isEditing, setIsEditing] = useState(false);

  const latitude = node?.latitude ?? latestReading?.latitude ?? 10.063;
  const longitude = node?.longitude ?? latestReading?.longitude ?? 76.326;
  const alertRadius = node?.alertRadius || 300;
  const locationName = node?.locationName || 'College Ground / Campus Field';

  // Custom edit form state
  const [editName, setEditName] = useState(locationName);
  const [editLat, setEditLat] = useState(String(latitude));
  const [editLon, setEditLon] = useState(String(longitude));
  const [editRadius, setEditRadius] = useState(String(alertRadius));

  const [userCoords, setUserCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Compute live user distance to the station
  const userDistance = userCoords
    ? calculateDistanceMeters(userCoords.latitude, userCoords.longitude, latitude, longitude)
    : null;

  const isUserInsidePerimeter = isWithinPerimeter(userDistance, alertRadius);
  const isElevatedRisk = currentUvi >= 6;

  // Auto-detect browser GPS to set station or check proximity
  const handleAutoDetectAsStation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
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
            locationName: editName || 'My Current Location',
            latitude: lat,
            longitude: lon,
            alertRadius: parseInt(editRadius, 10) || 300
          });
        }
        setIsLocating(false);
      },
      (err) => {
        setGeoError(err.message || 'Unable to retrieve GPS coordinates');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveCustomLocation = (e) => {
    e.preventDefault();
    const lat = parseFloat(editLat);
    const lon = parseFloat(editLon);
    const rad = parseInt(editRadius, 10) || 300;

    if (isNaN(lat) || isNaN(lon)) {
      setGeoError('Please enter valid numeric latitude and longitude');
      return;
    }

    if (onUpdateLocation) {
      onUpdateLocation({
        locationName: editName.trim() || 'Custom Station Sector',
        latitude: lat,
        longitude: lon,
        alertRadius: rad
      });
    }
    setIsEditing(false);
    setGeoError(null);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="brutal-card location-card">
      <div className="card-top-bar">
        <div className="bar-title-wrap">
          <MapPin size={16} strokeWidth={2.5} />
          <span className="card-section-heading font-mono">DEPLOYMENT ZONE</span>
        </div>
        <div className="location-top-actions">
          <button
            className="btn-edit-loc font-mono"
            onClick={() => setIsEditing(!isEditing)}
            title="Edit station coordinates"
          >
            <Edit3 size={11} />
            <span>{isEditing ? 'CANCEL' : 'CONFIGURE'}</span>
          </button>
          <div className="brutal-tag font-mono tag-neutral">
            <Radio size={11} />
            <span>RADIUS: {alertRadius}M</span>
          </div>
        </div>
      </div>

      <div className="location-inner">
        {/* Location Edit Form Mode */}
        {isEditing ? (
          <form onSubmit={handleSaveCustomLocation} className="location-edit-form font-mono">
            <div className="form-title-row">
              <span>CONFIGURE NODE LOCATION:</span>
              <button
                type="button"
                className="btn-auto-gps font-mono"
                onClick={handleAutoDetectAsStation}
                disabled={isLocating}
              >
                <Crosshair size={11} />
                <span>{isLocating ? 'FETCHING GPS...' : 'USE MY CURRENT GPS'}</span>
              </button>
            </div>

            <div className="form-field">
              <label>ZONE / CAMPUS NAME:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Campus Football Ground"
                className="brutal-input"
              />
            </div>

            <div className="form-coords-row">
              <div className="form-field">
                <label>LATITUDE:</label>
                <input
                  type="number"
                  step="any"
                  value={editLat}
                  onChange={(e) => setEditLat(e.target.value)}
                  placeholder="e.g. 10.0630"
                  className="brutal-input font-mono"
                />
              </div>
              <div className="form-field">
                <label>LONGITUDE:</label>
                <input
                  type="number"
                  step="any"
                  value={editLon}
                  onChange={(e) => setEditLon(e.target.value)}
                  placeholder="e.g. 76.3260"
                  className="brutal-input font-mono"
                />
              </div>
            </div>

            <div className="form-field">
              <label>ALERT BROADCAST RADIUS (METERS):</label>
              <input
                type="number"
                value={editRadius}
                onChange={(e) => setEditRadius(e.target.value)}
                placeholder="300"
                className="brutal-input font-mono"
              />
            </div>

            <div className="form-buttons-row">
              <button type="submit" className="btn-save-loc font-mono">
                <Check size={12} />
                <span>SAVE & SET LOCATION</span>
              </button>
              <button
                type="button"
                className="btn-cancel-loc font-mono"
                onClick={() => setIsEditing(false)}
              >
                <X size={12} />
                <span>CANCEL</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Location Identity Row */}
            <div className="location-meta-strip">
              <div className="location-name-row">
                <span className="location-title font-mono">{locationName}</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-ext-link font-mono"
                  title="Open exact coordinates in Google Maps"
                >
                  <span>GOOGLE MAPS</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <span className="location-sub font-mono">TARGET BROADCAST PERIMETER ({alertRadius}M)</span>
            </div>

            {/* GPS Coordinates Display */}
            <div className="coords-brutal-grid">
              <div className="coord-tile">
                <span className="coord-micro font-mono">STATION LATITUDE</span>
                <span className="coord-data font-mono">{Number(latitude).toFixed(5)}° N</span>
              </div>
              <div className="coord-tile">
                <span className="coord-micro font-mono">STATION LONGITUDE</span>
                <span className="coord-data font-mono">{Number(longitude).toFixed(5)}° E</span>
              </div>
            </div>

            {/* User Proximity & Targeted Alert State */}
            <div className="proximity-checker-box">
              <div className="proximity-header">
                <span className="font-mono text-micro">YOUR DEVICE GEOFENCE:</span>
                <button
                  className="btn-locate font-mono"
                  onClick={handleAutoDetectAsStation}
                  disabled={isLocating}
                  title="Sync with your current physical location"
                >
                  <Navigation size={11} />
                  <span>{isLocating ? 'LOCATING...' : userCoords ? 'RE-SYNC GPS' : 'SYNC MY GPS'}</span>
                </button>
              </div>

              {userCoords ? (
                <div
                  className={`proximity-result-badge font-mono ${
                    isUserInsidePerimeter
                      ? isElevatedRisk
                        ? 'result-in-danger'
                        : 'result-in-safe'
                      : 'result-outside'
                  }`}
                >
                  {isUserInsidePerimeter ? (
                    <>
                      <ShieldAlert size={14} />
                      <span>
                        YOU ARE {formatDistance(userDistance)} AWAY — INSIDE {alertRadius}M HAZARD PERIMETER
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      <span>
                        YOU ARE {formatDistance(userDistance)} AWAY — OUTSIDE ALERT RADIUS
                      </span>
                    </>
                  )}
                </div>
              ) : geoError ? (
                <span className="geo-error font-mono">{geoError}</span>
              ) : (
                <span className="geo-hint font-mono">
                  Tap <strong>"SYNC MY GPS"</strong> or <strong>"CONFIGURE"</strong> above to pinpoint your real location.
                </span>
              )}
            </div>

            {/* Geometric Brutalist Radar */}
            <div className="brutal-radar-box">
              <div className="radar-crosshair cross-h"></div>
              <div className="radar-crosshair cross-v"></div>
              <div className="radar-ring ring-3"></div>
              <div className="radar-ring ring-2"></div>
              <div className="radar-ring ring-1"></div>
              <div className="radar-beacon">
                <span className="beacon-ping"></span>
                <span className="beacon-core"></span>
              </div>
              <span className="radar-corner-tag font-mono">
                {locationName.toUpperCase()} // {alertRadius}M
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
