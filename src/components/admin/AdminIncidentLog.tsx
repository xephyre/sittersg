import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { Incident } from '../../types';

export const AdminIncidentLog: React.FC = () => {
  const { state, adminUpdateIncident } = useApp();
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trust & Safety Incident Log</h1>
        <p className="text-sm text-slate-600">
          Live SOS alerts, late-arrival reports, and parent billing disputes across beta estates.
        </p>
      </div>

      <div className="space-y-4">
        {state.incidents.map((inc) => {
          const notesVal = noteDrafts[inc.id] ?? inc.adminNotes;
          return (
            <article
              key={inc.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-mono text-slate-500">
                    {inc.id} · Booking {inc.bookingId} · {inc.createdAt}
                  </p>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    {inc.severity === 'critical' && (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>
                      {inc.type} · {inc.estate}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Reporter: {inc.reporterName} ({inc.reportedBy}) · Sitter: {inc.sitterName}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    inc.status === 'open'
                      ? 'text-red-700'
                      : inc.status === 'investigating'
                        ? 'text-amber-700'
                        : 'text-teal-800'
                  }`}
                >
                  {inc.status}
                </span>
              </div>

              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                {inc.summary}
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Ops & Trust-and-Safety Resolution Notes
                </label>
                <textarea
                  rows={2}
                  value={notesVal}
                  onChange={(e) =>
                    setNoteDrafts((prev) => ({ ...prev, [inc.id]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {(['open', 'investigating', 'resolved'] as Incident['status'][]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => adminUpdateIncident(inc.id, st, notesVal)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-colors ${
                        inc.status === st
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Mark {st}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
