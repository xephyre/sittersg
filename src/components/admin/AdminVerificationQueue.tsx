import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { SitterAvatar } from '../common/SitterAvatar';

export const AdminVerificationQueue: React.FC = () => {
  const { state, adminReviewSitter } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sitter Verification Queue</h1>
        <p className="text-sm text-slate-600">
          Verify Singpass ID, MOM work-pass eligibility, child CPR/AED certificates, and interview
          notes before activating sitters.
        </p>
      </div>

      <div className="space-y-3">
        {state.sitters
          .slice()
          .sort((a, b) =>
            a.verificationStatus === 'pending_review'
              ? -1
              : b.verificationStatus === 'pending_review'
                ? 1
                : 0
          )
          .map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <SitterAvatar sitter={s} size="md" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{s.displayName}</h2>
                    <span
                      className={`text-xs font-semibold ${
                        s.verificationStatus === 'approved'
                          ? 'text-teal-800'
                          : s.verificationStatus === 'pending_review'
                            ? 'text-amber-700'
                            : 'text-red-700'
                      }`}
                    >
                      · {s.verificationStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {s.estate} · NRIC <span className="font-mono">{s.maskedNric}</span> · MOM:{' '}
                    {s.verificationDocs.workPassEligibility}
                  </p>
                  <p className="text-xs text-slate-500">
                    Singpass: {s.verificationDocs.singpassIdentity} · First-Aid:{' '}
                    {s.verificationDocs.firstAidCertStatus.replace('_', ' ')} (
                    {s.verificationDocs.firstAidProvider}) · Interview:{' '}
                    {s.verificationDocs.interviewStatus} · Waiver signed:{' '}
                    {s.verificationDocs.agreementSignedWithSingpass ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => adminReviewSitter(s.id, 'approved')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  onClick={() => adminReviewSitter(s.id, 'rejected')}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
