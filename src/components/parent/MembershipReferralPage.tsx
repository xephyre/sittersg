import React, { useState } from 'react';
import { ArrowRight, Calendar, CheckCircle2, Copy, Crown, Gift, Share2 } from 'lucide-react';
import { useApp } from '../../state/AppContext';

export const MembershipReferralPage: React.FC = () => {
  const { activeParent, upgradeToPlus, redeemReferralDemo, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);

  const isPlus = activeParent.membership.plan === 'plus';

  const handleCopy = () => {
    navigator.clipboard?.writeText(activeParent.referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">SitterSG Plus & Family Referrals</h1>
        <p className="text-sm text-slate-600">
          Lower fees for regular families, priority same-day emergency dispatch, and two-sided
          S$15 referral credits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-teal-800">Monthly Parent Membership</p>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>SitterSG Plus</span>
                </h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">S$29</p>
                <p className="text-xs text-slate-500">per month · cancel anytime</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl text-sm">
              <div className="p-3.5 flex items-center justify-between gap-3">
                <span className="text-slate-700 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Platform & insurance fee per booking</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                  10% (vs 20% Standard)
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between gap-3">
                <span className="text-slate-700 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Same-day emergency slot dispatch</span>
                </span>
                <span className="font-semibold text-teal-800 shrink-0">Priority queue</span>
              </div>
              <div className="p-3.5 flex items-center justify-between gap-3">
                <span className="text-slate-700 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>June & Nov–Dec holiday care windows</span>
                </span>
                <span className="font-semibold text-slate-900 shrink-0">14-day early access</span>
              </div>
              <div className="p-3.5 flex items-center justify-between gap-3">
                <span className="text-slate-700 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Corporate HR childcare benefit receipts</span>
                </span>
                <span className="font-semibold text-slate-900 shrink-0">Included monthly</span>
              </div>
            </div>
          </div>

          {isPlus ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 flex items-center justify-between gap-3 text-sm text-teal-900">
              <span className="font-semibold inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                Active SitterSG Plus Member (renews 12 Dec 2026)
              </span>
              <span className="font-mono text-xs">10% fee active</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={upgradeToPlus}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to SitterSG Plus (Demo · S$29/mo)</span>
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-teal-800">Two-Sided Referral Program</p>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-teal-700" />
                  <span>Give S$15, Get S$15</span>
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Available Credit</p>
                <p className="text-2xl font-bold font-mono text-teal-800 tabular-nums">
                  S${activeParent.referralCreditsSgd}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Share your code with parents in your Punggol, Sengkang, or Tampines condo chat or
              preschool parent group. They save S$15 on their first sitting, and you get S$15 credit
              once they check out.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Your Family Referral Code</p>
                <p className="text-lg font-mono font-bold text-slate-900 tracking-wide">
                  {activeParent.referralCode}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={redeemReferralDemo}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 text-teal-700" />
            <span>Simulate Neighbour First Booking (+S$15 Credit)</span>
          </button>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              School Holiday Pre-Booking (June & Nov–Dec Peak)
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Reserve recurring daytime blocks while childcare centres close or helpers travel home.
              7-day WhatsApp human support + 24/7 incident line included.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
        >
          <span>Pre-Book Holiday Slot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
};
