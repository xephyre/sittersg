import {
  Booking,
  ChatMessage,
  Incident,
  NotificationItem,
  Parent,
  Review,
  RoleMode,
  ServiceType,
  Sitter,
} from '../types';

export type ActiveTab =
  | 'discover'
  | 'bookings'
  | 'family'
  | 'membership'
  | 'notifications'
  | 'sitter_jobs'
  | 'sitter_onboarding'
  | 'sitter_earnings'
  | 'admin_overview'
  | 'admin_verifications'
  | 'admin_incidents';

export interface AppState {
  role: RoleMode;
  activeTab: ActiveTab;
  sitters: Sitter[];
  parents: Parent[];
  activeParentId: string;
  activeSitterId: string;
  bookings: Booking[];
  reviews: Review[];
  chatMessages: ChatMessage[];
  incidents: Incident[];
  notifications: NotificationItem[];
  rebookSitterId: string | null;
  sosBookingId: string | null;
  singpassModalOpen: boolean;
}

export interface CreateBookingInput {
  sitterId: string;
  date: string;
  startTime: string;
  hours: number;
  serviceType: ServiceType;
  childIds: string[];
  notesForSitter: string;
  paymentMethod: 'PayNow QR' | 'Visa •••• 4242';
  applyReferralCredit: boolean;
}
