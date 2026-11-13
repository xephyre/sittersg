import React from 'react';
import { BadgeCheck, Calendar, HeartHandshake, Shield, Star, X } from 'lucide-react';
import { Review, Sitter } from '../../types';
import { SitterAvatar } from '../common/SitterAvatar';

interface SitterDetailDrawerProps {
  sitter: Sitter | null;
  distanceKm?: number;
  reviews: Review[];
  onClose: () => void;
  onBook: (sitter: Sitter, preselectedDate?: string, preselectedWindow?: string) => void;
}

export const SitterDetailDrawer: React.FC<SitterDetailDrawerProps> = ({
  sitter,
  distanceKm,
  reviews,
  onClose,
  onBook,
}) => {
  if (!sitter) return null;

  const sitterReviews = reviews.filter((r) => r.sitterId === sitter.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sitter-detail-name"
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <SitterAvatar sitter={sitter} size="lg" />
            <div className="space-y-1">
              <h2 id="sitter-detail-name" className="text-xl font-bold text-slate-900">
                {sitter.displayName}
              </h2>
              <p className="text-sm text-slate-600">
                {sitter.estate} ({sitter.nearestMrt})
                {distanceKm !== undefined ? ` · ${distanceKm.toFixed(1)} km away` : ''}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-0.5">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-900 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {sitter.rating.toFixed(2)} ({sitter.reviewCount} reviews)
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{sitter.yearsExperience} yrs experience</span>
                <span aria-hidden="true">·</span>
                <span>{sitter.languages.join(' / ')}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sitter profile"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-xl border border-slate-200 p-3 flex items-center gap-2 text-slate-800 font-medium">
              <BadgeCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Singpass ✓</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 flex items-center gap-2 text-slate-800 font-medium">
              <HeartHandshake className="w-4 h-4 text-teal-700 shrink-0" />
              <span>First-aid/CPR ✓</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 flex items-center gap-2 text-slate-800 font-medium">
              <BadgeCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Interviewed ✓</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 flex items-center gap-2 text-slate-800 font-medium">
              <Shield className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Insured ✓</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">About & Care Experience</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{sitter.bio}</p>
            <p className="text-xs text-slate-500 pt-1">
              Specialties: {sitter.specialties.join(' · ')}
              {sitter.newbornCertified ? ' · Newborn certified' : ''}
              {sitter.specialNeedsTrained ? ' · Special-needs trained' : ''}
            </p>
            <p className="text-xs text-slate-500">
              First-aid credential: {sitter.verificationDocs.firstAidProvider ?? 'Accredited Child First Aid'} ·
              PDPA note: exact sitter residential address is kept private.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Available Slots (tap a window to book)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sitter.availability.map((slot) => (
                <div key={slot.date} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-900">{slot.dayLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {slot.windows.map((win) => (
                      <button
                        key={win}
                        type="button"
                        onClick={() => onBook(sitter, slot.date, win)}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg border border-teal-700/30 bg-teal-50/70 hover:bg-teal-700 hover:text-white text-teal-900 text-xs font-mono font-medium transition-colors"
                      >
                        {win}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Parent Reviews ({sitterReviews.length > 0 ? sitterReviews.length : sitter.reviewCount})
            </h3>
            {sitterReviews.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {sitterReviews.map((rev) => (
                  <div key={rev.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">
                        {rev.parentName} · {rev.estate}
                      </span>
                      <span className="font-mono text-slate-600 tabular-nums">
                        {rev.rating.toFixed(1)}★ · {rev.createdAt}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Trusted by {sitter.repeatFamilyCount} repeat families in {sitter.estate}. Average
                response time ~{sitter.responseTimeMinutes} mins.
              </p>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Hourly rate</p>
            <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              S${sitter.hourlyRateSgd}/hr
            </p>
          </div>
          <button
            type="button"
            onClick={() => onBook(sitter)}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Book {sitter.displayName.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};
