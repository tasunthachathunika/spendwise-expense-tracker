import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Gauge,
  PieChart,
  Tag,
  Search,
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/* ─── Static Accent Configurations (Design Tokens Only) ──────────── */
const ACCENTS = {
  income: {
    card: 'bg-income/5 border-income/20 hover:border-income/50 hover:shadow-lg hover:shadow-income/10',
    icon: 'bg-income/10 text-income border-income/20',
  },
  warn: {
    card: 'bg-warn/5 border-warn/20 hover:border-warn/50 hover:shadow-lg hover:shadow-warn/10',
    icon: 'bg-warn/10 text-warn border-warn/20',
  },
  info: {
    card: 'bg-info/5 border-info/20 hover:border-info/50 hover:shadow-lg hover:shadow-info/10',
    icon: 'bg-info/10 text-info border-info/20',
  },
  brand: {
    card: 'bg-brand/5 border-brand/20 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10',
    icon: 'bg-brand/10 text-brand border-brand/20',
  },
  neutral: {
    card: 'bg-card border-line hover:border-ink-soft/40 hover:shadow-lg',
    icon: 'bg-cream-band text-ink border-line',
  },
};

/* ─── Sample Data Constants ───────────────────────────────────────── */
const MINI_BARS = [
  { height: '60%', type: 'income' },
  { height: '40%', type: 'expense' },
  { height: '75%', type: 'income' },
  { height: '50%', type: 'expense' },
  { height: '90%', type: 'income' },
  { height: '65%', type: 'expense' },
];

const CATEGORY_TAGS = ['Food', 'Transport', 'Bills', 'Salary', 'Savings'];

/* ─── Widget Components ───────────────────────────────────────────── */

/** 1. Transactions Widget */
const TransactionsWidget = () => (
  <div
    aria-hidden="true"
    className="bg-card border border-line rounded-xl overflow-hidden divide-y divide-line text-xs shadow-xs"
  >
    <div className="py-2 px-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="font-semibold text-ink block truncate">
          Freelance UI contract
        </span>
        <span className="text-[11px] text-ink-soft block truncate">
          Bank transfer
        </span>
      </div>
      <span className="font-mono font-bold text-income tabular-nums flex-shrink-0 text-right">
        +Rs. 85,000
      </span>
    </div>

    <div className="py-2 px-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="font-semibold text-ink block truncate">
          Monthly fiber internet
        </span>
        <span className="text-[11px] text-ink-soft block truncate">
          Card payment
        </span>
      </div>
      <span className="font-mono font-bold text-expense tabular-nums flex-shrink-0 text-right">
        -Rs. 6,800
      </span>
    </div>
  </div>
);

/** 2. Budget Widget */
const BudgetWidget = ({ isVisible }) => (
  <div
    aria-hidden="true"
    className="bg-card border border-line rounded-xl p-3 space-y-2 shadow-xs"
  >
    <div className="flex justify-between items-center text-xs">
      <span className="font-semibold text-ink">Shopping</span>
      <span className="font-bold font-mono text-warn">82%</span>
    </div>
    <div className="w-full bg-line h-2 rounded-full overflow-hidden">
      <div
        className="bg-warn h-full rounded-full transition-all duration-1000 ease-out motion-reduce:transition-none"
        style={{ width: isVisible ? '82%' : '0%' }}
      />
    </div>
    <div className="flex justify-between items-center text-[11px] text-ink-soft font-mono">
      <span>Rs. 8,200 spent</span>
      <span>Rs. 10,000 limit</span>
    </div>
  </div>
);

/** 3. Charts Widget */
const ChartsWidget = ({ isVisible }) => (
  <div
    aria-hidden="true"
    className="bg-card border border-line rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs"
  >
    {/* 56px Inline SVG Donut */}
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          className="text-line"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="36 100"
          strokeDashoffset="0"
          className="text-brand"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="26 100"
          strokeDashoffset="-38"
          className="text-income"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="18 100"
          strokeDashoffset="-66"
          className="text-info"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="12 100"
          strokeDashoffset="-86"
          className="text-warn"
        />
      </svg>
    </div>

    {/* Mini Trend Bars */}
    <div className="flex items-end gap-1.5 h-14 pb-0.5">
      {MINI_BARS.map((bar, i) => (
        <div
          key={i}
          className={`w-2.5 rounded-t-sm transition-all duration-700 ease-out motion-reduce:transition-none ${
            bar.type === 'income' ? 'bg-income' : 'bg-expense'
          }`}
          style={{ height: isVisible ? bar.height : '0%' }}
        />
      ))}
    </div>
  </div>
);

