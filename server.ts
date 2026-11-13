import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const ONEMAP_BASE_URL = 'https://www.onemap.gov.sg';

interface TokenCache {
  token: string;
  expiresAtMs: number;
}

let cachedOneMapToken: TokenCache | null = null;

const SG_SECTOR_FALLBACK: Record<
  string,
  { estateLabel: string; roadHint: string; nearestMrt: string; lat: number; lng: number }
> = {
  '82': { estateLabel: 'Punggol', roadHint: 'Punggol Field', nearestMrt: 'Punggol MRT / Damai LRT', lat: 1.4043, lng: 103.9025 },
  '54': { estateLabel: 'Sengkang', roadHint: 'Compassvale Bow', nearestMrt: 'Sengkang MRT / Compassvale LRT', lat: 1.3917, lng: 103.8954 },
  '53': { estateLabel: 'Hougang / Sengkang', roadHint: 'Buangkok Crescent', nearestMrt: 'Buangkok MRT', lat: 1.383, lng: 103.8931 },
  '79': { estateLabel: 'Sengkang West', roadHint: 'Fernvale Link', nearestMrt: 'Fernvale LRT', lat: 1.3918, lng: 103.8763 },
  '52': { estateLabel: 'Tampines', roadHint: 'Tampines Street 45', nearestMrt: 'Tampines MRT / Tampines East', lat: 1.3526, lng: 103.9447 },
  '51': { estateLabel: 'Pasir Ris / Tampines', roadHint: 'Pasir Ris Drive', nearestMrt: 'Pasir Ris MRT', lat: 1.3721, lng: 103.9474 },
  '46': { estateLabel: 'Bedok', roadHint: 'Bedok North Ave', nearestMrt: 'Bedok MRT', lat: 1.324, lng: 103.93 },
  '56': { estateLabel: 'Ang Mo Kio', roadHint: 'Ang Mo Kio Ave', nearestMrt: 'Ang Mo Kio MRT', lat: 1.3691, lng: 103.8454 },
  '57': { estateLabel: 'Bishan', roadHint: 'Bishan Street', nearestMrt: 'Bishan MRT', lat: 1.3526, lng: 103.8352 },
  '31': { estateLabel: 'Toa Payoh', roadHint: 'Toa Payoh Lorong', nearestMrt: 'Toa Payoh MRT', lat: 1.3343, lng: 103.8563 },
  '23': { estateLabel: 'Orchard / River Valley', roadHint: 'Orchard Road', nearestMrt: 'Orchard MRT', lat: 1.3048, lng: 103.8318 },
  '12': { estateLabel: 'Clementi', roadHint: 'Clementi Ave', nearestMrt: 'Clementi MRT', lat: 1.3162, lng: 103.7649 },
  '60': { estateLabel: 'Jurong East', roadHint: 'Jurong Gateway', nearestMrt: 'Jurong East MRT', lat: 1.3329, lng: 103.7436 },
  '73': { estateLabel: 'Woodlands', roadHint: 'Woodlands Ave', nearestMrt: 'Woodlands MRT', lat: 1.4382, lng: 103.789 },
};

function inferEstateFromResult(address: string, postal: string): string {
  const upper = address.toUpperCase();
  if (upper.includes('PUNGGOL') || postal.startsWith('82')) return 'Punggol';
  if (upper.includes('SENGKANG') || upper.includes('COMPASSVALE') || upper.includes('FERNVALE') || postal.startsWith('54') || postal.startsWith('79')) {
    return 'Sengkang';
  }
  if (upper.includes('TAMPINES') || upper.includes('SIMEI') || postal.startsWith('52')) return 'Tampines';
  const sector = SG_SECTOR_FALLBACK[postal.slice(0, 2)];
  return sector?.estateLabel ?? 'Singapore';
}

