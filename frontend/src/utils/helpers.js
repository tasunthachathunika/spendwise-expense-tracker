import { useState, useEffect } from 'react';

// Multi-currency storage and helpers (LKR default, USD option)
export const getStoredCurrency = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('spendwise_currency') || 'LKR';
  }
  return 'LKR';
};

export const setStoredCurrency = (currency) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('spendwise_currency', currency);
    window.dispatchEvent(new CustomEvent('spendwise_currency_change', { detail: currency }));
    window.dispatchEvent(new Event('currencyChange'));
  }
};

export const getCurrencySymbol = (currency = getStoredCurrency()) => {
  return currency === 'USD' ? '$' : 'Rs. ';
};

export const getCurrencyCode = (currency = getStoredCurrency()) => {
  return currency === 'USD' ? 'USD' : 'LKR';
};

export const getCurrencyLabel = (currency = getStoredCurrency()) => {
  return currency === 'USD' ? 'US Dollar • USD ($)' : 'Sri Lankan Rupee • LKR (Rs.)';
};

// React hook to subscribe to currency changes reactively
export const useCurrency = () => {
  const [currency, setCurrencyState] = useState(getStoredCurrency);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrencyState(getStoredCurrency());
    };
    window.addEventListener('currencyChange', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('currencyChange', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const changeCurrency = (newVal) => {
    setStoredCurrency(newVal);
    setCurrencyState(newVal);
  };

  return {
    currency,
    setCurrency: changeCurrency,
    symbol: getCurrencySymbol(currency),
    code: getCurrencyCode(currency),
    label: getCurrencyLabel(currency),
  };
};

// Formatters for LKR and USD
const lkrFormatter = new Intl.NumberFormat('en-LK', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatCurrency = (amount, customPrefix) => {
  const val = Number(amount) || 0;
  const isNegative = val < 0;
  const currency = getStoredCurrency();
  const isUsd = currency === 'USD';
  const formatter = isUsd ? usdFormatter : lkrFormatter;
  const defaultPrefix = isUsd ? '$' : 'Rs. ';
  const prefix = customPrefix !== undefined ? customPrefix : defaultPrefix;
  const formatted = formatter.format(Math.abs(val));
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
};

export const formatLKR = formatCurrency;

// Format signed currency (+Rs. 250,000 / -$145,000)
export const formatSignedCurrency = (amount, type) => {
  const val = Number(amount) || 0;
  const currency = getStoredCurrency();
  const isUsd = currency === 'USD';
  const formatter = isUsd ? usdFormatter : lkrFormatter;
  const prefix = isUsd ? '$' : 'Rs. ';
  const formatted = formatter.format(Math.abs(val));
  if (type === 'Income') return `+${prefix}${formatted}`;
  if (type === 'Expense') return `-${prefix}${formatted}`;
  return val < 0 ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
};

// Format date safely with explicit UTC option to prevent timezone off-by-one shifts
export const formatDate = (date, opts = {}) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  if (opts.dateStyle || opts.timeStyle) {
    return d.toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
    ...opts,
  });
};

// Explicit UTC date formatter
export const formatDateUtc = (date, opts = {}) => {
  return formatDate(date, { timeZone: 'UTC', ...opts });
};

// Format date for native input[type="date"] (YYYY-MM-DD)
export const toInputDate = (date) => {
  if (!date) return '';
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Format budget period label (e.g. "Oct 2026" or "15 Oct to 14 Nov 2026")
export const formatBudgetPeriod = (startDate, endDate, periodType = 'month', month, year) => {
  if (periodType === 'month' && month && year) {
    const mIdx = Math.max(0, Math.min(11, month - 1));
    return `${SHORT_MONTHS[mIdx]} ${year}`;
  }

  if (!startDate || !endDate) {
    if (month && year) {
      const mIdx = Math.max(0, Math.min(11, month - 1));
      return `${SHORT_MONTHS[mIdx]} ${year}`;
    }
    return 'Custom Period';
  }

  const s = new Date(startDate);
  const e = new Date(endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Custom Period';

  if (periodType === 'month') {
    return `${SHORT_MONTHS[s.getUTCMonth()]} ${s.getUTCFullYear()}`;
  }

  const sDay = s.getUTCDate();
  const sMonth = SHORT_MONTHS[s.getUTCMonth()];
  const sYear = s.getUTCFullYear();

  const eDay = e.getUTCDate();
  const eMonth = SHORT_MONTHS[e.getUTCMonth()];
  const eYear = e.getUTCFullYear();

  if (sYear === eYear) {
    return `${sDay} ${sMonth} to ${eDay} ${eMonth} ${eYear}`;
  }
  return `${sDay} ${sMonth} ${sYear} to ${eDay} ${eMonth} ${eYear}`;
};

// Calculate salary day start and end dates (clamped to month lengths)
export const getSalaryDayRange = (salaryDay, refDate = new Date()) => {
  const y = refDate.getFullYear();
  const m = refDate.getMonth();
  const d = refDate.getDate();

  const getClampedUtc = (year, month, targetDay) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const clamped = Math.min(targetDay, daysInMonth);
    return new Date(Date.UTC(year, month, clamped));
  };

  const todayUtc = new Date(Date.UTC(y, m, d));
  let candidateStart = getClampedUtc(y, m, salaryDay);
  let nextCycle;

  if (candidateStart > todayUtc) {
    const prevMonth = new Date(Date.UTC(y, m - 1, 1));
    candidateStart = getClampedUtc(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth(), salaryDay);
    nextCycle = getClampedUtc(y, m, salaryDay);
  } else {
    const nextMonth = new Date(Date.UTC(y, m + 1, 1));
    nextCycle = getClampedUtc(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), salaryDay);
  }

  const candidateEnd = new Date(nextCycle.getTime() - 24 * 60 * 60 * 1000);

  return {
    startDate: toInputDate(candidateStart),
    endDate: toInputDate(candidateEnd),
  };
};

