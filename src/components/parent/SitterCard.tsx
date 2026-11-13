import React from 'react';
import {
  BadgeCheck,
  Calendar,
  Clock,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Star,
  User,
  UserCheck,
} from 'lucide-react';
import { Sitter } from '../../types';
import { SitterAvatar } from '../common/SitterAvatar';

interface SitterCardProps {
  sitter: Sitter;
  distanceKm?: number;
  onViewProfile: (sitter: Sitter) => void;
  onBook: (sitter: Sitter) => void;
}

export const SitterCard: React.FC<SitterCardProps> = ({
  sitter,
  distanceKm,
  onViewProfile,
  onBook,
}) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors">
    <div className="space-y-3">
      <div className="flex items-start gap-3.5">
        <SitterAvatar sitter={sitter} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 truncate">{sitter.displayName}</h3>
            <span className="font-mono text-sm font-bold text-slate-900 tabular-nums shrink-0">
              S${sitter.hourlyRateSgd}/hr
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {sitter.estate}
              {distanceKm !== undefined ? ` · ${distanceKm.toFixed(1)} km` : ''} ·{' '}
              {sitter.nearestMrt}
            </span>
          </p>
          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
            <span className="font-semibold text-slate-900 tabular-nums">
              {sitter.rating.toFixed(2)}
            </span>
            <span className="text-slate-500 tabular-nums">({sitter.reviewCount})</span>
            <span aria-hidden="true">·</span>
            <span>{sitter.languages.join(', ')}</span>
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{sitter.bio}</p>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 leading-relaxed">
        <span className="text-teal-800 font-medium inline-flex items-center gap-1">
          <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
          Singpass
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <HeartPulse className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          First-aid/CPR
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          Interviewed
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          Insured
        </span>
        {sitter.availableToday && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Available today
            </span>
          </>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
      <button
        type="button"
        onClick={() => onViewProfile(sitter)}
        className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5"
      >
        <User className="w-3.5 h-3.5" />
        <span>View Profile</span>
      </button>
      <button
        type="button"
        onClick={() => onBook(sitter)}
        className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Book Slot</span>
      </button>
    </div>
  </article>
);