async function getOneMapToken(): Promise<string | null> {
  const staticToken = process.env.ONEMAP_API_TOKEN?.trim();
  if (staticToken) return staticToken;

  const email = process.env.ONEMAP_API_EMAIL?.trim();
  const password = process.env.ONEMAP_API_PASSWORD?.trim();
  if (!email || !password) return null;

  if (cachedOneMapToken && Date.now() < cachedOneMapToken.expiresAtMs - 60_000) {
    return cachedOneMapToken.token;
  }

  const resp = await fetch(`${ONEMAP_BASE_URL}/api/auth/post/getToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) return null;
  const data = (await resp.json()) as { access_token?: string; expiry_timestamp?: string | number };
  if (!data.access_token) return null;

  const expirySec = Number(data.expiry_timestamp || 0);
  cachedOneMapToken = {
    token: data.access_token,
    expiresAtMs: expirySec > 0 ? expirySec * 1000 : Date.now() + 70 * 3600 * 1000,
  };
  return cachedOneMapToken.token;
}

function buildFallbackLocation(postal: string, reason: string) {
  const sector = SG_SECTOR_FALLBACK[postal.slice(0, 2)] ?? {
    estateLabel: 'Singapore',
    roadHint: `Postal District ${postal.slice(0, 2)}`,
    nearestMrt: 'Nearest MRT',
    lat: 1.3521,
    lng: 103.8198,
  };
  const jitter = ((parseInt(postal.slice(-2) || '15', 10) % 10) - 5) * 0.0014;
  return {
    source: 'fallback' as const,
    fallbackReason: reason,
    postalCode: postal,
    estateLabel: sector.estateLabel,
    address: `${sector.roadHint}, Singapore ${postal}`,
    blkNo: '',
    roadName: sector.roadHint,
    building: '',
    nearestMrt: sector.nearestMrt,
    lat: Number((sector.lat + jitter).toFixed(6)),
    lng: Number((sector.lng + jitter).toFixed(6)),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/onemap/search', async (req, res) => {
    const rawPostal = String(req.query.postal ?? '').replace(/\D/g, '');
    if (!/^\d{6}$/.test(rawPostal)) {
      res.status(400).json({ error: 'Please enter a valid 6-digit Singapore postal code.' });
      return;
    }

    try {
      const token = await getOneMapToken();
      if (!token) {
        res.json(buildFallbackLocation(rawPostal, 'ONEMAP credentials not configured'));
        return;
      }

      const url = new URL(`${ONEMAP_BASE_URL}/api/common/elastic/search`);
      url.searchParams.set('searchVal', rawPostal);
      url.searchParams.set('returnGeom', 'Y');
      url.searchParams.set('getAddrDetails', 'Y');

      const omResp = await fetch(url.toString(), {
        headers: { Authorization: token },
      });

      if (!omResp.ok) {
        res.json(buildFallbackLocation(rawPostal, `OneMap HTTP ${omResp.status}`));
        return;
      }

      const payload = (await omResp.json()) as {
        error?: string;
        found?: number;
        results?: Array<{
          SEARCHVAL?: string;
          BLK_NO?: string;
          ROAD_NAME?: string;
          BUILDING?: string;
          ADDRESS?: string;
          POSTAL?: string;
          LATITUDE?: string;
          LONGITUDE?: string;
        }>;
      };

      if (payload.error) {
        cachedOneMapToken = null;
        res.json(buildFallbackLocation(rawPostal, payload.error));
        return;
      }

      const match = payload.results?.[0];
      if (!match) {
        res.status(404).json({
          error: `No Singapore address found for postal code ${rawPostal}.`,
        });
        return;
      }

      const address = match.ADDRESS || match.SEARCHVAL || `Singapore ${rawPostal}`;
      const estateLabel = inferEstateFromResult(address, rawPostal);
      const building = match.BUILDING && match.BUILDING !== 'NIL' ? match.BUILDING : '';
      const blkNo = match.BLK_NO && match.BLK_NO !== 'NIL' ? match.BLK_NO : '';
      const roadName = match.ROAD_NAME && match.ROAD_NAME !== 'NIL' ? match.ROAD_NAME : '';

      res.json({
        source: 'onemap',
        postalCode: match.POSTAL || rawPostal,
        estateLabel,
        address,
        blkNo,
        roadName,
        building,
        nearestMrt: `${estateLabel} area`,
        lat: Number(match.LATITUDE),
        lng: Number(match.LONGITUDE),
      });
    } catch {
      res.json(buildFallbackLocation(rawPostal, 'Network fallback'));
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SitterSG server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
