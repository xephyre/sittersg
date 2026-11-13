import { NotificationItem, RoleMode } from '../types';
import {
  GeocodedLocation,
  MyInfoProfilePayload,
  MyInfoService,
  NotificationService,
  OneMapService,
  PaymentIntentResult,
  PaymentService,
  SingpassAuthService,
  SingpassAuthSession,
  StorageService,
} from './interfaces';

export class MockSingpassAuthService implements SingpassAuthService {
  async initiateLogin(role: RoleMode) {
    // TODO: Production integration — redirect to Singpass OIDC/FAPI authorization endpoint
    return {
      authUrl: `#demo-singpass-${role}`,
      state: `sp_${role}_${Date.now()}`,
    };
  }

  async completeDemoCallback(role: RoleMode): Promise<SingpassAuthSession> {
    // TODO: Production integration — exchange authorization code at Singpass /token endpoint
    return {
      sub: `sp-demo-${role}-9012`,
      maskedNric: role === 'parent' ? 'S****482J' : 'S****731K',
      verifiedAt: new Date().toISOString(),
      demoMode: true,
    };
  }

  async signAgreement(sitterId: string) {
    // TODO: Production integration — invoke Singpass Sign API (NDI Sign)
    return {
      signedAt: new Date().toISOString(),
      signatureHash: `NDI-SIGN-DEMO-${sitterId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }
}

export class MockMyInfoService implements MyInfoService {
  async fetchParentProfile(consentGranted: boolean): Promise<MyInfoProfilePayload> {
    if (!consentGranted) {
      throw new Error('Explicit PDPA consent is required before retrieving MyInfo fields.');
    }
    // TODO: Production integration — call MyInfo v4 Person API with scoped OAuth2 access token
    return {
      fullName: 'Rachel Lim Hui Wen',
      maskedNric: 'S****482J',
      dateOfBirth: '1991-04-18',
      phone: '+65 9128 4410',
      postalCode: '822215',
      estate: 'Punggol',
      addressDisplay: 'Blk 215A Punggol Field #11-312, Singapore 822215',
    };
  }
}

const SITTER_POSTAL_COORDS: Record<string, { lat: number; lng: number }> = {
  '822218': { lat: 1.4048, lng: 103.9029 },
  '823168': { lat: 1.3969, lng: 103.9089 },
  '821308': { lat: 1.4084, lng: 103.8986 },
  '820105': { lat: 1.3994, lng: 103.9058 },
  '828674': { lat: 1.4118, lng: 103.9003 },
  '822256': { lat: 1.4052, lng: 103.8975 },
  '828910': { lat: 1.4096, lng: 103.9048 },
  '828710': { lat: 1.4169, lng: 103.9066 },
  '542282': { lat: 1.3945, lng: 103.9005 },
  '544260': { lat: 1.3917, lng: 103.8954 },
  '792416': { lat: 1.3918, lng: 103.8763 },
  '530312': { lat: 1.383, lng: 103.8931 },
  '541201': { lat: 1.3842, lng: 103.8973 },
  '544180': { lat: 1.3921, lng: 103.88 },
  '520489': { lat: 1.354, lng: 103.9452 },
  '521842': { lat: 1.3455, lng: 103.9384 },
  '521265': { lat: 1.3562, lng: 103.9546 },
  '520144': { lat: 1.3432, lng: 103.9534 },
  '529502': { lat: 1.3526, lng: 103.9447 },
  '522610': { lat: 1.3625, lng: 103.939 },
};

const SECTOR_COORDS: Record<string, { lat: number; lng: number }> = {
  '82': { lat: 1.4043, lng: 103.9025 },
  '54': { lat: 1.3917, lng: 103.8954 },
  '53': { lat: 1.383, lng: 103.8931 },
  '79': { lat: 1.3918, lng: 103.8763 },
  '52': { lat: 1.3526, lng: 103.9447 },
  '51': { lat: 1.3721, lng: 103.9474 },
};

function postalToApproxCoords(postal: string): { lat: number; lng: number } {
  const cleaned = postal.replace(/\D/g, '');
  if (SITTER_POSTAL_COORDS[cleaned]) {
    return SITTER_POSTAL_COORDS[cleaned];
  }
  const base = SECTOR_COORDS[cleaned.slice(0, 2)] ?? { lat: 1.3521, lng: 103.8198 };
  const jitter = ((parseInt(cleaned.slice(-2) || '15', 10) % 10) - 5) * 0.0014;
  return { lat: base.lat + jitter, lng: base.lng + jitter };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

export class OneMapApiService implements OneMapService {
  async geocodePostalCode(postalCode: string): Promise<GeocodedLocation> {
    const cleaned = postalCode.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(cleaned)) {
      throw new Error('Please enter a 6-digit Singapore postal code.');
    }

    const resp = await fetch(`/api/onemap/search?postal=${encodeURIComponent(cleaned)}`);
    const data = (await resp.json()) as GeocodedLocation & { error?: string };

    if (!resp.ok) {
      throw new Error(data.error || 'Postal code lookup failed.');
    }

    return data;
  }

  calculateDistanceKm(
    from: string | { postalCode: string; lat?: number; lng?: number },
    toPostal: string
  ): number {
    const fromPostal = typeof from === 'string' ? from : from.postalCode;
    const cleanedTo = toPostal.replace(/\D/g, '');
    const cleanedFrom = fromPostal.replace(/\D/g, '');
    if (cleanedFrom && cleanedFrom === cleanedTo) return 0.1;

    const hasValidCoords =
      typeof from === 'object' &&
      typeof from.lat === 'number' &&
      Number.isFinite(from.lat) &&
      typeof from.lng === 'number' &&
      Number.isFinite(from.lng);

    const origin = hasValidCoords
      ? { lat: from.lat as number, lng: from.lng as number }
      : postalToApproxCoords(cleanedFrom || '822215');

    const dest = postalToApproxCoords(cleanedTo || '822218');
    const dist = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
    return Number.isFinite(dist) ? Math.max(0.2, dist) : 1.5;
  }
}

export class MockPaymentService implements PaymentService {
  async processBookingPayment(params: {
    bookingId: string;
    amountSgd: number;
    method: 'PayNow QR' | 'Visa •••• 4242';
  }): Promise<PaymentIntentResult> {
    // TODO: Production integration — create Stripe PaymentIntent or HitPay SGQR
    return {
      paymentReference: `SG-${params.method === 'PayNow QR' ? 'PN' : 'CC'}-${params.bookingId.slice(-4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'succeeded',
      amountSgd: params.amountSgd,
      method: params.method,
      payNowUen: params.method === 'PayNow QR' ? '202612345K (SitterSG Pte Ltd)' : undefined,
      paidAt: new Date().toISOString(),
    };
  }
}

export class MockNotificationService implements NotificationService {
  async sendWhatsAppAndPush(
    payload: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ): Promise<NotificationItem> {
    // TODO: Production integration — WhatsApp Business Cloud API + FCM/APNs
    return {
      ...payload,
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      read: false,
    };
  }
}

export class LocalStorageService implements StorageService {
  load<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  save<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota errors
    }
  }

  clear(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

export const singpassAuthService = new MockSingpassAuthService();
export const myInfoService = new MockMyInfoService();
export const oneMapService = new OneMapApiService();
export const paymentService = new MockPaymentService();
export const notificationService = new MockNotificationService();
export const storageService = new LocalStorageService();
