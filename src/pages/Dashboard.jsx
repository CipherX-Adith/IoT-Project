// src/pages/Dashboard.jsx - Complete Hybrid Integrated Dashboard
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroUVCard from '../components/HeroUVCard';
import StatCard from '../components/StatCard';
import UVChart from '../components/UVChart';
import RecentReadings from '../components/RecentReadings';
import SessionStatsAndAlerts from '../components/SessionStatsAndAlerts';
import MonitoringLocations from '../components/MonitoringLocations';

import {
  isFirebaseConfigured,
  subscribeToReadings,
  subscribeToNodes,
  subscribeToAlerts
} from '../services/firebase';
import { getRiskFromUvi } from '../utils/risk';
import { formatUvIndex, formatUvIntensity } from '../utils/format';

import { Sun, Activity, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';

const SAVED_LOCATION_KEY = 'sunshield_custom_location';

export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  
  const getInitialNode = () => {
    try {
      const saved = localStorage.getItem(SAVED_LOCATION_KEY);
      if (saved) {
        return {
          id: 'SS-001',
          name: 'SunShield Wokwi Node',
          status: 'ONLINE',
          lastSeen: Date.now(),
          ...JSON.parse(saved)
        };
      }
    } catch (e) {}

    return {
      id: 'SS-001',
      name: 'SunShield Wokwi Node',
      locationName: 'College Ground / Campus Field',
      latitude: 10.063,
      longitude: 76.326,
      alertRadius: 300,
      status: 'ONLINE',
      lastSeen: Date.now()
    };
  };

  const [nodes, setNodes] = useState([getInitialNode()]);
  const [alerts, setAlerts] = useState([]);

  const firebaseReady = isFirebaseConfigured();

  // Attach live real-time Firebase listeners
  useEffect(() => {
    if (!firebaseReady) return;

    const unsubReadings = subscribeToReadings((data) => {
      if (data) {
        setReadings(data);
      }
    });

    const unsubNodes = subscribeToNodes((data) => {
      if (data && data.length > 0) {
        setNodes((prev) => {
          const customLoc = localStorage.getItem(SAVED_LOCATION_KEY);
          if (customLoc) {
            const parsed = JSON.parse(customLoc);
            return data.map((n) => (n.id === 'SS-001' ? { ...n, ...parsed } : n));
          }
          return data;
        });
      }
    });

    const unsubAlerts = subscribeToAlerts((data) => {
      if (data) {
        setAlerts(data);
      }
    });

    return () => {
      unsubReadings();
      unsubNodes();
      unsubAlerts();
    };
  }, [firebaseReady]);

  const handleUpdateLocation = (newLoc) => {
    try {
      localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(newLoc));
    } catch (e) {}

    setNodes((prev) =>
      prev.map((n) =>
        n.id === 'SS-001'
          ? {
              ...n,
              ...newLoc
            }
          : n
      )
    );
  };

  const latestReading = readings.length > 0 ? readings[0] : null;
  const currentUvi = latestReading?.uvIndex ?? null;
  const currentIntensity = latestReading?.uvIntensity ?? null;
  const riskInfo = currentUvi !== null ? getRiskFromUvi(currentUvi) : null;
  const primaryNode = nodes.find((n) => n.id === (latestReading?.nodeId || 'SS-001')) || nodes[0];
  const locationName = primaryNode?.locationName || latestReading?.locationName || 'College Ground';
  const alertRadius = primaryNode?.alertRadius || latestReading?.alertRadius || 300;

  // Session Peak & Average for Top Stats
  const uviList = readings.map((r) => Number(r.uvIndex || 0));
  const peakUvi = uviList.length > 0 ? Math.max(...uviList).toFixed(1) : '--';

  return (
    <div className="dark-app-layout">
      {/* Background ambient mesh glow */}
      <div className="bg-glow-layer">
        <div className="glow-circle glow-blue"></div>
        <div className="glow-circle glow-amber"></div>
      </div>

      <div className="dashboard-content-container">
        {/* Header */}
        <Header locationName={locationName} />

        {/* Hazard Banner if UV >= 6 */}
        {currentUvi !== null && currentUvi >= 6 && (
          <section className="dark-hazard-banner font-mono">
            <div className="hazard-banner-left">
              <div className="hazard-icon-box">
                <AlertTriangle size={18} strokeWidth={2.5} />
              </div>
              <div className="hazard-banner-text">
                <span className="hazard-banner-headline">
                  [HAZARD ALERT] {riskInfo.level} UV RADIATION DETECTED IN {locationName.toUpperCase()}
                </span>
                <span className="hazard-banner-sub">
                  Push notification broadcast active to devices in {alertRadius}m perimeter. Take immediate shade!
                </span>
              </div>
            </div>
            <div className="hazard-banner-radius">
              <MapPin size={12} />
              <span>{alertRadius}M PERIMETER</span>
            </div>
          </section>
        )}

        {/* Top Hero UV Card with Segmented Rainbow Bar & Health Advisory */}
        <HeroUVCard latestReading={latestReading} />

        {/* 4 Top Analytical Stat Cards */}
        <section className="stats-glass-grid">
          <StatCard
            title="UV INDEX"
            value={currentUvi !== null ? formatUvIndex(currentUvi) : '--'}
            unit="UVI"
            icon={Sun}
            accentColor={riskInfo ? riskInfo.color : '#eab308'}
            subtext={riskInfo ? riskInfo.level : 'Awaiting sensor'}
            badge={riskInfo ? (currentUvi >= 8 ? 'HAZARD' : 'NOMINAL') : 'STANDBY'}
            badgeType={riskInfo ? (currentUvi >= 8 ? 'danger' : 'success') : 'neutral'}
          />

          <StatCard
            title="OPTICAL FLUX"
            value={currentIntensity !== null ? formatUvIntensity(currentIntensity) : '--'}
            unit="mW/cm²"
            icon={Activity}
            accentColor="#38bdf8"
            subtext="ML8511 Telemetry"
            badge={latestReading ? 'ONLINE' : 'STANDBY'}
            badgeType={latestReading ? 'success' : 'neutral'}
          />

          <StatCard
            title="SESSION PEAK"
            value={peakUvi}
            unit="UVI"
            icon={TrendingUp}
            accentColor="#f59e0b"
            subtext={`${readings.length} total packets`}
            badge="PEAK"
            badgeType="warning"
          />

          <StatCard
            title="GEOFENCE RADIUS"
            value={`${alertRadius}m`}
            unit="ZONE"
            icon={MapPin}
            accentColor="#10b981"
            subtext={locationName}
            badge="ACTIVE"
            badgeType="success"
          />
        </section>

        {/* Middle Section: Chart & Packet Log (Left) | Session & Proximity & Alert Log (Right) */}
        <div className="dashboard-middle-grid">
          <div className="middle-col-left">
            <UVChart readings={readings} />
            <RecentReadings readings={readings} />
          </div>

          <div className="middle-col-right">
            <SessionStatsAndAlerts
              readings={readings}
              alerts={alerts}
              node={primaryNode}
              latestReading={latestReading}
              onUpdateLocation={handleUpdateLocation}
            />
          </div>
        </div>

        {/* Bottom Section: Authority View Monitoring Locations */}
        <MonitoringLocations nodes={nodes} latestReading={latestReading} />
      </div>

      <footer className="dark-app-footer font-mono">
        <div className="footer-inner-content">
          <span>SUNSHIELD // HYBRID IOT PUBLIC HEALTH TELEMETRY</span>
          <span className="footer-sep">•</span>
          <span>ESP32 + ML8511 + FIREBASE RTDB + VERCEL + NTFY</span>
        </div>
      </footer>
    </div>
  );
}
