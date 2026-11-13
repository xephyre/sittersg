import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Star } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { Booking } from '../../types';
import { BookingTimelineCard } from './BookingTimelineCard';
import { BookingChatCard } from './BookingChatCard';

export const ParentBookingsPage: React.FC = () => {
  const {
    state,
    activeParent,
    setSosBookingId,
    setActiveTab,
    setRebookSitterId,
    sendChatMessage,
    submitReview,
    advanceBookingStep,
  } = useApp();

  const parentBookings = state.bookings.filter((b) => b.parentId === activeParent.id);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(parentBookings[0]?.id ?? '');
  const [ratingDraft, setRatingDraft] = useState(5);
  const [reviewDraft, setReviewDraft] = useState('');

  const activeBooking: Booking | undefined =
    parentBookings.find((b) => b.id === selectedBookingId) ?? parentBookings[0];

  const isBookingActive = Boolean(
    activeBooking && ['confirmed', 'on_the_way', 'checked_in'].includes(activeBooking.status)
  );
  const isChatUnlocked = Boolean(
    activeBooking &&
      activeBooking.status !== 'pending_sitter' &&
      activeBooking.status !== 'cancelled'
  );
  const messages = activeBooking
    ? state.chatMessages.filter((m) => m.bookingId === activeBooking.id)
    : [];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;
    await submitReview(
      activeBooking.id,
      ratingDraft,
      reviewDraft.trim() || 'Wonderful, reliable care and clear check-in updates.'
    );
    setReviewDraft('');
  };

  if (!activeBooking) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
        <h1 className="text-xl font-bold text-slate-900">No bookings yet</h1>
        <p className="text-sm text-slate-600">
          Find a Singpass-verified sitter in Punggol, Sengkang, or Tampines to get started.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold"
        >
          Browse Sitters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Bookings & Updates</h1>
          <p className="text-sm text-slate-600">
            Track real-time check-ins, photo updates, in-app chat, and 24/7 SOS support.
          </p>
        </div>

        {isBookingActive && (
          <button
            type="button"
            onClick={() => setSosBookingId(activeBooking.id)}
            className="min-h-[48px] px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SOS Emergency Help</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <aside className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          <div className="p-4">
            <h2 className="text-sm font-bold text-slate-900">
              Your Sessions ({parentBookings.length})
            </h2>
          </div>
          {parentBookings.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBookingId(b.id)}
              className={`w-full text-left p-4 transition-colors min-h-[64px] ${
                b.id === activeBooking.id ? 'bg-teal-50/70' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{b.sitterName}</span>
                <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                  S${b.totalSgd.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {b.date} · {b.startTime} ({b.hours}h) · {b.serviceType}
              </p>
              <p className="text-xs text-teal-800 font-medium mt-1 capitalize">
                {b.status.replace(/_/g, ' ')} · {b.id}
              </p>
            </button>
          ))}
        </aside>

        <div className="lg:col-span-2 space-y-6">
          <BookingTimelineCard
            booking={activeBooking}
            isBookingActive={isBookingActive}
            onAdvanceStep={advanceBookingStep}
          />

          <BookingChatCard
            booking={activeBooking}
            isChatUnlocked={isChatUnlocked}
            messages={messages}
            onSend={(id, txt) => sendChatMessage(id, txt, 'parent')}
          />

          {activeBooking.status === 'checked_out' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeBooking.ratingSubmitted
                      ? 'Your Rating & Rebook'
                      : `Rate ${activeBooking.sitterName}`}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Repeat families keep care consistent for your children.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRebookSitterId(activeBooking.sitterId);
                    setActiveTab('discover');
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Book {activeBooking.sitterName.split(' ')[0]} again for Friday?</span>
                </button>
              </div>

              {activeBooking.ratingSubmitted ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    You rated {activeBooking.ratingSubmitted} / 5 stars
                  </p>
                  {activeBooking.reviewSubmitted && (
                    <p className="text-sm text-slate-600">“{activeBooking.reviewSubmitted}”</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingDraft(star)}
                        aria-label={`Rate ${star} stars`}
                        className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= ratingDraft ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-mono text-slate-700 ml-2">
                      {ratingDraft}.0 / 5
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={reviewDraft}
                    onChange={(e) => setReviewDraft(e.target.value)}
                    placeholder={`Share how ${activeBooking.sitterName} cared for your family...`}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
