import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

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
    <div className="app-shell flex min-h-screen bg-cream overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content flex-1 min-w-0 !ml-0 lg:!ml-0 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-wrapper flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
