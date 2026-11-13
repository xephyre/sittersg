import { EstateArea, NotificationItem, RoleMode } from '../types';

export interface SingpassAuthSession {
  sub: string;
  maskedNric: string;
  verifiedAt: string;
  demoMode: boolean;
}

export interface SingpassAuthService {
  initiateLogin(role: RoleMode): Promise<{ authUrl: string; state: string }>;
  completeDemoCallback(role: RoleMode): Promise<SingpassAuthSession>;
  signAgreement(sitterId: string): Promise<{ signedAt: string; signatureHash: string }>;
}

export interface MyInfoProfilePayload {
  fullName: string;
  maskedNric: string;
  dateOfBirth: string;
  phone: string;
  postalCode: string;
  estate: EstateArea;
  addressDisplay: string;
}

export interface MyInfoService {
  fetchParentProfile(consentGranted: boolean): Promise<MyInfoProfilePayload>;
}

export interface GeocodedLocation {
  postalCode: string;
  estate: EstateArea;
  nearestMrt: string;
  lat: number;
  lng: number;
}

export interface OneMapService {
  geocodePostalCode(postalCode: string): Promise<GeocodedLocation>;
  calculateDistanceKm(fromPostal: string, toPostal: string): number;
}

export interface PaymentIntentResult {
  paymentReference: string;
  status: 'succeeded';
  amountSgd: number;
  method: 'PayNow QR' | 'Visa •••• 4242';
  payNowUen?: string;
  paidAt: string;
}

export interface PaymentService {
  processBookingPayment(params: {
    bookingId: string;
    amountSgd: number;
    method: 'PayNow QR' | 'Visa •••• 4242';
  }): Promise<PaymentIntentResult>;
}

export interface NotificationService {
  sendWhatsAppAndPush(
    payload: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ): Promise<NotificationItem>;
}

export interface StorageService {
  load<T>(key: string, fallback: T): T;
  save<T>(key: string, value: T): void;
  clear(key: string): void;
}
