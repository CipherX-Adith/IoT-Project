import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-dev-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/api/nodes')) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              success: true,
              nodes: [
                {
                  id: 'SS-001',
                  name: 'SunShield Wokwi Node',
                  locationName: 'College Ground / Campus Field',
                  latitude: 10.063,
                  longitude: 76.326,
                  alertRadius: 300,
                  status: 'ONLINE',
                  lastSeen: Date.now(),
                  lastUvIndex: 8.4,
                  lastUvIntensity: 3.15,
                  lastRisk: 'VERY HIGH'
                }
              ]
            }));
          }
          if (req.url.startsWith('/api/health')) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ status: 'ok', service: 'sunshield-local-dev' }));
          }
          if (req.url.startsWith('/api/readings') || req.url.startsWith('/api/latest')) {
            res.setHeader('Content-Type', 'application/json');
            const now = Date.now();
            const uviSequence = [
              1.2, 1.5, 1.8, 2.2, 2.7, 3.1, 3.5, 4.0, 4.4, 4.9, 
              5.2, 5.5, 6.0, 6.5, 7.0, 7.4, 7.8, 8.1, 8.4
            ];
            const readings = uviSequence.map((uvi, index) => {
              const timeOffset = (uviSequence.length - 1 - index) * 120000;
              const intensity = Number(((uvi * 15.0) / 40.0).toFixed(2));
              const risk = uvi < 3 ? 'LOW' : uvi < 6 ? 'MODERATE' : uvi < 8 ? 'HIGH' : uvi < 11 ? 'VERY HIGH' : 'EXTREME';
              return {
                id: `dev-${index}`,
                nodeId: 'SS-001',
                locationName: 'College Ground / Campus Field',
                latitude: 10.063,
                longitude: 76.326,
                alertRadius: 300,
                uvIndex: uvi,
                uvIntensity: intensity,
                risk,
                timestamp: now - timeOffset
              };
            }).reverse();

            if (req.url.startsWith('/api/latest')) {
              return res.end(JSON.stringify({ success: true, reading: readings[0] }));
            }
            return res.end(JSON.stringify({ success: true, count: readings.length, readings }));
          }
          next();
        });
      }
    }
  ],
})
