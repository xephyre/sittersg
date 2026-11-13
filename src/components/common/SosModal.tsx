import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';

export const SosModal: React.FC = () => {
  const { state, setSosBookingId, triggerSos, activeParent } = useApp();
  const [reason, setReason] = useState(
    'Need immediate 24/7 Trust & Safety support check-in during active session.'
  );
  const [submitted, setSubmitted] = useState(false);

  const booking = state.bookings.find((b) => b.id === state.sosBookingId);
  if (!booking) return null;

  const handleConfirmSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    await triggerSos(booking.id, reason);
    setTimeout(() => {
      setSubmitted(false);
    }, 300);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="sos-modal-title" className="text-lg font-bold text-slate-900">
                24/7 Safety & SOS Escalation
              </h2>
              <p className="text-xs text-slate-500">
                Booking {booking.id} · {booking.sitterName} · {booking.parentEstate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSosBookingId(null)}
            aria-label="Close SOS dialog"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-900 space-y-1.5">
          <p className="font-semibold">
            For life-threatening emergencies in Singapore, dial 995 (SCDF) or 999 (Police) first.
          </p>
          <p className="text-xs text-red-800">
            Triggering SitterSG SOS immediately pages our 24/7 Trust & Safety incident lead, logs a
            critical alert in the Admin console, and notifies your primary emergency contact (
            {activeParent.emergencyContacts[0]?.name ?? 'Spouse'}).
          </p>
        </div>

        <form onSubmit={handleConfirmSos} className="space-y-4">
          <div>
            <label htmlFor="sos-notes" className="block text-sm font-semibold text-slate-800 mb-1.5">
              What is happening?
            </label>
            <textarea
              id="sos-notes"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitted}
              className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{submitted ? 'Alerting 24/7 Safety Team...' : 'Send SOS Alert Now'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSosBookingId(null)}
              className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
