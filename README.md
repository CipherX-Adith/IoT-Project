# ☀️ SunShield — IoT UV Radiation Monitoring & Public Health Alert System

**SunShield** is an end-to-end IoT public health monitoring solution designed to track solar ultraviolet (UV) radiation levels in real-time, assess sunburn risks, and broadcast instant warning notifications to protect outdoor communities.

---

## 🏛️ System Architecture

```
                    SUNSHIELD

       ┌─────────────────────────┐
       │      WOKWI ESP32        │
       │                         │
       │ ML8511 → UVI → Risk     │
       │ LCD / RGB / LED / Buzzer│
       └────────────┬────────────┘
                    │  (HTTP POST /api/readings)
                 Internet
                    │
                    ▼
       ┌─────────────────────────┐
       │     VERCEL SERVERLESS   │
       │                         │
       │  POST /api/readings     │
       │  GET  /api/latest       │
       │  GET  /api/nodes        │
       │  GET  /api/health       │
       └────────────┬────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│   Firebase RTDB  │  │   ntfy.sh Push   │
│                  │  │                  │
│  Live Database   │  │ 📱 Phone Alert   │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌──────────────────┐
│ React Dashboard  │
│  (Vite + Chart)  │
└──────────────────┘
```

---

## 📁 Project Structure

```
SunShield/
├── api/                     # Vercel Serverless Backend API
│   ├── readings.js          # POST /api/readings & GET /api/readings (Firebase + ntfy)
│   ├── latest.js            # GET /api/latest (Latest single telemetry reading)
│   ├── nodes.js             # GET /api/nodes (Registered monitoring nodes)
│   └── health.js            # GET /api/health (API status check)
│
├── src/                     # React Frontend Application
│   ├── components/
│   │   ├── Header.jsx       # Branding, live status pill & simulation button
│   │   ├── StatCard.jsx     # Reusable metrics card
│   │   ├── RiskCard.jsx     # UV meter gauge, burn time & health advice
│   │   ├── UVChart.jsx      # Chart.js historical trend line graph
│   │   ├── NodeStatus.jsx   # Hardware status & last ping indicator
│   │   ├── RecentReadings.jsx # Telemetry tabular logs
│   │   ├── LocationCard.jsx # Coordinates & 300m broadcast radar
│   │   └── AlertPanel.jsx   # Public health warnings & ntfy status
│   │
│   ├── pages/
│   │   └── Dashboard.jsx    # Primary monitoring dashboard layout
│   │
│   ├── services/
│   │   ├── firebase.js      # Firebase Realtime Database SDK client & subscriptions
│   │   └── api.js           # Serverless API client helpers
│   │
│   ├── utils/
│   │   ├── risk.js          # UV risk bands, colors, and guidance thresholds
│   │   └── format.js        # Date, time, and numeric formatters
│   │
│   ├── App.jsx              # Main App entry
│   ├── main.jsx             # React DOM root
│   └── index.css            # Clean modern light theme
│
├── public/
│   └── favicon.svg          # SunShield logo icon
├── .env.example             # Documented environment variables template
├── .env                     # Local environment configuration
├── vercel.json              # Vercel rewrite configuration for SPA + Serverless
├── vite.config.js
└── package.json
```

---

## 🚦 UV Risk Thresholds (Demo Standards)

| UV Index (UVI) | Risk Level | Color | Action & Protection Recommended |
|---|---|---|---|
| **0.0 – 2.9** | **LOW** | 🟢 Green | Minimal protection required. Wear sunglasses on bright days. |
| **3.0 – 5.9** | **MODERATE** | 🟡 Yellow | Apply SPF 30+ sunscreen, wear hat and sunglasses. Seek shade midday. |
| **6.0 – 7.9** | **HIGH** | 🟠 Orange | Generously apply SPF 50+, reduce time in direct sun (10 AM – 4 PM). |
| **8.0 – 10.9** | **VERY HIGH** | 🔴 Red | Rapid skin damage. Full coverage, sunglasses, hat, reapply SPF 50+. |
| **11.0+** | **EXTREME** | 🟣 Purple | Critical hazard. Unprotected skin burns in <10 mins. Avoid outdoor sun. |

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```powershell
cd SunShield
npm install
```

