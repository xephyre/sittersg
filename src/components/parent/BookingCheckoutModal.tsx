import React, { useState } from 'react';
import { CheckCircle2, CreditCard, QrCode, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { Booking, ServiceType, Sitter } from '../../types';

interface BookingCheckoutModalProps {
  sitter: Sitter | null;
  initialDate?: string;
  initialTime?: string;
  onClose: () => void;
  onConfirmed: (booking: Booking) => void;
}

const SERVICE_TYPES: ServiceType[] = [
  'Hourly Sitting',
  'Date Night',
  'School Pickup',
  'Holiday Care',
  'Same-Day Emergency',
  'Newborn Care',
  'Special Needs Care',
];

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  sitter,
  initialDate,
  initialTime,
  onClose,
  onConfirmed,
}) => {
  const { activeParent, createBooking } = useApp();
  const [date, setDate] = useState(initialDate ?? '2026-11-13');
  const [startTime, setStartTime] = useState(initialTime?.split('–')[0] ?? '18:30');
  const [hours, setHours] = useState(3);
  const [serviceType, setServiceType] = useState<ServiceType>(
    sitter?.specialties[0] ?? 'Hourly Sitting'
  );
  const [selectedChildren, setSelectedChildren] = useState<string[]>(
    activeParent.children.map((c) => c.id)
  );
  const [notes, setNotes] = useState(
    'Helper on weekly rest day. Allergy instructions and emergency numbers shared in profile.'
  );
  const [paymentMethod, setPaymentMethod] = useState<'PayNow QR' | 'Visa •••• 4242'>('PayNow QR');
  const [applyCredit, setApplyCredit] = useState(activeParent.referralCreditsSgd > 0);
  const [processing, setProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!sitter) return null;

  const subtotal = sitter.hourlyRateSgd * hours;
  const platformFee = Number((subtotal * activeParent.membership.platformFeeRate).toFixed(2));
  const discount =
    applyCredit && activeParent.referralCreditsSgd > 0
      ? Math.min(15, activeParent.referralCreditsSgd)
      : 0;
  const total = Number(Math.max(0, subtotal + platformFee - discount).toFixed(2));

  const toggleChild = (id: string) =>
    setSelectedChildren((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const created = await createBooking({
      sitterId: sitter.id,
      date,
      startTime,
      hours,
      serviceType,
      childIds:
        selectedChildren.length > 0
          ? selectedChildren
          : [activeParent.children[0]?.id].filter(Boolean),
      notesForSitter: notes,
      paymentMethod,
      applyReferralCredit: applyCredit,
    });
    setProcessing(false);
    setConfirmedBooking(created);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl border border-slate-200 max-h-[93vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Demo mode · Cashless PayNow & Card Checkout</p>
            <h2 id="checkout-title" className="text-lg font-bold text-slate-900">
              {confirmedBooking ? 'Booking Confirmed' : `Book ${sitter.displayName}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking checkout"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-teal-700" />
                <span>Confirmed · {confirmedBooking.id}</span>
              </div>
              <p className="text-sm text-teal-900">
                {confirmedBooking.sitterName} is confirmed for {confirmedBooking.date} at{' '}
                {confirmedBooking.startTime} ({confirmedBooking.hours} hrs). Chat and live SOS
                protection are now active.
              </p>
              <p className="text-xs font-mono text-teal-800">
                Payment Ref: {confirmedBooking.paymentReference} · Total S$
                {confirmedBooking.totalSgd.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onConfirmed(confirmedBooking)}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold"
            >
              Go to Live Booking & Chat
            </button>
          </div>
        ) : (
          <form onSubmit={handlePayAndConfirm} className="p-5 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
                >
                  {[2, 3, 4, 5, 6, 8].map((h) => (
                    <option key={h} value={h}>
                      {h} hours
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
              >
                {SERVICE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5">
                Children (first name + age band only)
              </p>
              <div className="flex flex-wrap gap-2">
                {activeParent.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleChild(child.id)}
                    className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                      selectedChildren.includes(child.id)
                        ? 'bg-teal-700 border-teal-700 text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {child.firstName} · {child.ageBand}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-label="Care notes for sitter"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-700">
                <span>
                  {hours} hrs × S${sitter.hourlyRateSgd}/hr
                </span>
                <span className="font-mono tabular-nums">S${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>
                  Platform & insurance ({activeParent.membership.plan === 'plus' ? '10% Plus' : '20%'})
                </span>
                <span className="font-mono tabular-nums">S${platformFee.toFixed(2)}</span>
              </div>
              {activeParent.referralCreditsSgd > 0 && (
                <label className="flex items-center justify-between text-xs text-teal-800 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={applyCredit}
                      onChange={(e) => setApplyCredit(e.target.checked)}
                      className="accent-teal-700"
                    />
                    Apply S${Math.min(15, activeParent.referralCreditsSgd)} referral credit
                  </span>
                  <span className="font-mono tabular-nums">-S${discount.toFixed(2)}</span>
                </label>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                <span>Total (Insured booking)</span>
                <span className="font-mono tabular-nums">S${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['PayNow QR', 'Visa •••• 4242'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`min-h-[46px] p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                    paymentMethod === method
                      ? 'border-teal-700 bg-teal-50 text-teal-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {method === 'PayNow QR' ? (
                    <QrCode className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>{method}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'PayNow QR' && (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                SGQR PayNow · UEN <span className="font-mono font-semibold">202612345K</span>{' '}
                (SitterSG Pte Ltd) · Demo mode simulates instant settlement.
              </p>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {processing ? 'Processing Payment...' : `Pay S$${total.toFixed(2)} & Confirm`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
