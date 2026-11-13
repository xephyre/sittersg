import React, { useState } from 'react';
import { CheckCircle2, FileCheck2, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { Sitter } from '../../types';

export const SitterOnboardingPanel: React.FC<{ sitter: Sitter }> = ({ sitter }) => {
  const { completeSitterOnboardingStep } = useApp();
  const [workPass, setWorkPass] = useState<Sitter['verificationDocs']['workPassEligibility']>(
    sitter.verificationDocs.workPassEligibility
  );
  const [signing, setSigning] = useState(false);
  const [certFileLabel, setCertFileLabel] = useState(
    sitter.verificationDocs.firstAidProvider ?? 'No certificate uploaded'
  );

  const docs = sitter.verificationDocs;
  const isRestrictedPass = workPass === 'Work Pass Restricted';

  const handleSignAgreement = async () => {
    setSigning(true);
    await completeSitterOnboardingStep(sitter.id, 'signAgreement', workPass);
    setSigning(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Sitter Verification & MOM Eligibility Checklist
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Demo mode · All external Singpass & certificate checks are simulated locally.
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-800">
            Status: {sitter.verificationStatus.replace('_', ' ')}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">
                Singapore Work-Pass Eligibility Check (MOM Compliance)
              </p>
              <p>
                Under Ministry of Manpower rules, foreign domestic workers (MDWs) and most Student /
                Work Permit holders cannot legally provide independent babysitting on the platform.
              </p>
            </div>
          </div>

          <select
            aria-label="Work pass eligibility status"
            value={workPass}
            onChange={(e) =>
              setWorkPass(
                e.target.value as Sitter['verificationDocs']['workPassEligibility']
              )
            }
            className="w-full sm:w-80 min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm bg-white"
          >
            <option value="Citizen / PR">Singapore Citizen / Permanent Resident</option>
            <option value="LTVP+ (LOC)">LTVP / LTVP+ with valid MOM Letter of Consent</option>
            <option value="Work Pass Restricted">
              MDW / Student Pass / Restricted Work Pass (Ineligible)
            </option>
          </select>

          {isRestrictedPass && (
            <p className="text-xs font-semibold text-red-700">
              Ineligible under MOM guidelines: restricted pass holders cannot be activated for paid
              sitting bookings.
            </p>
          )}
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                1. Singpass Identity & NRIC Verification
              </p>
              <p className="text-xs text-slate-600">
                Masked NRIC stored: <span className="font-mono">{sitter.maskedNric}</span> ·
                Residential address never exposed to parents.
              </p>
            </div>
            {docs.singpassIdentity === 'verified' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => completeSitterOnboardingStep(sitter.id, 'singpass', workPass)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-semibold"
              >
                Verify with Singpass (Demo)
              </button>
            )}
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                2. Child First-Aid / CPR & AED Certificate
              </p>
              <p className="text-xs text-slate-600">
                {certFileLabel}
                {docs.firstAidExpiry ? ` · Valid until ${docs.firstAidExpiry}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCertFileLabel('Singapore Red Cross (Child First Aid & CPR) · Demo PDF');
                completeSitterOnboardingStep(sitter.id, 'firstAid', workPass);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>
                {docs.firstAidCertStatus === 'verified'
                  ? 'Re-upload Certificate'
                  : 'Upload First-Aid PDF'}
              </span>
            </button>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                3. In-Person / Video Caregiver Interview
              </p>
              <p className="text-xs text-slate-600">
                Scenario screening for infant safety, allergy handling, and emergency response.
              </p>
            </div>
            {docs.interviewStatus === 'completed' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800">
                <CheckCircle2 className="w-4 h-4" />
                Interview Completed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => completeSitterOnboardingStep(sitter.id, 'interview', workPass)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 shrink-0"
              >
                Book / Complete Demo Interview
              </button>
            )}
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                4. Service Agreement & Liability Waiver (Singpass Sign)
              </p>
              <p className="text-xs text-slate-600">
                Covers platform code of conduct, PDPA child confidentiality, and booking insurance
                terms.
              </p>
            </div>
            {docs.agreementSignedWithSingpass ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800">
                <FileCheck2 className="w-4 h-4" />
                Signed with Singpass
              </span>
            ) : (
              <button
                type="button"
                disabled={isRestrictedPass || signing}
                onClick={handleSignAgreement}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{signing ? 'Signing...' : 'Sign with Singpass (Demo)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
