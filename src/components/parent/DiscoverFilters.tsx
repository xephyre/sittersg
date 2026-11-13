import React from 'react';
import { MapPin, SlidersHorizontal } from 'lucide-react';
import { ServiceType, SpokenLanguage } from '../../types';
import { GeocodedLocation } from '../../services/interfaces';

const SERVICE_OPTIONS: ('All' | ServiceType)[] = [
  'All',
  'Hourly Sitting',
  'Date Night',
  'School Pickup',
  'Holiday Care',
  'Same-Day Emergency',
  'Newborn Care',
  'Special Needs Care',
];

const LANGUAGES: ('All' | SpokenLanguage)[] = ['All', 'English', 'Mandarin', 'Malay', 'Tamil'];

interface DiscoverFiltersProps {
  postalInput: string;
  setPostalInput: (v: string) => void;
  resolvedLocation: GeocodedLocation | null;
  lookupLoading: boolean;
  lookupError: string | null;
  onGeocode: () => void;
  serviceType: 'All' | ServiceType;
  setServiceType: (v: 'All' | ServiceType) => void;
  language: 'All' | SpokenLanguage;
  setLanguage: (v: 'All' | SpokenLanguage) => void;
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  maxRate: number;
  setMaxRate: (v: number) => void;
  availableTodayOnly: boolean;
  setAvailableTodayOnly: React.Dispatch<React.SetStateAction<boolean>>;
  specialFilter: 'none' | 'newborn' | 'special_needs';
  setSpecialFilter: React.Dispatch<React.SetStateAction<'none' | 'newborn' | 'special_needs'>>;
  minRating: number;
  setMinRating: (v: number) => void;
  maxDistanceKm: number;
  setMaxDistanceKm: (v: number) => void;
}

export const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({
  postalInput,
  setPostalInput,
  resolvedLocation,
  lookupLoading,
  lookupError,
  onGeocode,
  serviceType,
  setServiceType,
  language,
  setLanguage,
  selectedDate,
  setSelectedDate,
  maxRate,
  setMaxRate,
  availableTodayOnly,
  setAvailableTodayOnly,
  specialFilter,
  setSpecialFilter,
  minRating,
  setMinRating,
  maxDistanceKm,
  setMaxDistanceKm,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-teal-700" />
        <h2 className="text-base font-bold text-slate-900">Search Verified Sitters Near You</h2>
      </div>
      <div className="text-xs text-slate-600 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
        {lookupLoading ? (
          <span>Looking up Singapore postal code via OneMap...</span>
        ) : lookupError ? (
          <span className="text-red-700 font-medium">{lookupError}</span>
        ) : resolvedLocation ? (
          <span>
            <span className="font-medium text-slate-900">{resolvedLocation.address}</span>
            {' · '}
            <span className="text-slate-500">
              {resolvedLocation.source === 'onemap'
                ? 'OneMap Live'
                : 'OneMap Fallback (set ONEMAP_API_TOKEN or ONEMAP_API_EMAIL in Secrets for live lookup)'}
            </span>
          </span>
        ) : (
          <span>Enter a 6-digit Singapore postal code</span>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGeocode();
        }}
        className="lg:col-span-2"
      >
        <label htmlFor="sg-postal-input" className="block text-xs font-semibold text-slate-700 mb-1">
          Singapore Postal Code (OneMap Lookup)
        </label>
        <div className="flex gap-2">
          <input
            id="sg-postal-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={postalInput}
            onChange={(e) => setPostalInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="e.g. 822215"
            className="flex-1 min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
          />
          <button
            type="submit"
            disabled={lookupLoading}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
          >
            {lookupLoading ? 'Looking up...' : 'Locate'}
          </button>
        </div>
      </form>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value as 'All' | ServiceType)}
          className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
        >
          {SERVICE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'All' | SpokenLanguage)}
          className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Max Rate (S${maxRate}/hr)
        </label>
        <input
          type="range"
          min={18}
          max={30}
          value={maxRate}
          onChange={(e) => setMaxRate(Number(e.target.value))}
          className="w-full h-11 accent-teal-700"
        />
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 pt-1">
      <button
        type="button"
        onClick={() => setAvailableTodayOnly((v) => !v)}
        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
          availableTodayOnly
            ? 'bg-teal-700 border-teal-700 text-white'
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        Available today
      </button>
      <button
        type="button"
        onClick={() => setSpecialFilter((v) => (v === 'newborn' ? 'none' : 'newborn'))}
        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
          specialFilter === 'newborn'
            ? 'bg-teal-700 border-teal-700 text-white'
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        Newborn certified
      </button>
      <button
        type="button"
        onClick={() => setSpecialFilter((v) => (v === 'special_needs' ? 'none' : 'special_needs'))}
        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
          specialFilter === 'special_needs'
            ? 'bg-teal-700 border-teal-700 text-white'
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        Special-needs trained
      </button>
      <select
        aria-label="Minimum rating"
        value={minRating}
        onChange={(e) => setMinRating(Number(e.target.value))}
        className="min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
      >
        <option value={4.5}>Rating 4.5+</option>
        <option value={4.8}>Rating 4.8+</option>
        <option value={4.9}>Rating 4.9+</option>
      </select>
      <select
        aria-label="Maximum distance"
        value={maxDistanceKm}
        onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
        className="min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
      >
        <option value={3}>Within 3 km</option>
        <option value={5}>Within 5 km</option>
        <option value={10}>Within 10 km</option>
        <option value={999}>All beta estates</option>
      </select>
    </div>
  </section>
);
