import React, { useState } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Booking } from '../../types';

interface Props {
  booking: Booking;
  isBookingActive: boolean;
  onAdvanceStep: (
    bookingId: string,
    step: 'confirmed' | 'on_the_way' | 'checked_in' | 'photo_update' | 'checked_out',
    note?: string
  ) => Promise<void>;
}

const TIMELINE_STEPS: { key: Booking['timeline'][number]['step']; label: string }[] = [
  { key: 'confirmed', label: 'Sitter confirmed' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'checked_in', label: 'Checked in' },
  { key: 'photo_update', label: 'Photo update' },
  { key: 'checked_out', label: 'Checked out' },
];

export const BookingTimelineCard: React.FC<Props> = ({
  booking,
  isBookingActive,
  onAdvanceStep,
}) => {
  const [photoError, setPhotoError] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-mono text-slate-500">
            {booking.id} · {booking.paymentMethod} ({booking.paymentReference})
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            {booking.sitterName} · {booking.serviceType}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {booking.date} at {booking.startTime} ({booking.hours} hrs) · {booking.childSummary}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-500">Insured Total</p>
          <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            S${booking.totalSgd.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">Live Sitting Timeline</h3>
          {isBookingActive && (
            <div className="flex flex-wrap gap-2">
              {booking.status === 'confirmed' && (
                <button
                  type="button"
                  onClick={() =>
                    onAdvanceStep(booking.id, 'on_the_way', 'Sitter departed via MRT/LRT.')
                  }
                  className="min-h-[36px] px-3 py-1 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Simulate: On the way
                </button>
              )}
              {booking.status === 'on_the_way' && (
                <button
                  type="button"
                  onClick={() =>
                    onAdvanceStep(booking.id, 'checked_in', 'Arrived safely at family unit.')
                  }
                  className="min-h-[36px] px-3 py-1 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Simulate: Check in
                </button>
              )}
              {booking.status === 'checked_in' && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onAdvanceStep(
                        booking.id,
                        'photo_update',
                        'Calm reading & block play before bedtime!'
                      )
                    }
                    className="min-h-[36px] px-3 py-1 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Simulate: Photo update
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAdvanceStep(
                        booking.id,
                        'checked_out',
                        'Parent returned home; handover complete.'
                      )
                    }
                    className="min-h-[36px] px-3 py-1 rounded-lg border border-teal-700 text-xs font-semibold text-teal-800 hover:bg-teal-50"
                  >
                    Simulate: Check out
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <ol className="space-y-3">
          {TIMELINE_STEPS.map((stepDef) => {
            const matched = [...booking.timeline].reverse().find((e) => e.step === stepDef.key);
            return (
              <li
                key={stepDef.key}
                className={`rounded-xl border p-3.5 flex items-start gap-3 ${
                  matched
                    ? 'border-teal-200 bg-teal-50/40'
                    : 'border-slate-200 bg-slate-50/40 opacity-65'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    matched ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {stepDef.key === 'photo_update' ? (
                    <Camera className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{stepDef.label}</p>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {matched ? matched.timestamp : 'Pending'}
                    </span>
                  </div>
                  {matched?.note && <p className="text-xs text-slate-600">{matched.note}</p>}
                  {matched?.photoUrl && (
                    <div className="pt-2">
                      {!photoError ? (
                        <img
                          src={matched.photoUrl}
                          alt="Playtime update shared by sitter"
                          referrerPolicy="no-referrer"
                          onError={() => setPhotoError(true)}
                          className="w-full max-w-sm rounded-xl border border-slate-200 object-cover aspect-[4/3]"
                        />
                      ) : (
                        <div className="w-full max-w-sm aspect-[4/3] rounded-xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-xs text-slate-500 p-4">
                          <Camera className="w-6 h-6 mb-1" />
                          <span>Playtime photo update saved securely</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
