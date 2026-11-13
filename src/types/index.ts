export type RoleMode = 'parent' | 'sitter' | 'admin';

export type EstateArea = 'Punggol' | 'Sengkang' | 'Tampines';

export type SpokenLanguage = 'English' | 'Mandarin' | 'Malay' | 'Tamil';

export type ServiceType =
  | 'Hourly Sitting'
  | 'Date Night'
  | 'School Pickup'
  | 'Holiday Care'
  | 'Same-Day Emergency'
  | 'Newborn Care'
  | 'Special Needs Care';

export type AgeBand =
  | 'Newborn (0–6m)'
  | 'Infant (6–12m)'
  | 'Toddler (1–3y)'
  | 'Preschool (4–6y)'
  | 'Primary (7–12y)';

export interface Child {
  id: string;
  firstName: string; // PDPA: minimal child identifier (first name only)
  ageBand: AgeBand;
  allergies: string;
  dietaryNotes: string; // e.g. Halal, Vegetarian, No pork/lard
  culturalNotes: string;
  specialNeedsFlag: boolean;
  specialNeedsDetails?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface Membership {
  plan: 'free' | 'plus';
  monthlyPriceSgd: number;
  platformFeeRate: number; // e.g. 0.20 standard vs 0.10 Plus
  priorityEmergencyAccess: boolean;
  renewsAt?: string;
}

export interface Parent {
  id: string;
  fullName: string;
  maskedNric: string; // PDPA: always masked e.g. S****123A
  dateOfBirth: string;
  phone: string;
  postalCode: string;
  estate: EstateArea;
  addressDisplay: string; // Full block/street address revealed to sitter only upon confirmed booking
  singpassVerified: boolean;
  pdpaConsentAcceptedAt?: string;
  children: Child[];
  emergencyContacts: EmergencyContact[];
  membership: Membership;
  referralCode: string;
  referralCreditsSgd: number;
}

export interface SitterVerificationDoc {
  singpassIdentity: 'verified' | 'pending';
  workPassEligibility: 'Citizen / PR' | 'LTVP+ (LOC)' | 'Work Pass Restricted';
  firstAidCertStatus: 'verified' | 'pending_review' | 'missing';
  firstAidProvider?: string;
  firstAidExpiry?: string;
  interviewStatus: 'completed' | 'scheduled' | 'not_scheduled';
  interviewSlot?: string;
  agreementSignedWithSingpass: boolean;
}

export interface SitterAvailabilitySlot {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Thu 13 Nov"
  windows: string[]; // e.g. ["09:00–13:00", "18:30–22:30"]
}

export interface Sitter {
  id: string;
  displayName: string;
  avatarUrl?: string;
  initials: string;
  accentTone: 'teal' | 'amber' | 'indigo' | 'rose';
  estate: EstateArea;
  nearestMrt: string;
  postalCode: string;
  maskedNric: string;
  languages: SpokenLanguage[];
  hourlyRateSgd: number;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  bio: string;
  specialties: ServiceType[];
  newbornCertified: boolean;
  specialNeedsTrained: boolean;
  availableToday: boolean;
  verifiedBadges: {
    singpass: boolean;
    firstAidCpr: boolean;
    interviewed: boolean;
    insured: boolean;
  };
  verificationStatus: 'approved' | 'pending_review' | 'rejected';
  verificationDocs: SitterVerificationDoc;
  availability: SitterAvailabilitySlot[];
  responseTimeMinutes: number;
  repeatFamilyCount: number;
}

export type BookingStatus =
  | 'pending_sitter'
  | 'confirmed'
  | 'on_the_way'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export interface BookingTimelineEvent {
  id: string;
  step: 'confirmed' | 'on_the_way' | 'checked_in' | 'photo_update' | 'checked_out';
  label: string;
  timestamp: string;
  note?: string;
  photoUrl?: string;
}

export interface Booking {
  id: string;
  parentId: string;
  parentName: string;
  parentEstate: EstateArea;
  parentPostalCode: string;
  parentFullAddress: string; // Hidden from sitter until status !== 'pending_sitter' && !== 'cancelled'
  sitterId: string;
  sitterName: string;
  childIds: string[];
  childSummary: string;
  serviceType: ServiceType;
  date: string;
  startTime: string;
  hours: number;
  hourlyRateSgd: number;
  subtotalSgd: number;
  platformFeeSgd: number;
  referralDiscountSgd: number;
  totalSgd: number;
  sitterPayoutSgd: number;
  paymentMethod: 'PayNow QR' | 'Visa •••• 4242';
  paymentReference: string;
  status: BookingStatus;
  confirmedWithin24h: boolean;
  createdAt: string;
  notesForSitter: string;
  timeline: BookingTimelineEvent[];
  ratingSubmitted?: number;
  reviewSubmitted?: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderRole: 'parent' | 'sitter';
  senderName: string;
  text: string;
  sentAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  sitterId: string;
  parentName: string;
  estate: EstateArea;
  rating: number;
  comment: string;
  createdAt: string;
  serviceType: ServiceType;
}

export interface Incident {
  id: string;
  bookingId: string;
  type: 'SOS Alert' | 'Late Arrival' | 'Care Concern' | 'Billing Dispute';
  severity: 'critical' | 'moderate' | 'low';
  reportedBy: 'parent' | 'sitter';
  reporterName: string;
  sitterName: string;
  estate: EstateArea;
  summary: string;
  status: 'open' | 'investigating' | 'resolved';
  adminNotes: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  channel: 'WhatsApp' | 'Push';
  recipientRole: RoleMode;
  category:
    | 'booking_confirmed'
    | 'check_in'
    | 'photo_update'
    | 'check_out'
    | 'rate_sitter'
    | 'rebook_nudge'
    | 'holiday_reminder'
    | 'sos_alert';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  relatedBookingId?: string;
  ctaLabel?: string;
}
