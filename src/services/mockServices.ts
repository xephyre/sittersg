import { EstateArea, NotificationItem, RoleMode } from '../types';
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
    // with PKCE, client_assertion JWT signed via private JWKS, and redirect_uri handled server-side.
    return {
      authUrl: `#demo-singpass-${role}`,
      state: `sp_${role}_${Date.now()}`,
    };
  }

  async completeDemoCallback(role: RoleMode): Promise<SingpassAuthSession> {
    // TODO: Production integration — exchange authorization code at Singpass /token endpoint
    // on the backend, verify ID Token signature, and mask NRIC before storing session.
    return {
      sub: `sp-demo-${role}-9012`,
      maskedNric: role === 'parent' ? 'S****482J' : 'S****731K',
      verifiedAt: new Date().toISOString(),
      demoMode: true,
    };
  }

  async signAgreement(sitterId: string) {
    // TODO: Production integration — invoke Singpass Sign API (NDI Sign) to produce a
    // legally binding PAdES digital signature on the Sitter Service Agreement & Liability Waiver.
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
    // requesting only: name, dob, mobileno, regadd (masked NRIC from Singpass sub/uinfin).
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

const POSTAL_SECTOR_MAP: Record<string, GeocodedLocation> = {
  '82': { postalCode: '822215', estate: 'Punggol', nearestMrt: 'Punggol MRT / Damai LRT', lat: 1.4043, lng: 103.9025 },
  '54': { postalCode: '542278', estate: 'Sengkang', nearestMrt: 'Sengkang MRT / Compassvale LRT', lat: 1.3917, lng: 103.8954 },
  '52': { postalCode: '520488', estate: 'Tampines', nearestMrt: 'Tampines MRT / Tampines East', lat: 1.3526, lng: 103.9447 },
  '51': { postalCode: '510512', estate: 'Tampines', nearestMrt: 'Tampines MRT', lat: 1.3601, lng: 103.9499 },
  '53': { postalCode: '530310', estate: 'Sengkang', nearestMrt: 'Buangkok MRT', lat: 1.383, lng: 103.8931 },
  '79': { postalCode: '792416', estate: 'Sengkang', nearestMrt: 'Fernvale LRT', lat: 1.3918, lng: 103.8763 },
};

export class MockOneMapService implements OneMapService {
  async geocodePostalCode(postalCode: string): Promise<GeocodedLocation> {
    // TODO: Production integration — query Singapore SLA OneMap Search API:
    // GET https://www.onemap.gov.sg/api/common/elastic/search?searchVal={postalCode}&returnGeom=Y&getAddrDetails=Y
    const cleaned = postalCode.replace(/\D/g, '').slice(0, 6);
    const prefix = cleaned.slice(0, 2);
    const base = POSTAL_SECTOR_MAP[prefix] ?? {
      postalCode: cleaned || '822215',
      estate: 'Punggol' as EstateArea,
      nearestMrt: 'Punggol MRT',
      lat: 1.4043,
      lng: 103.9025,
    };
    const jitter = ((parseInt(cleaned.slice(-2) || '15', 10) % 10) - 5) * 0.0018;
    return {
      ...base,
      postalCode: cleaned || base.postalCode,
      lat: base.lat + jitter,
      lng: base.lng + jitter,
    };
  }

  calculateDistanceKm(fromPostal: string, toPostal: string): number {
    const p1 = fromPostal.replace(/\D/g, '');
    const p2 = toPostal.replace(/\D/g, '');
    if (!p1 || !p2) return 1.5;
    if (p1 === p2) return 0.2;
    const prefix1 = p1.slice(0, 2);
    const prefix2 = p2.slice(0, 2);
    const tailDiff = Math.abs(parseInt(p1.slice(-3) || '100', 10) - parseInt(p2.slice(-3) || '100', 10));
    if (prefix1 === prefix2) {
      return Number((0.4 + (tailDiff % 24) * 0.1).toFixed(1));
    }
    if ((prefix1 === '82' && prefix2 === '54') || (prefix1 === '54' && prefix2 === '82')) {
      return Number((2.6 + (tailDiff % 15) * 0.12).toFixed(1));
    }
    return Number((5.2 + (tailDiff % 20) * 0.15).toFixed(1));
  }
}

export class MockPaymentService implements PaymentService {
  async processBookingPayment(params: {
    bookingId: string;
    amountSgd: number;
    method: 'PayNow QR' | 'Visa •••• 4242';
  }): Promise<PaymentIntentResult> {
    // TODO: Production integration — create Stripe PaymentIntent (payment_method_types: ['paynow', 'card'])
    // or HitPay PayNow dynamic QR webhook, holding funds in escrow until sitter check-out.
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
    // TODO: Production integration — dispatch approved template message via WhatsApp Business Cloud API
    // (POST https://graph.facebook.com/v20.0/{phone_number_id}/messages) + FCM/APNs push notification.
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
      // Ignore storage quota errors in demo mode
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
export const oneMapService = new MockOneMapService();
export const paymentService = new MockPaymentService();
export const notificationService = new MockNotificationService();
export const storageService = new LocalStorageService();
