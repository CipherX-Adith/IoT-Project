// src/services/api.js - HTTP API client for SunShield Serverless Endpoints

const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API health check error:', err);
    return { status: 'error', message: err.message };
  }
}

export async function fetchLatestReading() {
  try {
    const res = await fetch(`${API_BASE}/latest?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Fetch latest reading error:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchReadings() {
  try {
    const res = await fetch(`${API_BASE}/readings?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Fetch readings error:', err);
    return { success: false, error: err.message, readings: [] };
  }
}

export async function fetchNodes() {
  try {
    const res = await fetch(`${API_BASE}/nodes?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Fetch nodes error:', err);
    return { success: false, error: err.message, nodes: [] };
  }
}

export async function sendTelemetryReading(reading) {
  try {
    const res = await fetch(`${API_BASE}/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Send telemetry error:', err);
    return { success: false, error: err.message };
  }
}
