// api/latest.js - Returns the latest UV reading

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
      message: 'Firebase Realtime Database URL not configured yet.',
      reading: null
    });
  }

  try {
    const separator = auth ? '&' : '?';
    const response = await fetch(`${dbUrl}/readings.json${auth}${separator}orderBy="$key"&limitToLast=1`);
    if (!response.ok) {
      throw new Error(`Firebase responded with status ${response.status}`);
    }
    const data = await response.json();
    if (!data || Object.keys(data).length === 0) {
      return res.status(200).json({
        success: true,
        reading: null
      });
    }

    const [id, reading] = Object.entries(data)[0];
    return res.status(200).json({
      success: true,
      reading: { id, ...reading }
    });
  } catch (error) {
    console.error('Error in /api/latest:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch latest reading',
      details: error.message
    });
  }
}
