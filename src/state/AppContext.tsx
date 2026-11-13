import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Booking,
  ChatMessage,
  Child,
  EmergencyContact,
  Incident,
  Parent,
  RoleMode,
  Sitter,
} from '../types';
import {
  SEED_BOOKINGS,
  SEED_CHAT_MESSAGES,
  SEED_INCIDENTS,
  SEED_NOTIFICATIONS,
  SEED_PARENTS,
  SEED_REVIEWS,
} from '../mocks/seedData';
import { SEED_SITTERS } from '../mocks/sitters';
import { myInfoService, singpassAuthService, storageService } from '../services/mockServices';
import { ActiveTab, AppState, CreateBookingInput } from './types';
import {
  buildNewBooking,
  buildReviewAndNudge,
  buildSosIncident,
  buildTimelineUpdate,
} from './bookingHelpers';

export type { ActiveTab };

const STORAGE_KEY = 'sittersg_demo_state_v1';

const INITIAL_STATE: AppState = {
  role: 'parent',
  activeTab: 'discover',
  sitters: SEED_SITTERS,
  parents: SEED_PARENTS,
  activeParentId: SEED_PARENTS[0].id,
  activeSitterId: SEED_SITTERS[0].id,
  bookings: SEED_BOOKINGS,
  reviews: SEED_REVIEWS,
  chatMessages: SEED_CHAT_MESSAGES,
  incidents: SEED_INCIDENTS,
  notifications: SEED_NOTIFICATIONS,
  rebookSitterId: null,
  sosBookingId: null,
  singpassModalOpen: false,
};

interface AppContextValue {
  state: AppState;
  activeParent: Parent;
  activeSitter: Sitter;
  unreadNotificationsCount: number;
  setRole: (role: RoleMode) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSingpassModalOpen: (open: boolean) => void;
  setRebookSitterId: (sitterId: string | null) => void;
  setSosBookingId: (bookingId: string | null) => void;
  completeParentSingpassLogin: (consentGranted: boolean) => Promise<void>;
  addChildToParent: (child: Omit<Child, 'id'>) => void;
  removeChildFromParent: (childId: string) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateParentAddress: (postalCode: string, addressDisplay: string, estate: Parent['estate']) => void;
  createBooking: (input: CreateBookingInput) => Promise<Booking>;
  advanceBookingStep: (
    bookingId: string,
    step: 'confirmed' | 'on_the_way' | 'checked_in' | 'photo_update' | 'checked_out',
    note?: string
  ) => Promise<void>;
  declineBooking: (bookingId: string) => Promise<void>;
  sendChatMessage: (bookingId: string, text: string, senderRole: 'parent' | 'sitter') => void;
  submitReview: (bookingId: string, rating: number, comment: string) => Promise<void>;
  triggerSos: (bookingId: string, details: string) => Promise<void>;
  upgradeToPlus: () => void;
  redeemReferralDemo: () => void;
  toggleSitterAvailableToday: (sitterId: string) => void;
  toggleSitterAvailabilityWindow: (sitterId: string, date: string, windowLabel: string) => void;
  completeSitterOnboardingStep: (
    sitterId: string,
    field: 'singpass' | 'firstAid' | 'interview' | 'signAgreement',
    workPass?: Sitter['verificationDocs']['workPassEligibility']
  ) => Promise<void>;
  adminReviewSitter: (sitterId: string, decision: 'approved' | 'rejected') => void;
  adminUpdateIncident: (incidentId: string, status: Incident['status'], adminNotes: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() =>
    storageService.load<AppState>(STORAGE_KEY, INITIAL_STATE)
  );

  useEffect(() => {
    storageService.save(STORAGE_KEY, state);
  }, [state]);

  const activeParent = useMemo(
    () => state.parents.find((p) => p.id === state.activeParentId) ?? state.parents[0],
    [state.parents, state.activeParentId]
  );

  const activeSitter = useMemo(
    () => state.sitters.find((s) => s.id === state.activeSitterId) ?? state.sitters[0],
    [state.sitters, state.activeSitterId]
  );

  const unreadNotificationsCount = useMemo(
    () =>
      state.notifications.filter(
        (n) => !n.read && (n.recipientRole === state.role || state.role === 'admin')
      ).length,
    [state.notifications, state.role]
  );

  const updateActiveParent = (updater: (p: Parent) => Parent) =>
    setState((prev) => ({
      ...prev,
      parents: prev.parents.map((p) => (p.id === prev.activeParentId ? updater(p) : p)),
    }));

