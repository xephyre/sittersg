import React from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { EstateArea } from '../../types';
import { AdminVerificationQueue } from './AdminVerificationQueue';
import { AdminIncidentLog } from './AdminIncidentLog';

export const AdminConsolePage: React.FC = () => {
  const { state, setActiveTab } = useApp();

  if (state.activeTab === 'admin_verifications') {
    return <AdminVerificationQueue />;
  }

  if (state.activeTab === 'admin_incidents') {
    return <AdminIncidentLog />;
  }

  const totalBookings = state.bookings.length;
  const gbv = state.bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalSgd, 0);

  const parentBookingCounts = state.bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.parentId] = (acc[b.parentId] ?? 0) + 1;
    return acc;
  }, {});
  const repeatParents = Object.values(parentBookingCounts).filter((c) => c >= 2).length;
  const repeatRate =
    Object.keys(parentBookingCounts).length > 0
      ? Math.round((repeatParents / Object.keys(parentBookingCounts).length) * 100)
      : 0;

  const ratedBookings = state.bookings.filter((b) => b.ratingSubmitted);
  const avgRating =
    ratedBookings.length > 0
      ? ratedBookings.reduce((sum, b) => sum + (b.ratingSubmitted ?? 0), 0) / ratedBookings.length
      : 4.92;

  const confirmed24hPct =
    totalBookings > 0
      ? Math.round((state.bookings.filter((b) => b.confirmedWithin24h).length / totalBookings) * 100)
      : 100;

  const estates: EstateArea[] = ['Punggol', 'Sengkang', 'Tampines'];
  const openIncidents = state.incidents.filter((i) => i.status !== 'resolved').length;
  const pendingSitters = state.sitters.filter((s) => s.verificationStatus === 'pending_review');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Operations & Trust-and-Safety Console
          </h1>
          <p className="text-sm text-slate-600">
            Closed beta rollout monitor · Expand beyond Punggol, Sengkang & Tampines once 24h
            confirmation stays ≥ 90%.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('admin_verifications')}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 whitespace-nowrap"
          >
            Verification Queue ({pendingSitters.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin_incidents')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap"
          >
            Incidents ({openIncidents} open)
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {totalBookings}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Gross Booking Value</p>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            S${gbv.toFixed(0)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Repeat-Booking Rate</p>
          <p className="text-2xl font-bold font-mono text-teal-800 tabular-nums mt-1">
            {repeatRate}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Average Rating</p>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {avgRating.toFixed(2)}★
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 col-span-2 lg:col-span-1">
          <p className="text-xs text-slate-500">Confirmed Within 24h</p>
          <p className="text-2xl font-bold font-mono text-teal-800 tabular-nums mt-1">
            {confirmed24hPct}%
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-700" />
          <h2 className="text-base font-bold text-slate-900">
            Active Verified Sitters per Launch Estate
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {estates.map((area) => {
            const areaSitters = state.sitters.filter(
              (s) => s.estate === area && s.verificationStatus === 'approved'
            );
            const areaBookings = state.bookings.filter((b) => b.parentEstate === area);
            const area24h =
              areaBookings.length > 0
                ? Math.round(
                    (areaBookings.filter((b) => b.confirmedWithin24h).length /
                      areaBookings.length) *
                      100
                  )
                : 100;

            return (
              <div key={area} className="rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{area}</h3>
                  <span className="text-xs font-mono text-teal-800 font-semibold tabular-nums">
                    {area24h}% &lt;24h confirm
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {areaSitters.length} sitters
                </p>
                <p className="text-xs text-slate-500">
                  {areaBookings.length} bookings recorded ·{' '}
                  {areaSitters.filter((s) => s.availableToday).length} available today
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pending Reviews & Active Safety Queue
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {pendingSitters.length} sitter applications awaiting approval · {openIncidents}{' '}
              open/investigating incidents.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('admin_verifications')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold"
          >
            Review Sitters
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin_incidents')}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50"
          >
            Open Incident Log
          </button>
        </div>
      </section>
    </div>
  );
};
