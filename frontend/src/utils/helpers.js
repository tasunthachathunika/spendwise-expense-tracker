// Format currency in Sri Lankan Rupees (Rs. 250,000) using en-LK locale
const lkrFormatter = new Intl.NumberFormat('en-LK', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatCurrency = (amount, prefix = 'Rs. ') => {
  const val = Number(amount) || 0;
  const isNegative = val < 0;
  const formatted = lkrFormatter.format(Math.abs(val));
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
};

export const formatLKR = formatCurrency;

// Format signed currency (+Rs. 250,000 / -Rs. 145,000)
export const formatSignedCurrency = (amount, type) => {
  const val = Number(amount) || 0;
  const formatted = lkrFormatter.format(Math.abs(val));
  if (type === 'Income') return `+Rs. ${formatted}`;
  if (type === 'Expense') return `-Rs. ${formatted}`;
  return val < 0 ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
};

// Format date safely without mixing dateStyle with individual date components
export const formatDate = (date, opts = {}) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  if (opts.dateStyle || opts.timeStyle) {
    return d.toLocaleDateString('en-US', opts);
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  });
};

// Format date for input[type="date"]
export const toInputDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
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
