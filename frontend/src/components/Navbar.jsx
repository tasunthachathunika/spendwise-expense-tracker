import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, getBudgetStatus } from '../utils/helpers';
import api from '../utils/api';

const getBreadcrumb = (pathname) => {
  switch (pathname) {
    case '/dashboard':
    case '/':
      return { parent: 'Dashboard', current: 'Overview' };
    case '/transactions':
      return { parent: 'App', current: 'Transactions' };
    case '/budgets':
      return { parent: 'App', current: 'Budgets' };
    case '/analytics':
      return { parent: 'App', current: 'Analytics' };
    case '/profile':
      return { parent: 'Account', current: 'Profile' };
    default:
      return { parent: 'SpendWise', current: 'Overview' };
  }
};

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);

  // Real Alerts State
  const [alerts, setAlerts] = useState([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const alertsPopoverRef = useRef(null);

  const breadcrumb = getBreadcrumb(location.pathname);

  // Current Month/Year for the Top Bar display
  const now = new Date();
  const currentMonthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Fetch real budget alert status for current month
  useEffect(() => {
    let isMounted = true;
    const fetchBudgetAlerts = async () => {
      try {
        const curMonth = now.getMonth() + 1;
        const curYear = now.getFullYear();
        const res = await api.get('/dashboard/summary', {
          params: { month: curMonth, year: curYear },
        });

        if (res.data?.success && isMounted) {
          const { summary } = res.data;
          const realAlerts = [];

          if (summary && Number(summary.budgetAmount) > 0) {
            const status = getBudgetStatus(summary.monthlyExpenses, summary.budgetAmount);
            if (status?.isDanger) {
              const overAmount = summary.monthlyExpenses - summary.budgetAmount;
              realAlerts.push({
                id: 'budget-danger',
                type: 'danger',
                title: 'Monthly Budget Exceeded',
                message: `You are over budget by ${formatCurrency(overAmount)} (${status.percent}% used).`,
                link: '/budgets',
                linkText: 'Adjust Budget',
              });
            } else if (status?.isWarn) {
              const remaining = summary.budgetAmount - summary.monthlyExpenses;
              realAlerts.push({
                id: 'budget-warn',
                type: 'warn',
                title: 'Budget Alert: Getting Close',
                message: `You have reached ${status.percent}% of your monthly budget (${formatCurrency(remaining)} remaining).`,
                link: '/budgets',
                linkText: 'Review Budget',
              });
            }
          }

          setAlerts(realAlerts);
        }
      } catch (err) {
        // Silently skip if network error; alerts remain empty
      }
    };

    fetchBudgetAlerts();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Global Keyboard Shortcut: Focus search with "/" or "Ctrl+K"
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not trigger if active element is an input, textarea or contenteditable
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;

      if ((e.key === '/' && !isInput) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchExpanded(true);
      } else if (e.key === 'Escape') {
        setIsAlertsOpen(false);
        if (isSearchExpanded) {
          setIsSearchExpanded(false);
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchExpanded]);

  // Click outside to close alerts popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (alertsPopoverRef.current && !alertsPopoverRef.current.contains(e.target)) {
        setIsAlertsOpen(false);
      }
    };
    if (isAlertsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAlertsOpen]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchExpanded(false);
    }
  };

  return (
    <header className="h-16 bg-cream/80 backdrop-blur-md border-b border-line sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open mobile navigation menu"
          className="lg:hidden p-2 rounded-xl bg-card border border-line text-ink-soft hover:text-ink transition cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb: Dashboard / Overview */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-sm select-none">
          <span className="text-ink-soft">{breadcrumb.parent}</span>
          <span className="text-ink-soft/40">/</span>
          <span className="font-semibold text-ink">{breadcrumb.current}</span>
        </nav>
      </div>

      {/* Center: Global Search Pill */}
      <div className="flex-1 max-w-md mx-auto hidden sm:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            aria-label="Search transactions"
            className="w-full bg-card border border-line hover:border-line-light focus:border-brand text-xs sm:text-sm text-ink placeholder:text-ink-soft/70 rounded-full pl-9 pr-14 py-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-ink-soft bg-cream-band border border-line rounded">
              /
            </kbd>
          </div>
        </form>
      </div>

      {/* Right Controls: Currency Info + Month + Alerts Bell (Conditional) + Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Mobile Search Expand Button */}
        <button
          type="button"
          onClick={() => {
            setIsSearchExpanded(!isSearchExpanded);
            if (!isSearchExpanded) {
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }
          }}
          className="sm:hidden p-2 rounded-xl bg-card border border-line text-ink-soft hover:text-ink"
          aria-label="Toggle search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Currency badge & Month (Preserved from original Layout) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-ink-soft border-r border-line pr-3 mr-1">
          <span>
            Currency: <strong className="text-ink font-semibold">LKR (Rs.)</strong>
          </span>
          <span className="text-ink-soft/40">•</span>
          <span className="text-ink-soft">{currentMonthYear}</span>
        </div>

        {/* Real Alerts Notification Bell (ONLY IF real alerts exist) */}
        {alerts.length > 0 && (
          <div className="relative" ref={alertsPopoverRef}>
            <button
              type="button"
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="p-2 rounded-xl bg-card border border-line hover:border-line-light text-ink-soft hover:text-ink relative transition shadow-sm cursor-pointer"
              aria-label={`Notifications: ${alerts.length} active alerts`}
              aria-expanded={isAlertsOpen}
            >
              <Bell className="w-4 h-4" />
              {/* Unread Alert Dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-expense animate-pulse ring-2 ring-card" />
            </button>

            {/* Accessible Popover */}
            {isAlertsOpen && (
              <div
                role="dialog"
                aria-label="Financial Alerts"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-line rounded-2xl shadow-xl p-4 z-50 animate-card-fade-up text-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <AlertTriangle className="w-4 h-4 text-warn" />
                    <span>Active Financial Alerts ({alerts.length})</span>
                  </div>
                  <button
                    onClick={() => setIsAlertsOpen(false)}
                    className="p-1 text-ink-soft hover:text-ink rounded"
                    aria-label="Close alerts"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border ${
                        alert.type === 'danger'
                          ? 'bg-expense/10 border-expense/30 text-expense'
                          : 'bg-warn/10 border-warn/30 text-warn'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {alert.type === 'danger' ? (
                          <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-xs">{alert.title}</p>
                          <p className="text-ink-soft text-[11px] mt-0.5 leading-relaxed">
                            {alert.message}
                          </p>
                          <Link
                            to={alert.link}
                            onClick={() => setIsAlertsOpen(false)}
                            className="inline-flex items-center gap-1 font-semibold text-brand hover:underline mt-2 text-xs"
                          >
                            <span>{alert.linkText}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sun / Moon Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-card border border-line hover:border-line-light text-ink-soft hover:text-ink transition flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer"
          title={isDark ? 'Switch to Warm Cream Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-warn" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-brand" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Search Overlay Bar */}
      {isSearchExpanded && (
        <div className="sm:hidden absolute inset-x-0 top-0 h-16 bg-cream border-b border-line px-4 flex items-center gap-2 z-50">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              autoFocus
              className="w-full bg-card border border-line text-xs text-ink rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-brand"
            />
          </form>
          <button
            onClick={() => setIsSearchExpanded(false)}
            className="p-2 text-ink-soft hover:text-ink"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