  const setRole = (role: RoleMode) => {
    const activeTab: ActiveTab =
      role === 'parent' ? 'discover' : role === 'sitter' ? 'sitter_jobs' : 'admin_overview';
    setState((prev) => ({ ...prev, role, activeTab }));
  };

  const completeParentSingpassLogin = async (consentGranted: boolean) => {
    await singpassAuthService.completeDemoCallback('parent');
    const myInfo = await myInfoService.fetchParentProfile(consentGranted);
    setState((prev) => ({
      ...prev,
      singpassModalOpen: false,
      parents: prev.parents.map((p) =>
        p.id === prev.activeParentId
          ? { ...p, ...myInfo, singpassVerified: true, pdpaConsentAcceptedAt: new Date().toISOString() }
          : p
      ),
    }));
  };

  const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
    const sitter = state.sitters.find((s) => s.id === input.sitterId)!;
    const { booking, referralDiscountSgd, parentNotif, sitterNotif } = await buildNewBooking(
      input,
      sitter,
      activeParent
    );
    setState((prev) => ({
      ...prev,
      bookings: [booking, ...prev.bookings],
      parents: prev.parents.map((p) =>
        p.id === prev.activeParentId
          ? { ...p, referralCreditsSgd: Math.max(0, p.referralCreditsSgd - referralDiscountSgd) }
          : p
      ),
      notifications: [parentNotif, sitterNotif, ...prev.notifications],
      rebookSitterId: null,
    }));
    return booking;
  };

  const advanceBookingStep = async (
    bookingId: string,
    step: 'confirmed' | 'on_the_way' | 'checked_in' | 'photo_update' | 'checked_out',
    note?: string
  ) => {
    const target = state.bookings.find((b) => b.id === bookingId);
    if (!target) return;
    const { nextStatus, newEvent, notif } = await buildTimelineUpdate(target, step, note);
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: nextStatus, timeline: [...b.timeline, newEvent] } : b
      ),
      notifications: [notif, ...prev.notifications],
    }));
  };

  const submitReview = async (bookingId: string, rating: number, comment: string) => {
    const target = state.bookings.find((b) => b.id === bookingId);
    if (!target) return;
    const { newReview, rebookNudge } = await buildReviewAndNudge(target, rating, comment);
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, ratingSubmitted: rating, reviewSubmitted: comment } : b
      ),
      reviews: [newReview, ...prev.reviews],
      sitters: prev.sitters.map((s) =>
        s.id !== target.sitterId
          ? s
          : {
              ...s,
              reviewCount: s.reviewCount + 1,
              rating: Number(((s.rating * s.reviewCount + rating) / (s.reviewCount + 1)).toFixed(2)),
            }
      ),
      notifications: [rebookNudge, ...prev.notifications],
    }));
  };

  const triggerSos = async (bookingId: string, details: string) => {
    const target = state.bookings.find((b) => b.id === bookingId);
    if (!target) return;
    const { newIncident, sosNotif } = await buildSosIncident(target, details);
    setState((prev) => ({
      ...prev,
      sosBookingId: null,
      incidents: [newIncident, ...prev.incidents],
      notifications: [sosNotif, ...prev.notifications],
    }));
  };

  const completeSitterOnboardingStep = async (
    sitterId: string,
    field: 'singpass' | 'firstAid' | 'interview' | 'signAgreement',
    workPass?: Sitter['verificationDocs']['workPassEligibility']
  ) => {
    if (field === 'signAgreement') await singpassAuthService.signAgreement(sitterId);
    if (field === 'singpass') await singpassAuthService.completeDemoCallback('sitter');
    setState((prev) => ({
      ...prev,
      sitters: prev.sitters.map((s) => {
        if (s.id !== sitterId) return s;
        const docs = { ...s.verificationDocs };
        if (workPass) docs.workPassEligibility = workPass;
        if (field === 'singpass') docs.singpassIdentity = 'verified';
        if (field === 'firstAid') {
          docs.firstAidCertStatus = 'verified';
          docs.firstAidProvider = 'Singapore Red Cross (Child First Aid & CPR)';
          docs.firstAidExpiry = '2028-11-01';
        }
        if (field === 'interview') {
          docs.interviewStatus = 'completed';
          docs.interviewSlot = 'Completed with T&S Lead';
        }
        if (field === 'signAgreement') docs.agreementSignedWithSingpass = true;
        return {
          ...s,
          verificationDocs: docs,
          verifiedBadges: {
            ...s.verifiedBadges,
            singpass: docs.singpassIdentity === 'verified',
            firstAidCpr: docs.firstAidCertStatus === 'verified',
            interviewed: docs.interviewStatus === 'completed',
          },
        };
      }),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        activeParent,
        activeSitter,
        unreadNotificationsCount,
        setRole,
        setActiveTab: (activeTab) => setState((prev) => ({ ...prev, activeTab })),
        setSingpassModalOpen: (singpassModalOpen) => setState((prev) => ({ ...prev, singpassModalOpen })),
        setRebookSitterId: (rebookSitterId) => setState((prev) => ({ ...prev, rebookSitterId })),
        setSosBookingId: (sosBookingId) => setState((prev) => ({ ...prev, sosBookingId })),
        completeParentSingpassLogin,
        addChildToParent: (c) =>
          updateActiveParent((p) => ({ ...p, children: [...p.children, { ...c, id: `child_${Date.now()}` }] })),
        removeChildFromParent: (id) =>
          updateActiveParent((p) => ({ ...p, children: p.children.filter((c) => c.id !== id) })),
        addEmergencyContact: (ec) =>
          updateActiveParent((p) => ({
            ...p,
            emergencyContacts: [...p.emergencyContacts, { ...ec, id: `ec_${Date.now()}` }],
          })),
        updateParentAddress: (postalCode, addressDisplay, estate) =>
          updateActiveParent((p) => ({ ...p, postalCode, addressDisplay, estate })),
        createBooking,
        advanceBookingStep,
        declineBooking: async (id) =>
          setState((prev) => ({
            ...prev,
            bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
          })),
        sendChatMessage: (bookingId, text, senderRole) => {
          if (!text.trim()) return;
          const msg: ChatMessage = {
            id: `msg_${Date.now()}`,
            bookingId,
            senderRole,
            senderName: senderRole === 'parent' ? activeParent.fullName : activeSitter.displayName,
            text: text.trim(),
            sentAt: new Date().toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit' }),
          };
          setState((prev) => ({ ...prev, chatMessages: [...prev.chatMessages, msg] }));
        },
        submitReview,
        triggerSos,
        upgradeToPlus: () =>
          updateActiveParent((p) => ({
            ...p,
            membership: {
              plan: 'plus',
              monthlyPriceSgd: 29,
              platformFeeRate: 0.1,
              priorityEmergencyAccess: true,
              renewsAt: '12 Dec 2026',
            },
          })),
        redeemReferralDemo: () =>
          updateActiveParent((p) => ({ ...p, referralCreditsSgd: p.referralCreditsSgd + 15 })),
        toggleSitterAvailableToday: (id) =>
          setState((prev) => ({
            ...prev,
            sitters: prev.sitters.map((s) => (s.id === id ? { ...s, availableToday: !s.availableToday } : s)),
          })),
        toggleSitterAvailabilityWindow: (sitterId, date, windowLabel) =>
          setState((prev) => ({
            ...prev,
            sitters: prev.sitters.map((s) =>
              s.id !== sitterId
                ? s
                : {
                    ...s,
                    availability: s.availability.map((slot) =>
                      slot.date !== date
                        ? slot
                        : {
                            ...slot,
                            windows: slot.windows.includes(windowLabel)
                              ? slot.windows.filter((w) => w !== windowLabel)
                              : [...slot.windows, windowLabel],
                          }
                    ),
                  }
            ),
          })),
        completeSitterOnboardingStep,
        adminReviewSitter: (sitterId, decision) =>
          setState((prev) => ({
            ...prev,
            sitters: prev.sitters.map((s) =>
              s.id !== sitterId
                ? s
                : {
                    ...s,
                    verificationStatus: decision,
                    verifiedBadges: {
                      singpass: true,
                      firstAidCpr: decision === 'approved',
                      interviewed: decision === 'approved',
                      insured: decision === 'approved',
                    },
                  }
            ),
          })),
        adminUpdateIncident: (id, status, adminNotes) =>
          setState((prev) => ({
            ...prev,
            incidents: prev.incidents.map((inc) => (inc.id === id ? { ...inc, status, adminNotes } : inc)),
          })),
        markAllNotificationsRead: () =>
          setState((prev) => ({
            ...prev,
            notifications: prev.notifications.map((n) => ({ ...n, read: true })),
          })),
        resetDemoData: () => {
          storageService.clear(STORAGE_KEY);
          setState(INITIAL_STATE);
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
