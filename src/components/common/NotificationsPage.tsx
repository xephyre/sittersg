import React, { useState } from 'react';
import { Bell, CheckCheck, MessageCircle, Smartphone } from 'lucide-react';
import { useApp } from '../../state/AppContext';

export const NotificationsPage: React.FC = () => {
  const { state, markAllNotificationsRead, setActiveTab, setRebookSitterId } = useApp();
  const [channelFilter, setChannelFilter] = useState<'all' | 'WhatsApp' | 'Push'>('all');

  const items = state.notifications.filter((n) => {
    if (channelFilter !== 'all' && n.channel !== channelFilter) return false;
    if (state.role === 'admin') return true;
    return n.recipientRole === state.role;
  });

  const handleAction = (category: string) => {
    if (category === 'rebook_nudge') {
      setRebookSitterId('sitter-sarah');
      setActiveTab('discover');
    } else if (category === 'holiday_reminder') {
      setActiveTab('discover');
    } else if (state.role === 'parent') {
      setActiveTab('bookings');
    } else if (state.role === 'sitter') {
      setActiveTab('sitter_jobs');
    } else {
      setActiveTab('admin_incidents');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notifications Centre (WhatsApp & Push Mock)
          </h1>
          <p className="text-sm text-slate-600">
            Demo mode · Previews messages sent via WhatsApp Business Cloud API & mobile push.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5 shrink-0"
        >
          <CheckCheck className="w-4 h-4 text-teal-700" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'WhatsApp', 'Push'] as const).map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => setChannelFilter(ch)}
            className={`min-h-[40px] px-4 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              channelFilter === ch
                ? 'bg-teal-700 border-teal-700 text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {ch === 'all' ? 'All Channels' : ch}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No notifications for this role and channel filter yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {items.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                n.read ? 'bg-white' : 'bg-teal-50/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-teal-800 shrink-0">
                  {n.channel === 'WhatsApp' ? (
                    <MessageCircle className="w-4 h-4" />
                  ) : n.category === 'sos_alert' ? (
                    <Bell className="w-4 h-4 text-red-600" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">
                    {n.channel} · {n.category.replace(/_/g, ' ')} · {n.timestamp}
                    {!n.read ? ' · Unread' : ''}
                  </p>
                  <h2 className="text-sm font-bold text-slate-900">{n.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{n.body}</p>
                </div>
              </div>

              {n.ctaLabel && (
                <button
                  type="button"
                  onClick={() => handleAction(n.category)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0"
                >
                  {n.ctaLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