/** 4. Categories Widget */
const CategoriesWidget = () => (
  <div
    aria-hidden="true"
    className="bg-card border border-line rounded-xl p-2.5 flex flex-wrap gap-1.5 shadow-xs"
  >
    {CATEGORY_TAGS.map((tag) => (
      <span
        key={tag}
        className="rounded-full border border-brand/30 bg-brand/10 text-brand text-xs px-2.5 py-1 font-medium"
      >
        {tag}
      </span>
    ))}
  </div>
);

/** 5. Search Widget */
const SearchWidget = () => (
  <div
    aria-hidden="true"
    className="bg-card border border-line rounded-full px-3 py-2 flex items-center justify-between gap-2 shadow-2xs"
  >
    <div className="flex items-center gap-2 truncate min-w-0">
      <Search className="w-3.5 h-3.5 text-ink-soft flex-shrink-0" />
      <span className="text-xs text-ink font-medium truncate">Supermarket</span>
    </div>
    <span className="text-[11px] font-semibold bg-brand-soft text-brand-dark px-2 py-0.5 rounded-full border border-brand/20 flex-shrink-0">
      3 matches
    </span>
  </div>
);

/** 6. Theme Widget (Interactive & Functional) */
const ThemeWidget = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="rounded-full bg-card border border-line p-1 flex items-center gap-1 shadow-2xs">
      <button
        type="button"
        onClick={() => isDark && toggleTheme()}
        aria-pressed={!isDark}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ring-brand/50 cursor-pointer ${
          !isDark ? 'bg-brand text-white shadow-xs' : 'text-ink-soft hover:text-ink'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => !isDark && toggleTheme()}
        aria-pressed={isDark}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ring-brand/50 cursor-pointer ${
          isDark ? 'bg-brand text-white shadow-xs' : 'text-ink-soft hover:text-ink'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>
    </div>
  );
};

/* ─── 6 Core Feature Cards Configuration ─────────────────────────── */
const CARDS = [
  {
    id: 1,
    title: 'Income and expense tracking',
    subtext: 'Log earnings and daily expenses with instant classification and transaction dates.',
    icon: ArrowLeftRight,
    accent: 'income',
    Widget: TransactionsWidget,
  },
  {
    id: 2,
    title: 'Monthly budgets',
    subtext: 'Set monthly spending targets and get visual alerts before you cross your limits.',
    icon: Gauge,
    accent: 'warn',
    Widget: BudgetWidget,
  },
  {
    id: 3,
    title: 'Visual charts',
    subtext: 'Understand where money goes at a glance with a category breakdown and 6-month trend bars.',
    icon: PieChart,
    accent: 'info',
    Widget: ChartsWidget,
  },
  {
    id: 4,
    title: 'Smart categories',
    subtext: 'Organise every transaction into categories for food, bills, travel and your income sources.',
    icon: Tag,
    accent: 'brand',
    Widget: CategoriesWidget,
  },
  {
    id: 5,
    title: 'Search and filters',
    subtext: 'Search by title and filter by category or date range to review your spending history instantly.',
    icon: Search,
    accent: 'neutral',
    Widget: SearchWidget,
  },
  {
    id: 6,
    title: 'Responsive and dual themes',
    subtext: 'A warm cream light theme or a sleek dark mode, on any phone, tablet or monitor.',
    icon: Smartphone,
    accent: 'income',
    Widget: ThemeWidget,
  },
];

/* ─── Core Features Section Component ────────────────────────────── */
const CoreFeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-24 py-16 lg:py-20 bg-cream border-t border-line/60 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header (Compact, Centred, max-w-3xl, mb-10) */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand block mb-2.5">
            Core features
          </span>
          <h2
            id="features-title"
            className="font-serif text-3xl lg:text-4xl font-bold text-ink tracking-tight text-balance leading-tight"
          >
            Everything you need to master your money
          </h2>
          <p className="mt-3 text-ink-soft text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Thoughtfully built to replace bloated spreadsheets with fast, intuitive cashflow tracking.
          </p>
        </div>

        {/* 3x2 Grid (1-col on mobile, 2-col on md, 3-col on lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {CARDS.map((card, index) => {
            const Icon = card.icon;
            const accentClasses = ACCENTS[card.accent];
            const CardWidget = card.Widget;

            return (
              <div
                key={card.id}
                style={{ transitionDelay: `${index * 60}ms` }}
                className={`group rounded-2xl border p-5 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 focus-within:-translate-y-1 ${
                  accentClasses.card
                } ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                } motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none`}
              >
                {/* Icon Tile */}
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${accentClasses.icon}`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-ink mt-4 tracking-tight">
                  {card.title}
                </h3>

                {/* Subtext */}
                <p className="text-sm text-ink-body leading-relaxed mt-1.5">
                  {card.subtext}
                </p>

                {/* Bottom Aligned Widget Container */}
                <div className="mt-auto pt-4">
                  <CardWidget isVisible={isVisible} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CoreFeaturesSection;
