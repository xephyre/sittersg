import { Booking, Incident, NotificationItem, Parent, Review, Sitter } from '../types';
import { PLAYTIME_PHOTO_UPDATE_URL } from '../mocks/sitters';
import { notificationService, paymentService } from '../services/mockServices';
import { CreateBookingInput } from './types';

export async function buildNewBooking(
  input: CreateBookingInput,
  sitter: Sitter,
  activeParent: Parent
): Promise<{
  booking: Booking;
  referralDiscountSgd: number;
  parentNotif: NotificationItem;
  sitterNotif: NotificationItem;
}> {
  const subtotalSgd = Number((sitter.hourlyRateSgd * input.hours).toFixed(2));
  const platformFeeSgd = Number((subtotalSgd * activeParent.membership.platformFeeRate).toFixed(2));
  const referralDiscountSgd =
    input.applyReferralCredit && activeParent.referralCreditsSgd > 0
      ? Math.min(15, activeParent.referralCreditsSgd)
      : 0;
  const totalSgd = Number(Math.max(0, subtotalSgd + platformFeeSgd - referralDiscountSgd).toFixed(2));
  const sitterPayoutSgd = Number((subtotalSgd * 0.8).toFixed(2));
  const bookingId = `BK-${Math.floor(261200 + Math.random() * 800)}`;

  const payment = await paymentService.processBookingPayment({
    bookingId,
    amountSgd: totalSgd,
    method: input.paymentMethod,
  });

  const childSummary =
    activeParent.children
      .filter((c) => input.childIds.includes(c.id))
      .map((c) => `${c.firstName} (${c.ageBand.split(' ')[0]})`)
      .join(', ') || '1 child';

  const booking: Booking = {
    id: bookingId,
    parentId: activeParent.id,
    parentName: activeParent.fullName,
    parentEstate: activeParent.estate,
    parentPostalCode: activeParent.postalCode,
    parentFullAddress: activeParent.addressDisplay,
    sitterId: sitter.id,
    sitterName: sitter.displayName,
    childIds: input.childIds,
    childSummary,
    serviceType: input.serviceType,
    date: input.date,
    startTime: input.startTime,
    hours: input.hours,
    hourlyRateSgd: sitter.hourlyRateSgd,
    subtotalSgd,
    platformFeeSgd,
    referralDiscountSgd,
    totalSgd,
    sitterPayoutSgd,
    paymentMethod: input.paymentMethod,
    paymentReference: payment.paymentReference,
    status: 'confirmed',
    confirmedWithin24h: true,
    createdAt: new Date().toISOString(),
    notesForSitter: input.notesForSitter,
    timeline: [
      {
        id: `tl_${Date.now()}`,
        step: 'confirmed',
        label: 'Sitter confirmed',
        timestamp: 'Just now',
        note: `Cashless payment ${payment.paymentReference} verified. Insured coverage active.`,
      },
    ],
  };

  const parentNotif = await notificationService.sendWhatsAppAndPush({
    channel: 'WhatsApp',
    recipientRole: 'parent',
    category: 'booking_confirmed',
    title: `Booking confirmed with ${sitter.displayName}`,
    body: `[SitterSG] ${input.date} at ${input.startTime} (${input.hours}h) · S$${totalSgd.toFixed(2)} paid via ${input.paymentMethod}. Chat unlocked.`,
    relatedBookingId: bookingId,
    ctaLabel: 'Open live booking',
  });

  const sitterNotif = await notificationService.sendWhatsAppAndPush({
    channel: 'WhatsApp',
    recipientRole: 'sitter',
    category: 'booking_confirmed',
    title: `Confirmed booking in ${activeParent.estate}`,
    body: `${activeParent.fullName} · ${input.date} ${input.startTime} (${input.hours}h) · Net S$${sitterPayoutSgd.toFixed(2)}.`,
    relatedBookingId: bookingId,
  });

  return { booking, referralDiscountSgd, parentNotif, sitterNotif };
}

export async function buildTimelineUpdate(
  target: Booking,
  step: 'confirmed' | 'on_the_way' | 'checked_in' | 'photo_update' | 'checked_out',
  note?: string
) {
  const labels = {
    confirmed: 'Sitter confirmed',
    on_the_way: 'On the way',
    checked_in: 'Checked in',
    photo_update: 'Photo update',
    checked_out: 'Checked out',
  };
  const nextStatus: Booking['status'] =
    step === 'photo_update' ? (target.status === 'checked_out' ? 'checked_out' : 'checked_in') : step;
  const newEvent = {
    id: `tl_${Date.now()}`,
    step,
    label: labels[step],
    timestamp: new Date().toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit' }),
    note,
    photoUrl: step === 'photo_update' ? PLAYTIME_PHOTO_UPDATE_URL : undefined,
  };
  const notif = await notificationService.sendWhatsAppAndPush({
    channel: step === 'photo_update' || step === 'checked_out' ? 'WhatsApp' : 'Push',
    recipientRole: 'parent',
    category:
      step === 'confirmed'
        ? 'booking_confirmed'
        : step === 'photo_update'
          ? 'photo_update'
          : step === 'checked_out'
            ? 'check_out'
            : 'check_in',
    title: `${target.sitterName}: ${labels[step]}`,
    body:
      step === 'checked_out'
        ? `Session ended safely. Tap to rate ${target.sitterName} and claim a rebook slot.`
        : note || `${target.sitterName} updated booking ${target.id}.`,
    relatedBookingId: target.id,
  });
  return { nextStatus, newEvent, notif };
}

export async function buildReviewAndNudge(target: Booking, rating: number, comment: string) {
  const newReview: Review = {
    id: `rev_${Date.now()}`,
    bookingId: target.id,
    sitterId: target.sitterId,
    parentName: `${target.parentName.split(' ')[0]} ${target.parentName.split(' ')[1]?.[0] ?? ''}.`,
    estate: target.parentEstate,
    rating,
    comment,
    createdAt: 'Today',
    serviceType: target.serviceType,
  };
  const rebookNudge = await notificationService.sendWhatsAppAndPush({
    channel: 'WhatsApp',
    recipientRole: 'parent',
    category: 'rebook_nudge',
    title: `Book ${target.sitterName} again for Friday?`,
    body: `Thanks for rating ${target.sitterName} ${rating}★! Reserve her next ${target.parentEstate} slot in 2 taps.`,
    relatedBookingId: target.id,
    ctaLabel: `Rebook ${target.sitterName}`,
  });
  return { newReview, rebookNudge };
}

export async function buildSosIncident(target: Booking, details: string) {
  const newIncident: Incident = {
    id: `INC-${Math.floor(110 + Math.random() * 890)}`,
    bookingId: target.id,
    type: 'SOS Alert',
    severity: 'critical',
    reportedBy: 'parent',
    reporterName: target.parentName,
    sitterName: target.sitterName,
    estate: target.parentEstate,
    summary: details || 'Parent triggered live SOS emergency escalation.',
    status: 'open',
    adminNotes: '24/7 Trust & Safety on-call officer paged; calling parent & emergency contact.',
    createdAt: 'Just now',
  };
  const sosNotif = await notificationService.sendWhatsAppAndPush({
    channel: 'WhatsApp',
    recipientRole: 'admin',
    category: 'sos_alert',
    title: `CRITICAL SOS · ${target.id} (${target.parentEstate})`,
    body: `${target.parentName} triggered SOS during booking with ${target.sitterName}.`,
    relatedBookingId: target.id,
  });
  return { newIncident, sosNotif };
}
