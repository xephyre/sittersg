import React from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { Header } from './components/common/Header';
import { SosModal } from './components/common/SosModal';
import { NotificationsPage } from './components/common/NotificationsPage';
import { SingpassOnboardingModal } from './components/parent/SingpassOnboardingModal';
import { ParentDiscoverPage } from './components/parent/ParentDiscoverPage';
import { ParentBookingsPage } from './components/parent/ParentBookingsPage';
import { FamilyProfilePage } from './components/parent/FamilyProfilePage';
import { MembershipReferralPage } from './components/parent/MembershipReferralPage';
import { SitterAppPage } from './components/sitter/SitterAppPage';
import { AdminConsolePage } from './components/admin/AdminConsolePage';

const MainShell: React.FC = () => {
  const { state, resetDemoData } = useApp();

  const renderPage = () => {
    if (state.activeTab === 'notifications') {
      return <NotificationsPage />;
    }

    if (state.role === 'parent') {
      switch (state.activeTab) {
        case 'bookings':
          return <ParentBookingsPage />;
        case 'family':
          return <FamilyProfilePage />;
        case 'membership':
          return <MembershipReferralPage />;
        default:
          return <ParentDiscoverPage />;
      }
    }

    if (state.role === 'sitter') {
      return <SitterAppPage />;
    }

    return <AdminConsolePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12">
        {renderPage()}
      </main>

      <footer className="border-t border-slate-200 bg-white mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            SitterSG · Closed Beta in Punggol, Sengkang & Tampines · 7-day WhatsApp support & 24/7
            incident line · Demo mode
          </p>
          <button
            type="button"
            onClick={resetDemoData}
            className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 self-start sm:self-auto"
          >
            Reset Demo Data
          </button>
        </div>
      </footer>

      <SingpassOnboardingModal />
      <SosModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
