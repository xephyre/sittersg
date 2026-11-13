import React, { useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { singpassAuthService } from '../../services/mockServices';

export const SingpassOnboardingModal: React.FC = () => {
  const { state, setSingpassModalOpen, completeParentSingpassLogin } = useApp();
  const [step, setStep] = useState<'login' | 'consent' | 'done'>('login');
  const [consentChecked, setConsentChecked] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!state.singpassModalOpen) return null;

  const handleSingpassStart = async () => {
    setLoading(true);
    await singpassAuthService.initiateLogin('parent');
    setLoading(false);
    setStep('consent');
  };

  const handleConfirmConsent = async () => {
    if (!consentChecked) return;
    setLoading(true);
    await completeParentSingpassLogin(true);
    setLoading(false);
    setStep('login');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="singpass-title"
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Demo mode · Mock Singpass & MyInfo v4</p>
            <h2 id="singpass-title" className="text-xl font-bold text-slate-900 mt-0.5">
              {step === 'login' ? 'Log in with Singpass' : 'PDPA Consent & MyInfo Auto-Fill'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSingpassModalOpen(false)}
            aria-label="Close Singpass login"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'login' ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col items-center text-center space-y-3">
              <div className="w-36 h-36 rounded-xl bg-white border border-slate-200 p-3 grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xs ${
                      [0, 1, 2, 4, 5, 7, 10, 12, 14, 16, 18, 20, 22, 24].includes(idx)
                        ? 'bg-red-700'
                        : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Scan with your Singpass app (Demo Simulation)
              </p>
              <p className="text-xs text-slate-600 max-w-sm">
                Verifies parent identity and pre-fills your name, masked NRIC, date of birth, and
                residential address from MyInfo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSingpassStart}
              disabled={loading}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-sm transition-colors"
            >
              {loading ? 'Connecting to Singpass...' : 'Approve Singpass Demo Login'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Purpose Statement (Singapore PDPA)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                SitterSG collects your verified name, masked NRIC (for identity assurance), mobile
                number, date of birth, and residential address solely to verify parent accounts,
                enable insured bookings, and provide emergency location support.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your full unit address is never shown to sitters before a confirmed booking, and
                your NRIC is stored in masked form (<span className="font-mono">S****482J</span>).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <p className="font-semibold text-slate-800">MyInfo Fields to Auto-Fill</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400">Name:</span> Rachel Lim Hui Wen
                </div>
                <div>
                  <span className="text-slate-400">NRIC (Masked):</span>{' '}
                  <span className="font-mono">S****482J</span>
                </div>
                <div>
                  <span className="text-slate-400">DOB:</span>{' '}
                  <span className="font-mono">1991-04-18</span>
                </div>
                <div>
                  <span className="text-slate-400">Postal:</span>{' '}
                  <span className="font-mono">822215 (Punggol)</span>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 w-4 h-4 accent-teal-700"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                I consent to SitterSG retrieving the above MyInfo attributes in accordance with the
                Personal Data Protection Act (PDPA) and SitterSG Privacy Notice.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleConfirmConsent}
                disabled={!consentChecked || loading}
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Syncing MyInfo...' : 'I Agree & Auto-Fill Profile'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSingpassModalOpen(false)}
                className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Demo mode: Simulated Singpass OIDC + MyInfo payload; no real NRIC transmitted.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
