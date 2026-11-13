import React from 'react';
import { Bell, CalendarCheck, Crown, Search, ShieldCheck, Users } from 'lucide-react';
import { ActiveTab, useApp } from '../../state/AppContext';
import { RoleMode } from '../../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PARENT_NAV: NavItem[] = [
  { id: 'discover', label: 'Find Sitters', mobileLabel: 'Sitters', icon: Search },
  { id: 'bookings', label: 'My Bookings', mobileLabel: 'Bookings', icon: CalendarCheck },
  { id: 'family', label: 'Family Profile', mobileLabel: 'Family', icon: Users },
  { id: 'membership', label: 'Plus & Refer', mobileLabel: 'Plus', icon: Crown },
  { id: 'notifications', label: 'Alerts', mobileLabel: 'Alerts', icon: Bell },
];

const SITTER_NAV: NavItem[] = [
  { id: 'sitter_jobs', label: 'Jobs & Calendar', mobileLabel: 'Jobs', icon: CalendarCheck },
  { id: 'sitter_onboarding', label: 'Onboarding', mobileLabel: 'Verify', icon: ShieldCheck },
  { id: 'sitter_earnings', label: 'Earnings', mobileLabel: 'Earnings', icon: Crown },
  { id: 'notifications', label: 'Alerts', mobileLabel: 'Alerts', icon: Bell },
];

const ADMIN_NAV: NavItem[] = [
  { id: 'admin_overview', label: 'KPIs & Areas', mobileLabel: 'KPIs', icon: Search },
  { id: 'admin_verifications', label: 'Verification Queue', mobileLabel: 'Verify', icon: ShieldCheck },
  { id: 'admin_incidents', label: 'Trust & Safety', mobileLabel: 'Incidents', icon: Users },
  { id: 'notifications', label: 'Alert Feed', mobileLabel: 'Alerts', icon: Bell },
];

export const Header: React.FC = () => {
  const { state, setRole, setActiveTab, unreadNotificationsCount } = useApp();

  const navItems =
    state.role === 'parent' ? PARENT_NAV : state.role === 'sitter' ? SITTER_NAV : ADMIN_NAV;

  const roles: { id: RoleMode; label: string }[] = [
    { id: 'parent', label: 'Parent' },
    { id: 'sitter', label: 'Sitter' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab(navItems[0].id)}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-md"
          >
            SitterSG
          </button>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {navItems.map((item) => {
              const isActive = state.activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-2 whitespace-nowrap shrink-0 transition-colors min-h-[44px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded ${
                    isActive
                      ? 'text-teal-800 font-semibold underline decoration-teal-700 decoration-2 underline-offset-8'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                    <span className="font-mono text-xs text-teal-800 tabular-nums">
                      ({unreadNotificationsCount})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div
            role="group"
            aria-label="Role switcher"
            className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl shrink-0"
          >
            {roles.map((r) => {
              const active = state.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] sm:min-h-[34px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
      >
        <div
          className={`grid ${
            navItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4'
          } items-center h-16 px-1`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-lg transition-colors ${
                  isActive ? 'text-teal-800 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                    <span className="sr-only">{unreadNotificationsCount} unread</span>
                  )}
                </div>
                <span className="text-[11px] leading-tight mt-0.5 whitespace-nowrap">
                  {item.mobileLabel}
                  {item.id === 'notifications' && unreadNotificationsCount > 0
                    ? ` (${unreadNotificationsCount})`
                    : ''}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
