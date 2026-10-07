// api/readings.js - Handles receiving telemetry with location geofence metadata and sending location-specific alerts

function calculateRisk(uvIndex) {
  const uvi = parseFloat(uvIndex) || 0;
  if (uvi < 3) return 'LOW';
  if (uvi < 6) return 'MODERATE';
  if (uvi < 8) return 'HIGH';
  if (uvi < 11) return 'VERY HIGH';
  return 'EXTREME';
}

function getDatabaseUrl() {
  let url = process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL || '';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

function getAuthParam() {
  const secret = process.env.FIREBASE_DATABASE_SECRET;
  return secret ? `?auth=${secret}` : '';
}

/**
 * Sends a location-targeted push alert via ntfy
 */
async function sendLocationTargetedAlert({
  nodeId,
  locationName,
  risk,
  uvIndex,
  uvIntensity,
  latitude,
  longitude,
  alertRadius
}) {
  const rawTopic = process.env.NTFY_TOPIC || process.env.VITE_NTFY_TOPIC || '';
  const baseTopic = rawTopic.trim();

  if (!baseTopic) {
    console.warn('[NTFY] Skipped: NTFY_TOPIC environment variable is not configured.');
    return {
      attempted: false,
      topicConfigured: false,
      error: 'NTFY_TOPIC environment variable not configured'
    };
  }

  const priorityMap = {
    'HIGH': 'default',
    'VERY HIGH': 'high',
    'EXTREME': 'urgent'
  };

  const priority = priorityMap[risk] || 'default';
  const tag = risk === 'EXTREME' ? 'rotating_light' : 'warning';
  const encodedCoords = `${encodeURIComponent(`${latitude},${longitude}`)}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedCoords}`;

  const alertTitle = `SUNSHIELD: ${risk} UV DETECTED`;
  const messageBody = `${risk} UV (${Number(uvIndex).toFixed(1)} UVI) detected at ${locationName}. Please seek shade if you are within ${alertRadius}m.`;

  const notificationResult = {
    attempted: true,
    topicConfigured: true,
    topic: baseTopic,
    primary: null,
    nodeTopic: null
  };

  // 1. Send to main broadcast topic
  try {
    const endpoint = `https://ntfy.sh/${baseTopic}`;
    console.log(`[NTFY] Dispatching alert to ${endpoint} with priority=${priority}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Title': alertTitle,
        'Priority': priority,
        'Tags': tag,
        'Click': mapUrl
      },
      body: messageBody
    });

    const responseText = await response.text();
    console.log(`[NTFY] STATUS: ${response.status} ${response.statusText}`);
    console.log(`[NTFY] RESPONSE:`, responseText);

    notificationResult.primary = {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      response: responseText
    };
  } catch (err) {
    console.error('[NTFY] Network exception dispatching primary ntfy alert:', err);
    notificationResult.primary = {
      ok: false,
      error: err.message
    };
  }

  // 2. Also broadcast to location/node specific channel (e.g. sunshield-alerts-ss-001)
  const sanitizedNode = String(nodeId).toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const nodeTopic = `${baseTopic}-${sanitizedNode}`;
  if (sanitizedNode && nodeTopic !== baseTopic) {
    try {
      const nodeEndpoint = `https://ntfy.sh/${nodeTopic}`;
      const nodeRes = await fetch(nodeEndpoint, {
        method: 'POST',
        headers: {
          'Title': `[LOCAL ZONE: ${locationName}] ${risk} UV Alert`,
          'Priority': priority,
          'Tags': tag,
          'Click': mapUrl
        },
        body: messageBody
      });
      const nodeText = await nodeRes.text();
      notificationResult.nodeTopic = {
        topic: nodeTopic,
        status: nodeRes.status,
        ok: nodeRes.ok
      };
    } catch (err) {
      notificationResult.nodeTopic = {
        topic: nodeTopic,
        ok: false,
        error: err.message
      };
    }
  }

  return notificationResult;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const dbUrl = getDatabaseUrl();
  const auth = getAuthParam();

  // POST: Receiving telemetry packet from ESP32 Wokwi Node
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      const nodeId = String(body.nodeId || 'SS-001').trim();
      const uvIntensity = parseFloat(body.uvIntensity !== undefined ? body.uvIntensity : 0);
      const uvIndex = parseFloat(body.uvIndex !== undefined ? body.uvIndex : 0);
      const risk = body.risk ? String(body.risk).toUpperCase() : calculateRisk(uvIndex);
      const latitude = body.latitude !== undefined ? parseFloat(body.latitude) : 10.063;
      const longitude = body.longitude !== undefined ? parseFloat(body.longitude) : 76.326;
      const locationName = String(body.locationName || 'College Ground / Campus Field');
      const alertRadius = parseInt(body.alertRadius || 300, 10);
      const timestamp = body.timestamp ? parseInt(body.timestamp, 10) : Date.now();

      const readingData = {
        nodeId,
        uvIntensity: Number(uvIntensity.toFixed(3)),
        uvIndex: Number(uvIndex.toFixed(2)),
        risk,
        latitude,
        longitude,
        locationName,
        alertRadius,
        timestamp
      };

      const nodeUpdate = {
        name: body.nodeName || `SunShield Node ${nodeId}`,
        locationName,
        latitude,
        longitude,
        alertRadius,
        status: 'ONLINE',
        lastSeen: timestamp,
        lastUvIndex: Number(uvIndex.toFixed(2)),
        lastUvIntensity: Number(uvIntensity.toFixed(3)),
        lastRisk: risk
      };

      let firebaseResult = null;

      if (dbUrl) {
        // 1. Write packet into readings/
        const readingRes = await fetch(`${dbUrl}/readings.json${auth}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(readingData)
        });
        firebaseResult = await readingRes.json();

        // 2. Update node status and location
        await fetch(`${dbUrl}/nodes/${encodeURIComponent(nodeId)}.json${auth}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nodeUpdate)
        });

        // 3. If Risk is elevated, log location-specific alert into alerts/
        if (['HIGH', 'VERY HIGH', 'EXTREME'].includes(risk)) {
          const alertData = {
            nodeId,
            locationName,
            latitude,
            longitude,
            alertRadius,
            risk,
            uvIndex: Number(uvIndex.toFixed(2)),
            message: `${risk} UV detected in ${locationName} (${uvIndex.toFixed(1)} UVI)`,
            timestamp
          };

          await fetch(`${dbUrl}/alerts.json${auth}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
          });
        }
      }

      // 4. Trigger location-targeted notification via ntfy
      let notificationResult = {
        attempted: false,
        reason: 'Risk level does not exceed threshold (LOW/MODERATE)'
      };

      if (['HIGH', 'VERY HIGH', 'EXTREME'].includes(risk)) {
        notificationResult = await sendLocationTargetedAlert({
          nodeId,
          locationName,
          risk,
          uvIndex,
          uvIntensity,
          latitude,
          longitude,
          alertRadius
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Location telemetry processed successfully',
        reading: readingData,
        firebasePersisted: Boolean(dbUrl && firebaseResult),
        notification: notificationResult
      });
    } catch (error) {
      console.error('Error processing location telemetry:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid payload'
      });
    }
  }

  // GET: Fetch recent readings
  if (req.method === 'GET') {
    if (!dbUrl) {
      return res.status(200).json({
        success: true,
        message: 'Firebase Realtime Database URL not configured.',
        readings: []
      });
    }

    try {
      const separator = auth ? '&' : '?';

      const response = await fetch(
        `${dbUrl}/readings.json${auth}${separator}orderBy="$key"&limitToLast=50`
      );
      if (!response.ok) {
        throw new Error(`Firebase returned HTTP ${response.status}`);
      }
      const data = await response.json();
      const readings = data
        ? Object.entries(data).map(([id, val]) => ({ id, ...val })).reverse()
        : [];

      return res.status(200).json({
        success: true,
        count: readings.length,
        readings
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve telemetry',
        details: err.message
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
