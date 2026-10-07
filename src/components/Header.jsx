// src/components/Header.jsx - Integrated Obsidian Glass Header
import React, { useState, useEffect } from 'react';
import { Sun, Shield, Database, Radio, MapPin } from 'lucide-react';
import { isFirebaseConfigured } from '../services/firebase';

export default function Header({ locationName = 'College Ground' }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const firebaseReady = isFirebaseConfigured();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="hybrid-header">
      <div className="header-brand-wrap">
        <div className="brand-logo-gem">
          <Shield className="gem-shield" size={20} />
          <Sun className="gem-sun" size={13} />
        </div>
        <div className="brand-titles">
          <div className="brand-name-row">
            <h1 className="brand-title">SunShield</h1>
            <span className="brand-tech-badge font-mono">IOT // UV-RAD</span>
          </div>
          <p className="brand-subtitle">Live UV radiation monitoring and public health alerts</p>
        </div>
      </div>

      <div className="header-meta-group">
        <div className="meta-glass-pill font-mono">
          <MapPin size={12} className="text-amber-400" />
          <span>{locationName.toUpperCase()}</span>
        </div>

        <div className={`meta-glass-pill ${firebaseReady ? 'pill-connected' : 'pill-standby'}`}>
          <span className="live-status-dot"></span>
          <span>{firebaseReady ? 'FIREBASE LIVE' : 'CONNECTED TO BROKER'}</span>
        </div>

        <div className="meta-glass-pill pill-clock font-mono">
          <span>{currentTime.toLocaleTimeString([], { hour12: false })}</span>
        </div>
      </div>
    </header>
  );
}
