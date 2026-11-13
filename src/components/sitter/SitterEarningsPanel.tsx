import React from 'react';
import { DollarSign } from 'lucide-react';
import { Booking, Sitter } from '../../types';

interface Props {
  activeSitter: Sitter;
  sitterBookings: Booking[];
}

export const SitterEarningsPanel: React.FC<Props> = ({ activeSitter, sitterBookings }) => {
  const completedBookings = sitterBookings.filter((b) => b.status === 'checked_out');
  const totalNetEarnings = completedBookings.reduce((sum, b) => sum + b.sitterPayoutSgd, 0);
  const pendingPayout = sitterBookings
    .filter((b) => ['confirmed', 'on_the_way', 'checked_in'].includes(b.status))
    .reduce((sum, b) => sum + b.sitterPayoutSgd, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sitter Earnings Summary</h1>
        <p className="text-sm text-slate-600">
          Transparent 80% sitter payout after 20% SitterSG platform & insurance fee. Settled via
          PayNow.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Completed Payouts</p>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            S${totalNetEarnings.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Upcoming / Active Escrow</p>
          <p className="text-2xl font-bold font-mono text-teal-800 tabular-nums mt-1">
            S${pendingPayout.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Repeat Families</p>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {activeSitter.repeatFamilyCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-bold text-slate-900">Payout Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Booking</th>
                <th className="py-3 px-4 font-semibold">Date & Estate</th>
                <th className="py-3 px-4 font-semibold text-right">Hours</th>
                <th className="py-3 px-4 font-semibold text-right">Gross</th>
                <th className="py-3 px-4 font-semibold text-right">Net Payout (80%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sitterBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-900">{b.id}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {b.date} · {b.parentEstate} ({b.serviceType})
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{b.hours}h</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    S${b.subtotalSgd.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-teal-800 tabular-nums">
                    S${b.sitterPayoutSgd.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