### 2. Run Local Dev Server
```powershell
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.
*Note: SunShield comes with built-in demo telemetry and a **"Simulate Reading"** button so you can test all charts and alert triggers immediately before linking Firebase!*

---

## 🔥 Firebase Setup Guide

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** and name it `sunshield-iot` (or your choice).
3. In the sidebar, navigate to **Build** > **Realtime Database** > **Create Database**.
4. Choose a region (e.g., *United States* or *Belgium*) and select **Start in test mode** for initial testing:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
5. Go to **Project Settings** (gear icon) > **General** > **Your apps** > Click the Web **`</>`** icon.
6. Register the app as `SunShield Dashboard`.
7. Copy the `firebaseConfig` keys into your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=sunshield-iot.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://sunshield-iot-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=sunshield-iot
VITE_FIREBASE_STORAGE_BUCKET=sunshield-iot.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:...

# Backend serverless configuration:
FIREBASE_DATABASE_URL=https://sunshield-iot-default-rtdb.firebaseio.com
NTFY_TOPIC=sunshield-alerts-demo
```

---

## 📡 ESP32 Telemetry API Contract

### `POST /api/readings`
The ESP32 node sends a JSON HTTP POST packet:

**Request URL:** `https://your-sunshield.vercel.app/api/readings`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "nodeId": "SS-001",
  "uvIntensity": 3.25,
  "uvIndex": 8.7,
  "risk": "VERY HIGH",
  "latitude": 10.063,
  "longitude": 76.326
}
```

**Response (HTTP 200):**
```json
{
  "success": true,
  "message": "Reading processed successfully",
  "reading": {
    "nodeId": "SS-001",
    "uvIntensity": 3.25,
    "uvIndex": 8.7,
    "risk": "VERY HIGH",
    "latitude": 10.063,
    "longitude": 76.326,
    "timestamp": 1760000000000
  },
  "firebasePersisted": true
}
```

---

## 🔔 Mobile Alerts via ntfy

1. Download the **ntfy** app on your phone (Android / iOS) or open [ntfy.sh](https://ntfy.sh).
2. Subscribe to your topic name (e.g., `sunshield-alerts-live`).
3. Whenever a node detects **HIGH**, **VERY HIGH**, or **EXTREME** UV radiation, the backend automatically pushes an instant mobile notification with risk level, UV intensity, and safety guidance.

---

## ☁️ Deployment Guide (GitHub + Vercel)

### 1. Push to GitHub
```powershell
git init
git add .
git commit -m "Initial SunShield IoT Dashboard & API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/SunShield.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your `SunShield` repository.
3. In **Environment Variables**, add the variables from `.env.example`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `FIREBASE_DATABASE_URL`
   - `NTFY_TOPIC`
4. Click **Deploy**. Your dashboard and API routes will be live instantly!

---

## 🔌 Connecting Wokwi ESP32 Code

In your separate Wokwi `sketch.ino`, add WiFi and HTTPClient:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* serverUrl = "https://your-sunshield.vercel.app/api/readings";

void setup() {
  // Existing LCD / Pin / Sensor setup...
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
  }
}

void sendTelemetry(float uvIntensity, float uvIndex, const char* risk) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{";
    jsonPayload += "\"nodeId\":\"SS-001\",";
    jsonPayload += "\"uvIntensity\":" + String(uvIntensity, 2) + ",";
    jsonPayload += "\"uvIndex\":" + String(uvIndex, 2) + ",";
    jsonPayload += "\"risk\":\"" + String(risk) + "\",";
    jsonPayload += "\"latitude\":10.063,";
    jsonPayload += "\"longitude\":76.326";
    jsonPayload += "}";

    int httpResponseCode = http.POST(jsonPayload);
    http.end();
  }
}
```
