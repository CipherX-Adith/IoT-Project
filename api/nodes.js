// api/nodes.js - Returns registered SunShield monitoring nodes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let dbUrl = process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL || '';
  if (dbUrl.endsWith('/')) dbUrl = dbUrl.slice(0, -1);
  const auth = process.env.FIREBASE_DATABASE_SECRET ? `?auth=${process.env.FIREBASE_DATABASE_SECRET}` : '';

  if (!dbUrl) {
    return res.status(200).json({
      success: true,
      nodes: [
        {
          id: 'SS-001',
          name: 'SunShield Demo Node',
          latitude: 10.063,
          longitude: 76.326,
          alertRadius: 300,
          status: 'ONLINE',
          lastSeen: Date.now()
        }
      ]
    });
  }

  try {
    const response = await fetch(`${dbUrl}/nodes.json${auth}`);
    if (!response.ok) {
      throw new Error(`Firebase responded with status ${response.status}`);
    }
    const data = await response.json();
    const nodes = data
      ? Object.entries(data).map(([id, val]) => ({ id, ...val }))
      : [];

    return res.status(200).json({
      success: true,
      count: nodes.length,
      nodes
    });
  } catch (error) {
    console.error('Error in /api/nodes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch nodes',
      details: error.message
    });
  }
}