// Unified budget status evaluation with user/system thresholds
export const getBudgetStatus = (
  spent = 0,
  budget = 0,
  { warnThreshold = 70, dangerThreshold = 90 } = {}
) => {
  if (!budget || budget <= 0) return null;
  const numSpent = Number(spent) || 0;
  const numBudget = Number(budget) || 0;
  const percent = Math.round((numSpent / numBudget) * 100);
  const isOverBudget = numSpent > numBudget;

  if (isOverBudget || percent >= dangerThreshold) {
    return {
      statusKey: 'danger',
      statusText: isOverBudget ? 'Budget Exceeded' : `Critical Limit (${percent}%)`,
      badgeLabel: isOverBudget ? 'Over Budget' : `Alert (${percent}%)`,
      barColor: 'bg-expense',
      textColor: 'text-expense',
      ringColor: 'text-expense',
      badgeClass: 'bg-expense/10 text-expense border-expense/30',
      percent,
      isOverBudget,
    };
  }

  if (percent >= warnThreshold) {
    return {
      statusKey: 'warning',
      statusText: `Getting close (${percent}%)`,
      badgeLabel: `Warning (${percent}%)`,
      barColor: 'bg-warn',
      textColor: 'text-warn',
      ringColor: 'text-warn',
      badgeClass: 'bg-warn/10 text-warn border-warn/30',
      percent,
      isOverBudget: false,
    };
  }

  return {
    statusKey: 'safe',
    statusText: `On track (${percent}%)`,
    badgeLabel: `On Track (${percent}%)`,
    barColor: 'bg-income',
    textColor: 'text-income',
    ringColor: 'text-income',
    badgeClass: 'bg-income/10 text-income border-income/30',
    percent,
    isOverBudget: false,
  };
};

// Get month name
export const monthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
};

// Get initials from name
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// Category icon mapping (Lucide icon identifier name)
export const categoryIcon = (category = '') => {
  const map = {
    Food: 'Utensils', Groceries: 'ShoppingCart', Transport: 'Car', Fuel: 'Fuel',
    Shopping: 'ShoppingBag', Entertainment: 'Film', Health: 'HeartPulse', Medical: 'HeartPulse',
    Education: 'GraduationCap', Rent: 'Home', Housing: 'Home', Utilities: 'Zap',
    Travel: 'Plane', Gym: 'Dumbbell', Salary: 'Briefcase', Freelance: 'Laptop',
    Investment: 'TrendingUp', Business: 'Building2', Gift: 'Gift', Other: 'Package',
  };
  return map[category] || 'CircleDollarSign';
};

// Chart color palette (Warm Cream Light / Monarch spec: orange, amber, sky, violet, pink, teal, grey)
export const CHART_COLORS = [
  '#ea580c', // Orange
  '#d97706', // Amber
  '#0284c7', // Sky
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#0d9488', // Teal
  '#78716c', // Grey (Other)
];

// Default expense categories
export const EXPENSE_CATEGORIES = [
  'Food', 'Groceries', 'Transport', 'Fuel', 'Shopping',
  'Entertainment', 'Health', 'Medical', 'Education', 'Rent',
  'Utilities', 'Travel', 'Gym', 'Subscriptions', 'Other',
];

// Default income categories
export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investment', 'Gift',
  'Rental Income', 'Bonus', 'Other',
];

/**
 * Formats a timestamp into a human relative string ("just now", "5m ago", "2h ago", "Yesterday", "3d ago")
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) {
    const mins = Math.max(1, Math.floor(diffSec / 60));
    return `${mins}m ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours}h ago`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  const days = Math.floor(diffSec / 86400);
  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Groups an array of notification objects by 'Today', 'Yesterday', or 'Earlier'
 */
export const groupNotificationsByDate = (notifications = []) => {
  const groups = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yestDate = yesterday.getDate();
  const yestMonth = yesterday.getMonth();
  const yestYear = yesterday.getFullYear();

  for (const notif of notifications) {
    const d = new Date(notif.createdAt);
    if (isNaN(d.getTime())) {
      groups.Earlier.push(notif);
      continue;
    }

    if (
      d.getDate() === todayDate &&
      d.getMonth() === todayMonth &&
      d.getFullYear() === todayYear
    ) {
      groups.Today.push(notif);
    } else if (
      d.getDate() === yestDate &&
      d.getMonth() === yestMonth &&
      d.getFullYear() === yestYear
    ) {
      groups.Yesterday.push(notif);
    } else {
      groups.Earlier.push(notif);
    }
  }

  return groups;
};
