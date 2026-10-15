import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../utils/helpers';

const getHeaderInfo = (pathname, userName) => {
  switch (pathname) {
    case '/dashboard':
    case '/':
      return {
        title: 'Dashboard Overview',
        subtitle: `Welcome back, ${userName || 'User'}! Here is your financial snapshot.`,
      };
    case '/transactions':
      return {
        title: 'Transactions',
        subtitle: 'Track, filter, and organize all your income & expenses.',
      };
    case '/budgets':
      return {
        title: 'Monthly Budgets',
        subtitle: 'Keep your monthly spending goals in check.',
      };
    case '/analytics':
      return {
        title: 'Financial Analytics',
        subtitle: 'Visual breakdowns of your spending trends and cash flow.',
      };
    case '/profile':
      return {
        title: 'User Profile',
        subtitle: 'View your account credentials and registration details.',
      };
    case '/notifications':
      return {
        title: 'Notifications',
        subtitle: 'Budget alerts and reminders',
      };
    default:
      return {
        title: 'SpendWise',
        subtitle: 'Personal Expense & Budget Tracker',
      };
  }
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { currency } = useCurrency();

  const { title, subtitle } = getHeaderInfo(location.pathname, user?.name);

  // Scroll reset & screen reader focus transfer on route change (strictly keyed on pathname)
  useEffect(() => {
    const scroller = document.getElementById('app-scroll');
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior: 'instant' });
      const heading = scroller.querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      } else {
        scroller.focus({ preventScroll: true });
      }
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen h-dvh w-full overflow-hidden bg-cream selection:bg-brand selection:text-white">
      {/* Skip to Content Link (Visually hidden until focused) */}
      <a
        href="#app-scroll"
        onClick={(e) => {
          e.preventDefault();
          const scroller = document.getElementById('app-scroll');
          if (scroller) {
            scroller.focus();
            scroller.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:text-xs focus:font-semibold focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
      >
        Skip to main content
      </a>

      {/* Sidebar: Pinned flex child on desktop, slide-over drawer on mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right Column: Pinned Topbars + Scrollable Content Scroller */}
      <div className="flex min-w-0 min-h-0 flex-1 flex-col h-full overflow-hidden">
        {/* Top Announcement Bar (shrink-0) */}
        <div className="shrink-0 bg-bg-secondary border-b border-line px-4 py-2 text-xs text-ink-soft flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink-soft">SpendWise v1.0</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-ink-muted">
            <span>
              Currency: <strong className="text-ink">{currency === 'USD' ? 'USD ($)' : 'LKR (Rs.)'}</strong>
            </span>
            <span>•</span>
            <span>October 2026</span>
          </div>
        </div>

        {/* Pinned Top Navbar (shrink-0) */}
        <div className="shrink-0 z-20">
          <Navbar 
            onMenuClick={() => setSidebarOpen(true)} 
            title={title} 
            subtitle={subtitle} 
          />
        </div>

        {/* Dedicated App Content Scroller */}
        <main
          id="app-scroll"
          tabIndex={0}
          aria-label="Page content"
          className="app-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain motion-safe:scroll-smooth focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 outline-none"
        >
          <div className="page-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

