import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { oneMapService } from '../../services/mockServices';
import { GeocodedLocation } from '../../services/interfaces';
import { Booking, ServiceType, Sitter, SpokenLanguage } from '../../types';
import { SitterAvatar } from '../common/SitterAvatar';
import { SitterDetailDrawer } from './SitterDetailDrawer';
import { BookingCheckoutModal } from './BookingCheckoutModal';
import { DiscoverFilters } from './DiscoverFilters';
import { SitterCard } from './SitterCard';

export const ParentDiscoverPage: React.FC = () => {
  const { state, activeParent, setActiveTab, setSingpassModalOpen, setRebookSitterId } = useApp();

  const [postalInput, setPostalInput] = useState(activeParent.postalCode);
  const [resolvedLocation, setResolvedLocation] = useState<
    (GeocodedLocation & { queriedPostal?: string }) | null
  >(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [serviceType, setServiceType] = useState<'All' | ServiceType>('All');
  const [language, setLanguage] = useState<'All' | SpokenLanguage>('All');
  const [maxRate, setMaxRate] = useState(30);
  const [minRating, setMinRating] = useState(4.5);
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [specialFilter, setSpecialFilter] = useState<'none' | 'newborn' | 'special_needs'>('none');
  const [maxDistanceKm, setMaxDistanceKm] = useState(5);

  const [detailSitter, setDetailSitter] = useState<Sitter | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<{
    sitter: Sitter;
    date?: string;
    time?: string;
  } | null>(null);

  const runPostalLookup = useCallback(async (postal: string) => {
    const cleaned = postal.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      setLookupError('Please enter a valid 6-digit Singapore postal code.');
      return;
    }
    setLookupLoading(true);
    setLookupError(null);
    try {
      const loc = await oneMapService.geocodePostalCode(cleaned);
      setResolvedLocation({ ...loc, queriedPostal: cleaned });
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Unable to resolve postal code.');
    } finally {
      setLookupLoading(false);
    }
  }, []);

  useEffect(() => {
    if (/^\d{6}$/.test(postalInput)) {
      const timer = setTimeout(() => {
        runPostalLookup(postalInput);
      }, 250);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [postalInput, runPostalLookup]);

  useEffect(() => {
    if (state.rebookSitterId) {
      const target = state.sitters.find((s) => s.id === state.rebookSitterId);
      if (target) {
        setCheckoutTarget({ sitter: target, date: '2026-11-13', time: '18:30–22:30' });
        setRebookSitterId(null);
      }
    }
  }, [state.rebookSitterId, state.sitters, setRebookSitterId]);

  const isResolvedForCurrentPostal = Boolean(
    resolvedLocation &&
      (resolvedLocation.queriedPostal === postalInput || resolvedLocation.postalCode === postalInput)
  );

  const originForDistance = useMemo(() => {
    if (isResolvedForCurrentPostal && resolvedLocation) {
      return {
        postalCode: postalInput || resolvedLocation.postalCode,
        lat: resolvedLocation.lat,
        lng: resolvedLocation.lng,
      };
    }
    return postalInput;
  }, [isResolvedForCurrentPostal, resolvedLocation, postalInput]);

  const approvedSitters = useMemo(() => {
    return state.sitters
      .filter((s) => s.verificationStatus === 'approved')
      .map((s) => ({
        sitter: s,
        distanceKm: oneMapService.calculateDistanceKm(originForDistance, s.postalCode),
      }))
      .filter(({ sitter, distanceKm }) => {
        if (serviceType !== 'All' && !sitter.specialties.includes(serviceType)) return false;
        if (language !== 'All' && !sitter.languages.includes(language)) return false;
        if (sitter.hourlyRateSgd > maxRate) return false;
        if (sitter.rating < minRating) return false;
        if (availableTodayOnly && !sitter.availableToday) return false;
        if (specialFilter === 'newborn' && !sitter.newbornCertified) return false;
        if (specialFilter === 'special_needs' && !sitter.specialNeedsTrained) return false;
        if (maxDistanceKm < 999 && distanceKm > maxDistanceKm) return false;
        if (selectedDate && !sitter.availability.some((a) => a.date === selectedDate)) return false;
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [
    state.sitters,
    originForDistance,
    serviceType,
    language,
    maxRate,
    minRating,
    availableTodayOnly,
    specialFilter,
    maxDistanceKm,
    selectedDate,
  ]);

  const sarahSitter = state.sitters.find((s) => s.id === 'sitter-sarah');

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium text-teal-800">
              Singapore Beta · Punggol, Sengkang & Tampines · Demo mode
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              Trusted, Singpass-verified babysitters minutes from your estate.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every sitter is first-aid certified, personally interviewed, and covered by booking
              insurance — whether your helper is on rest day, grandparents are away, or you need a
              same-day slot.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSingpassModalOpen(true)}
              className="min-h-[48px] px-5 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              {activeParent.singpassVerified
                ? `Singpass Verified (${activeParent.maskedNric})`
                : 'Log in with Singpass'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              View Live Booking & SOS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-900 text-sm">Peace of mind</p>
            <p className="mt-0.5">Singpass ID, child CPR/AED, live check-ins & photo updates.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Book in minutes</p>
            <p className="mt-0.5">Same-day emergency slots with cashless PayNow QR or card.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Flexible care</p>
            <p className="mt-0.5">Date nights, school pickups, June/Dec holidays, newborn care.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Built for SG families</p>
            <p className="mt-0.5">English, Mandarin, Malay & Tamil sitters; Halal & allergy aware.</p>
          </div>
        </div>
      </section>

      {sarahSitter && (
        <section className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SitterAvatar sitter={sarahSitter} size="sm" />
            <div>
              <p className="text-sm font-bold text-slate-900">Book Sarah again for Friday?</p>
              <p className="text-xs text-slate-600">
                Your 5-star Punggol sitter has Fri 13 Nov · 6:30–10:30 PM open (S$24/hr).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setCheckoutTarget({ sitter: sarahSitter, date: '2026-11-13', time: '18:30–22:30' })
            }
            className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Quick Rebook Friday</span>
          </button>
        </section>
      )}

      <DiscoverFilters
        postalInput={postalInput}
        setPostalInput={setPostalInput}
        resolvedLocation={resolvedLocation}
        lookupLoading={lookupLoading}
        lookupError={lookupError}
        onGeocode={() => runPostalLookup(postalInput)}
        serviceType={serviceType}
        setServiceType={setServiceType}
        language={language}
        setLanguage={setLanguage}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        maxRate={maxRate}
        setMaxRate={setMaxRate}
        availableTodayOnly={availableTodayOnly}
        setAvailableTodayOnly={setAvailableTodayOnly}
        specialFilter={specialFilter}
        setSpecialFilter={setSpecialFilter}
        minRating={minRating}
        setMinRating={setMinRating}
        maxDistanceKm={maxDistanceKm}
        setMaxDistanceKm={setMaxDistanceKm}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            Verified Sitters ({approvedSitters.length})
          </h2>
          <p className="text-xs text-slate-500">
            {lookupLoading
              ? 'Refreshing sitters near your postal code...'
              : `${
                  maxDistanceKm < 999 ? `Within ${maxDistanceKm} km` : 'All beta estates'
                } · Sorted by distance from ${
                  isResolvedForCurrentPostal && resolvedLocation
                    ? resolvedLocation.estateLabel
                    : `S${postalInput || '822215'}`
                }`}
          </p>
        </div>

        {approvedSitters.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
            <p className="text-base font-semibold text-slate-900">
              No sitters found within {maxDistanceKm} km of{' '}
              {(isResolvedForCurrentPostal && resolvedLocation?.address) ||
                `Singapore ${postalInput}`}
              .
            </p>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              SitterSG’s closed beta currently operates in Punggol, Sengkang, and Tampines. Expand
              your radius or reset filters to browse all 18 verified sitters by distance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              {maxDistanceKm < 999 && (
                <button
                  type="button"
                  onClick={() => setMaxDistanceKm(999)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold"
                >
                  Show All Beta Estates
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setServiceType('All');
                  setLanguage('All');
                  setMaxRate(30);
                  setMinRating(4.5);
                  setAvailableTodayOnly(false);
                  setSpecialFilter('none');
                  setMaxDistanceKm(5);
                  setSelectedDate('');
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedSitters.map(({ sitter, distanceKm }) => (
              <SitterCard
                key={sitter.id}
                sitter={sitter}
                distanceKm={distanceKm}
                onViewProfile={setDetailSitter}
                onBook={(s) => setCheckoutTarget({ sitter: s })}
              />
            ))}
          </div>
        )}
      </section>

      <SitterDetailDrawer
        sitter={detailSitter}
        distanceKm={
          detailSitter
            ? oneMapService.calculateDistanceKm(originForDistance, detailSitter.postalCode)
            : undefined
        }
        reviews={state.reviews}
        onClose={() => setDetailSitter(null)}
        onBook={(sitter, date, time) => {
          setDetailSitter(null);
          setCheckoutTarget({ sitter, date, time });
        }}
      />

      <BookingCheckoutModal
        sitter={checkoutTarget?.sitter ?? null}
        initialDate={checkoutTarget?.date}
        initialTime={checkoutTarget?.time}
        onClose={() => setCheckoutTarget(null)}
        onConfirmed={(booking: Booking) => {
          setCheckoutTarget(null);
          if (booking) setActiveTab('bookings');
        }}
      />
    </div>
  );
};
