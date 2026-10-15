import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  PieChart,
  User,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Sun,
  Moon,
  LogOut,
  X,
  Bell,
} from 'lucide-react';
import SpendWiseLogo from './landing/SpendWiseLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatLKR } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Initial avatar letter extractor
const getAvatarInitial = (name, email) => {
  if (name && typeof name === 'string' && name.trim()) {
    return name.trim().charAt(0).toUpperCase();
  }
  if (email && typeof email === 'string' && email.trim()) {
    return email.trim().charAt(0).toUpperCase();
  }
  return 'U';
};

// Budget thresholds helper
const getBudgetStatus = (spent, budget) => {
  if (!budget || budget <= 0) return null;
  const ratio = spent / budget;
  const percent = Math.round(ratio * 100);

  if (ratio >= 0.9 || spent > budget) {
    return {
      statusText: 'Over budget',
      barColor: 'bg-expense',
      textColor: 'text-expense',
      ringColor: 'text-expense',
      percent,
    };
  }
  if (ratio >= 0.7) {
    return {
      statusText: 'Getting close',
      barColor: 'bg-warn',
      textColor: 'text-warn',
      ringColor: 'text-warn',
      percent,
    };
  }
  return {
    statusText: 'On track',
    barColor: 'bg-income',
    textColor: 'text-income',
    ringColor: 'text-income',
    percent,
  };
};

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarRef = useRef(null);
  const userButtonRef = useRef(null);
  const menuRef = useRef(null);

  // ─── 1. Collapsible Mode State (Desktop) ──────────────────────────────────
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('spendwise-sidebar') === 'collapsed';
    } catch {
      return false;
    }
  });

  // Track viewport width for drawer vs. desktop
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Inside the mobile drawer, always render expanded layout
  const isEffectivelyCollapsed = !isMobile && isCollapsed;

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('spendwise-sidebar', next ? 'collapsed' : 'expanded');
      } catch {}
      return next;
    });
  }, []);

  // Keyboard shortcut: "[" toggles collapse (ignored in text inputs)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '[' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) &&
        !e.target?.isContentEditable
      ) {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapse]);

  // Keep CSS variable in sync with collapsed state
  useEffect(() => {
    try {
      document.documentElement.style.setProperty(
        '--sidebar-w',
        isEffectivelyCollapsed ? '72px' : '264px'
      );
    } catch {}
  }, [isEffectivelyCollapsed]);

  // ─── 2. Mobile Drawer Accessibility (Scroll Lock & Focus Trap) ─────────────
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && sidebarRef.current) {
        const focusable = sidebarRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isMobile, onClose]);

  // Close mobile drawer on route change
  useEffect(() => {
    if (isOpen && isMobile) {
      onClose();
    }
  }, [location.pathname]);

  // ─── 3. User Menu Popover State ───────────────────────────────────────────
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Keyboard navigation for user menu (Escape and Arrow keys)
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setUserMenuOpen(false);
        userButtonRef.current?.focus();
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!menuRef.current) return;
        const items = Array.from(
          menuRef.current.querySelectorAll('[role="menuitem"], button:not([disabled])')
        );
        if (!items.length) return;
        const currentIndex = items.indexOf(document.activeElement);
        let nextIndex = 0;
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex + 1 < items.length ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : items.length - 1;
        }
        items[nextIndex]?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // ─── 4. Quick Action: Add Transaction ─────────────────────────────────────
  const handleAddTransaction = () => {
    if (isOpen && isMobile) onClose();
    navigate('/transactions?new=1');
  };

  // ─── 5. Budget Status Data ─────────────────────────────────────────────────
  const [budgetData, setBudgetData] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetError, setBudgetError] = useState(false);

  const fetchBudgetSummary = useCallback(async () => {
    try {
      const now = new Date();
      const res = await api.get('/dashboard/summary', {
        params: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      });
      if (res.data?.success && res.data?.summary) {
        setBudgetData({
          budgetAmount: Number(res.data.summary.budgetAmount) || 0,
          monthlyExpenses: Number(
            res.data.summary.budgetSpent !== undefined
              ? res.data.summary.budgetSpent
              : res.data.summary.monthlyExpenses
          ) || 0,
          periodLabel: res.data.summary.budgetPeriodLabel || null,
          periodType: res.data.summary.budgetPeriodType || null,
        });
        setBudgetError(false);
      }
    } catch {
      setBudgetError(true);
    } finally {
      setBudgetLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgetSummary();
  }, [fetchBudgetSummary, location.pathname]);

  const budgetStatus = budgetData
    ? getBudgetStatus(budgetData.monthlyExpenses, budgetData.budgetAmount)
    : null;

  // ─── 6. Navigation Items Structure ────────────────────────────────────────
  const mainNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, end: false },
    { to: '/budgets', label: 'Budgets', icon: Target, end: false },
    { to: '/analytics', label: 'Analytics', icon: PieChart, end: false },
  ];

  const accountNavItems = [
    { to: '/profile', label: 'Profile', icon: User, end: false },
  ];

  const userInitial = getAvatarInitial(user?.name, user?.email);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/60 z-40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        ref={sidebarRef}
        aria-label="Primary"
        aria-modal={isMobile && isOpen ? 'true' : undefined}
        role={isMobile ? 'dialog' : undefined}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-cream-band border-r border-line select-none
          w-[min(85vw,300px)] lg:w-auto lg:sticky lg:top-0 lg:h-screen lg:z-30 lg:translate-x-0
          transition-[width,transform] duration-250 ease-out motion-reduce:transition-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isEffectivelyCollapsed ? 'lg:w-[72px]' : 'lg:w-[264px]'}
          px-3 py-4
        `}
      >
        {/* ─── Header: Logo & Collapse Button ─────────────────────────────── */}
        {!isEffectivelyCollapsed ? (
          <div className="h-14 flex items-center justify-between px-2 shrink-0 mb-4 border-b border-line">
            <SpendWiseLogo size="md" showTagline={true} asLink to="/dashboard" />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label="Collapse sidebar"
                aria-expanded="true"
                className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-ink-soft hover:bg-cream-hover hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sidebar"
                className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:bg-cream-hover hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center shrink-0 mb-4 pb-2 border-b border-line">
            <div className="h-14 flex items-center justify-center">
              <SpendWiseLogo size="md" iconOnly asLink to="/dashboard" />
            </div>
            <button
              type="button"
              onClick={toggleCollapse}
              aria-label="Expand sidebar"
              aria-expanded="false"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:bg-cream-hover hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 mt-1"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── Quick Action: Add Transaction ──────────────────────────────── */}
        {!isEffectivelyCollapsed ? (
          <button
            type="button"
            onClick={handleAddTransaction}
            className="w-full bg-brand hover:bg-brand-dark text-white font-semibold text-sm rounded-xl py-2.5 px-3 shadow-sm shadow-brand/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 flex items-center justify-center gap-2 mb-6 shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add transaction</span>
          </button>
        ) : (
          <div className="relative group/quick flex justify-center mb-6 shrink-0">
            <button
              type="button"
              onClick={handleAddTransaction}
              aria-label="Add transaction"
              aria-describedby="tooltip-add-tx"
              className="w-11 h-11 rounded-xl bg-brand hover:bg-brand-dark text-white shadow-sm shadow-brand/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 shrink-0" />
            </button>
            <div
              id="tooltip-add-tx"
              role="tooltip"
              className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-ink text-cream text-xs font-medium px-2 py-1 rounded-md shadow-lg opacity-0 pointer-events-none group-hover/quick:opacity-100 group-focus-within/quick:opacity-100 transition-opacity duration-150 delay-150"
            >
              Add transaction
            </div>
          </div>
        )}

        {/* ─── Navigation Scroll Container ─────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto [scrollbar-width:thin] space-y-6 pr-0.5"
        >
          {/* Group 1: Main */}
          <div>
            {!isEffectivelyCollapsed ? (
              <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-ink-soft px-3 mb-2">
                Main
              </div>
            ) : (
              <div className="w-8 mx-auto border-b border-line mb-2" />
            )}
            <ul className="space-y-1" role="list">
              {mainNavItems.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={isOpen && isMobile ? onClose : undefined}
                    aria-label={isEffectivelyCollapsed ? label : undefined}
                    aria-describedby={
                      isEffectivelyCollapsed ? `tooltip-${to.replace('/', '')}` : undefined
                    }
                    className={({ isActive }) => `
                      group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ring-offset-0
                      ${
                        isEffectivelyCollapsed
                          ? 'w-11 h-11 mx-auto justify-center p-0'
                          : 'w-full gap-3 px-3 py-2.5'
                      }
                      ${
                        isActive
                          ? 'bg-brand-soft text-brand dark:text-brand-light font-semibold shadow-xs'
                          : 'text-ink-body hover:bg-cream-hover hover:text-ink'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {/* 3px x 20px rounded indicator bar on left edge */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] rounded-r-full bg-brand animate-scale-y"
                            aria-hidden="true"
                          />
                        )}

                        <Icon
                          className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                            isActive
                              ? 'text-brand dark:text-brand-light'
                              : 'text-ink-soft group-hover:text-ink'
                          }`}
                          aria-hidden="true"
                        />

                        {!isEffectivelyCollapsed && (
                          <span className="truncate">{label}</span>
                        )}

                        {/* Collapsed Tooltip */}
                        {isEffectivelyCollapsed && (
                          <div
                            id={`tooltip-${to.replace('/', '')}`}
                            role="tooltip"
                            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-ink text-cream text-xs font-medium px-2 py-1 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 delay-150"
                          >
                            {label}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 2: Account */}
          <div>
            {!isEffectivelyCollapsed ? (
              <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-ink-soft px-3 mb-2">
                Account
              </div>
            ) : (
              <div className="w-8 mx-auto border-b border-line mb-2" />
            )}
            <ul className="space-y-1" role="list">
              {accountNavItems.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={isOpen && isMobile ? onClose : undefined}
                    aria-label={isEffectivelyCollapsed ? label : undefined}
                    aria-describedby={
                      isEffectivelyCollapsed ? `tooltip-${to.replace('/', '')}` : undefined
                    }
                    className={({ isActive }) => `
                      group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ring-offset-0
                      ${
                        isEffectivelyCollapsed
                          ? 'w-11 h-11 mx-auto justify-center p-0'
                          : 'w-full gap-3 px-3 py-2.5'
                      }
                      ${
                        isActive
                          ? 'bg-brand-soft text-brand dark:text-brand-light font-semibold shadow-xs'
                          : 'text-ink-body hover:bg-cream-hover hover:text-ink'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] rounded-r-full bg-brand animate-scale-y"
                            aria-hidden="true"
                          />
                        )}

                        <Icon
                          className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                            isActive
                              ? 'text-brand dark:text-brand-light'
                              : 'text-ink-soft group-hover:text-ink'
                          }`}
                          aria-hidden="true"
                        />

                        {!isEffectivelyCollapsed && (
                          <span className="truncate">{label}</span>
                        )}

                        {isEffectivelyCollapsed && (
                          <div
                            id={`tooltip-${to.replace('/', '')}`}
                            role="tooltip"
                            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-ink text-cream text-xs font-medium px-2 py-1 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 delay-150"
                          >
                            {label}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ─── Budget Status Card (Above User Block) ───────────────────────── */}
        {!budgetError && (
          <div className="shrink-0 pt-3">
            {budgetLoading ? (
              !isEffectivelyCollapsed ? (
                <div className="bg-card border border-line rounded-xl p-3 animate-pulse">
                  <div className="h-3 w-16 bg-line/60 rounded" />
                  <div className="h-4 w-32 bg-line/60 rounded mt-1.5" />
                  <div className="h-1.5 w-full bg-line/60 rounded-full mt-2" />
                </div>
              ) : (
                <div className="w-10 h-10 mx-auto rounded-xl bg-card border border-line animate-pulse flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-line/60" />
                </div>
              )
            ) : budgetStatus ? (
              !isEffectivelyCollapsed ? (
                <Link
                  to="/budgets"
                  onClick={isOpen && isMobile ? onClose : undefined}
                  className="block bg-card border border-line hover:border-line-light rounded-xl p-3 shadow-xs hover:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 group/bcard"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs text-ink-soft group-hover/bcard:text-ink transition-colors truncate max-w-[120px]"
                      title={budgetData.periodLabel || 'This month'}
                    >
                      {budgetData.periodLabel || 'This month'}
                    </span>
                    <span className={`text-[11px] font-semibold ${budgetStatus.textColor}`}>
                      {budgetStatus.statusText} ({budgetStatus.percent}%)
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-ink tabular-nums tracking-tight">
                    {formatLKR(budgetData.monthlyExpenses)} of {formatLKR(budgetData.budgetAmount)}
                  </div>
                  {/* 6px progress bar */}
                  <div className="w-full bg-cream-band h-1.5 rounded-full overflow-hidden mt-2 border border-line">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${budgetStatus.barColor}`}
                      style={{ width: `${Math.min(budgetStatus.percent, 100)}%` }}
                    />
                  </div>
                </Link>
              ) : (
                <div className="relative group/bicon flex justify-center">
                  <Link
                    to="/budgets"
                    aria-label={`Budget: ${budgetStatus.percent}% used (${budgetStatus.statusText})`}
                    aria-describedby="tooltip-budget-ring"
                    className="w-10 h-10 rounded-xl bg-card border border-line hover:border-line-light flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                  >
                    <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-line stroke-current"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${budgetStatus.ringColor} stroke-current transition-all duration-500`}
                        strokeDasharray={`${Math.min(budgetStatus.percent, 100)}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </Link>
                  <div
                    id="tooltip-budget-ring"
                    role="tooltip"
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-ink text-cream text-xs font-medium px-2 py-1 rounded-md shadow-lg opacity-0 pointer-events-none group-hover/bicon:opacity-100 group-focus-within/bicon:opacity-100 transition-opacity duration-150 delay-150"
                  >
                    Budget: {formatLKR(budgetData.monthlyExpenses)} of{' '}
                    {formatLKR(budgetData.budgetAmount)} ({budgetStatus.statusText}) · {budgetData.periodLabel || 'This month'}
                  </div>
                </div>
              )
            ) : (
              !isEffectivelyCollapsed ? (
                <div className="bg-card border border-line rounded-xl p-3">
                  <div className="text-xs text-ink-soft">No budget set</div>
                  <Link
                    to="/budgets"
                    onClick={isOpen && isMobile ? onClose : undefined}
                    className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded"
                  >
                    Set budget &rarr;
                  </Link>
                </div>
              ) : (
                <div className="relative group/bicon flex justify-center">
                  <Link
                    to="/budgets"
                    aria-label="No budget set - Set budget"
                    aria-describedby="tooltip-budget-ring"
                    className="w-10 h-10 rounded-xl bg-card border border-line hover:border-line-light flex items-center justify-center text-ink-soft hover:text-brand transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                  >
                    <Target className="w-4 h-4" />
                  </Link>
                  <div
                    id="tooltip-budget-ring"
                    role="tooltip"
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-ink text-cream text-xs font-medium px-2 py-1 rounded-md shadow-lg opacity-0 pointer-events-none group-hover/bicon:opacity-100 group-focus-within/bicon:opacity-100 transition-opacity duration-150 delay-150"
                  >
                    No budget set &bull; Click to set
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ─── User Block & Account Menu Popover ───────────────────────────── */}
        <div className="border-t border-line pt-3 mt-2 shrink-0 relative">
          <button
            ref={userButtonRef}
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            aria-label={
              isEffectivelyCollapsed
                ? `${user?.name || 'Account'} (${user?.email || ''})`
                : undefined
            }
            className={`
              w-full flex items-center rounded-xl transition-colors text-left
              hover:bg-cream-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
              ${isEffectivelyCollapsed ? 'justify-center p-1' : 'gap-3 p-2'}
            `}
          >
            {/* 36px rounded-full avatar with initial */}
            <div className="w-9 h-9 rounded-full bg-brand text-white font-semibold text-sm flex items-center justify-center ring-2 ring-brand-soft shrink-0">
              {userInitial}
            </div>

            {!isEffectivelyCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold text-ink truncate leading-tight"
                    title={user?.name || 'User'}
                  >
                    {user?.name || 'User'}
                  </p>
                  <p
                    className="text-xs text-ink-soft truncate leading-tight mt-0.5"
                    title={user?.email || ''}
                  >
                    {user?.email || ''}
                  </p>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-ink-soft shrink-0" aria-hidden="true" />
              </>
            )}
          </button>

          {/* Upward Accessible Popover Menu */}
          {userMenuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="User Account Menu"
              className={`
                absolute z-50 bg-card border border-line rounded-xl shadow-xl p-1.5 min-w-[220px]
                animate-in fade-in slide-in-from-bottom-2 duration-150 motion-reduce:transition-none
                ${
                  isEffectivelyCollapsed
                    ? 'bottom-0 left-full ml-3'
                    : 'bottom-full mb-2 left-0 right-0'
                }
              `}
            >
              {/* Header with Name and Email */}
              <div className="px-2.5 py-2 border-b border-line mb-1">
                <p
                  className="text-xs font-semibold text-ink truncate"
                  title={user?.name || 'User'}
                >
                  {user?.name || 'User'}
                </p>
                <p
                  className="text-[11px] text-ink-soft truncate mt-0.5"
                  title={user?.email || ''}
                >
                  {user?.email || ''}
                </p>
              </div>

              {/* Profile Menu Item */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  if (isOpen && isMobile) onClose();
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-ink-body hover:bg-cream-hover hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 text-left"
              >
                <User className="w-4 h-4 text-ink-soft" />
                <span>Profile</span>
              </button>

              {/* Notifications Menu Item */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  if (isOpen && isMobile) onClose();
                  navigate('/notifications');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-ink-body hover:bg-cream-hover hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 text-left"
              >
                <Bell className="w-4 h-4 text-ink-soft" />
                <span>Notifications</span>
              </button>

              {/* Appearance Theme Toggle */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-ink-body">
                <span className="font-medium">Appearance</span>
                <div
                  className="bg-cream-band p-0.5 rounded-lg border border-line flex items-center gap-0.5"
                  role="group"
                  aria-label="Appearance theme toggle"
                >
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    aria-pressed={!isDark}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                      !isDark
                        ? 'bg-card text-ink shadow-xs'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-warn" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    aria-pressed={isDark}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                      isDark
                        ? 'bg-card text-ink shadow-xs'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-brand" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="my-1 border-t border-line" role="separator" />

              {/* Sign Out Action */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-expense hover:bg-expense/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-expense/50 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
