import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const getHeaderInfo = (pathname, userName) => {
  switch (pathname) {
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

  const { title, subtitle } = getHeaderInfo(location.pathname, user?.name);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        {/* Top Announcement Bar */}
        <div className="bg-bg-secondary border-b border-line px-4 py-2 text-xs text-ink-soft flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand/10 text-brand border border-brand/20">
              Emerald Theme Active
            </span>
            <span>SpendWise v1.0 • Connected to Live Database</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-ink-muted">
            <span>Currency: <strong className="text-ink">LKR (Rs.)</strong></span>
            <span>•</span>
            <span>October 2026</span>
          </div>
        </div>

        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={title} 
          subtitle={subtitle} 
        />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
