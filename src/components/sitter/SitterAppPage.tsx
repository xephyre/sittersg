import React, { useState } from 'react';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Lock,
  LogOut,
  MapPin,
  Navigation,
  Power,
  Send,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { SitterAvatar } from '../common/SitterAvatar';
import { SitterOnboardingPanel } from './SitterOnboardingPanel';
import { SitterEarningsPanel } from './SitterEarningsPanel';

export const SitterAppPage: React.FC = () => {
  const {
    state,
    activeSitter,
    toggleSitterAvailableToday,
    toggleSitterAvailabilityWindow,
    advanceBookingStep,
    declineBooking,
    sendChatMessage,
  } = useApp();

  const [chatDrafts, setChatDrafts] = useState<Record<string, string>>({});
  const sitterBookings = state.bookings.filter((b) => b.sitterId === activeSitter.id);

  if (state.activeTab === 'sitter_onboarding') {
    return <SitterOnboardingPanel sitter={activeSitter} />;
  }

  if (state.activeTab === 'sitter_earnings') {
    return <SitterEarningsPanel activeSitter={activeSitter} sitterBookings={sitterBookings} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SitterAvatar sitter={activeSitter} size="md" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeSitter.displayName} · Sitter Portal
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {activeSitter.estate} ({activeSitter.nearestMrt}) · Rate S${activeSitter.hourlyRateSgd}
              /hr · Rating {activeSitter.rating.toFixed(2)}★
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleSitterAvailableToday(activeSitter.id)}
          className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
            activeSitter.availableToday
              ? 'bg-teal-700 border-teal-700 text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>
            {activeSitter.availableToday ? 'Available Today: ON' : 'Available Today: OFF'}
          </span>
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Job Requests & Active Sittings ({sitterBookings.length})
          </h2>

          {sitterBookings.map((b) => {
            const isPending = b.status === 'pending_sitter';
            const isCancelled = b.status === 'cancelled';
            const isActive = ['confirmed', 'on_the_way', 'checked_in'].includes(b.status);
            const chatMsgs = state.chatMessages.filter((m) => m.bookingId === b.id);

            return (
              <article
                key={b.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono text-slate-500">
                      {b.id} · Status: {b.status.replace(/_/g, ' ')}
                    </p>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {b.parentName} · {b.serviceType}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {b.date} at {b.startTime} ({b.hours} hrs) · {b.childSummary}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-500">Your Net Payout</p>
                    <p className="text-lg font-bold font-mono text-teal-800 tabular-nums">
                      S${b.sitterPayoutSgd.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1">
                  {isPending || isCancelled ? (
                    <p className="text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        <strong>PDPA Address Shield:</strong> {b.parentEstate} (Postal{' '}
                        <span className="font-mono">{b.parentPostalCode.slice(0, 3)}***</span>).
                        Exact block & unit unlock after you accept.
                      </span>
                    </p>
                  ) : (
                    <p className="text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>
                        <strong>Confirmed Family Address:</strong> {b.parentFullAddress}
                      </span>
                    </p>
                  )}
                  <p className="text-slate-600">
                    <strong>Notes:</strong> {b.notesForSitter}
                  </p>
                </div>

                {isPending && (
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        advanceBookingStep(
                          b.id,
                          'confirmed',
                          `${activeSitter.displayName} accepted booking.`
                        )
                      }
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Job (Unlock Address)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => declineBooking(b.id)}
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}

                {isActive && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() =>
                            advanceBookingStep(b.id, 'on_the_way', 'On the way to family home.')
                          }
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Mark On the Way</span>
                        </button>
                      )}
                      {(b.status === 'confirmed' || b.status === 'on_the_way') && (
                        <button
                          type="button"
                          onClick={() =>
                            advanceBookingStep(b.id, 'checked_in', 'Checked in safely.')
                          }
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Check In</span>
                        </button>
                      )}
                      {b.status === 'checked_in' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              advanceBookingStep(
                                b.id,
                                'photo_update',
                                'Playtime photo update uploaded by sitter.'
                              )
                            }
                            className="min-h-[44px] px-4 py-2 rounded-xl border border-teal-700 text-teal-800 hover:bg-teal-50 text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Upload Photo Update</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              advanceBookingStep(b.id, 'checked_out', 'Handover completed cleanly.')
                            }
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Check Out</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-700">
                        Chat with {b.parentName.split(' ')[0]}
                      </p>
                      {chatMsgs.slice(-2).map((m) => (
                        <p key={m.id} className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-900">
                            {m.senderName.split(' ')[0]}:
                          </span>{' '}
                          {m.text}
                        </p>
                      ))}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = chatDrafts[b.id] ?? '';
                          if (!val.trim()) return;
                          sendChatMessage(b.id, val, 'sitter');
                          setChatDrafts((prev) => ({ ...prev, [b.id]: '' }));
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={chatDrafts[b.id] ?? ''}
                          onChange={(e) =>
                            setChatDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))
                          }
                          placeholder="Send update to parent..."
                          className="flex-1 min-h-[40px] rounded-xl border border-slate-300 px-3 text-xs"
                        />
                        <button
                          type="submit"
                          className="min-h-[40px] px-3.5 rounded-xl bg-teal-700 text-white text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">Availability Calendar</h2>
          </div>
          <p className="text-xs text-slate-600">
            Tap a time block to toggle your open windows for Punggol & Sengkang parents.
          </p>
          <div className="space-y-3">
            {activeSitter.availability.map((slot) => (
              <div key={slot.date} className="rounded-xl border border-slate-200 p-3 space-y-2">
                <p className="text-xs font-bold text-slate-900">{slot.dayLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {['09:00–13:00', '18:30–22:30'].map((win) => {
                    const active = slot.windows.includes(win);
                    return (
                      <button
                        key={win}
                        type="button"
                        onClick={() =>
                          toggleSitterAvailabilityWindow(activeSitter.id, slot.date, win)
                        }
                        className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                          active
                            ? 'bg-teal-700 border-teal-700 text-white'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {win}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
