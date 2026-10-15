import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Gauge,
  PieChart,
  Tag,
  Search,
  Smartphone,
  Sun,
  Moon,
  Download,
  ListOrdered,
  Undo2,
  SlidersHorizontal,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getBudgetStatus } from '../../utils/helpers';

/* ─── Static Accent Configurations (Design Tokens Only) ──────────── */
const ACCENTS = {
  income: {
    topBar: 'bg-income/60',
    iconTile: 'bg-income/10 text-income border-income/25',
    wash: 'from-income/15',
  },
  warn: {
    topBar: 'bg-warn/60',
    iconTile: 'bg-warn/10 text-warn border-warn/25',
    wash: 'from-warn/15',
  },
  info: {
    topBar: 'bg-info/60',
    iconTile: 'bg-info/10 text-info border-info/25',
    wash: 'from-info/15',
  },
  brand: {
    topBar: 'bg-brand/60',
    iconTile: 'bg-brand/10 text-brand border-brand/25',
    wash: 'from-brand/15',
  },
  neutral: {
    topBar: 'bg-line/70',
    iconTile: 'bg-cream-band text-ink-soft border-line',
    wash: 'from-line/20',
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

const REAL_CATEGORIES = [
  { name: 'Food & Dining', color: 'bg-brand/10 text-brand border-brand/20' },
  { name: 'Transportation', color: 'bg-info/10 text-info border-info/20' },
  { name: 'Utilities', color: 'bg-warn/10 text-warn border-warn/20' },
  { name: 'Shopping', color: 'bg-expense/10 text-expense border-expense/20' },
  { name: 'Salary', color: 'bg-income/10 text-income border-income/20' },
  { name: 'Freelance', color: 'bg-brand-soft text-brand-dark border-brand/25' },
];

/* ─── 1. Transactions Widget ──────────────────────────────────────── */
const TransactionsWidget = ({ isVisible }) => (
  <div
    aria-hidden="true"
    className="bg-card border border-line rounded-lg overflow-hidden divide-y divide-line text-xs shadow-xs"
  >
    <div
      className={`py-1 px-2 flex items-center justify-between gap-1.5 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
      } motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none`}
    >
      <div className="min-w-0">
        <span className="font-semibold text-ink block truncate text-[10.5px]">
          Freelance UI contract
        </span>
        <span className="text-[9.5px] text-ink-soft block truncate">
          Salary · Bank Transfer
        </span>
      </div>
      <span className="font-sans font-bold text-income tabular-nums flex-shrink-0 text-right text-[10.5px]">
        +Rs. 85,000
      </span>
    </div>

    <div
      className={`py-1 px-2 flex items-center justify-between gap-1.5 transition-all duration-500 delay-100 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
      } motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none`}
    >
      <div className="min-w-0">
        <span className="font-semibold text-ink block truncate text-[10.5px]">
          Monthly fiber internet
        </span>
        <span className="text-[9.5px] text-ink-soft block truncate">
          Utilities · Debit Card
        </span>
      </div>
      <span className="font-sans font-bold text-expense tabular-nums flex-shrink-0 text-right text-[10.5px]">
        -Rs. 6,800
      </span>
    </div>
  </div>
);

/* ─── 2. Budget Widget ────────────────────────────────────────────── */
const BudgetWidget = ({ isVisible }) => {
  const budgetStatus = getBudgetStatus(8200, 10000);

  return (
    <div
      aria-hidden="true"
      className="bg-card border border-line rounded-lg p-2 space-y-1 shadow-xs"
    >
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-ink text-[10.5px]">Shopping</span>
          <span
            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${
              budgetStatus?.badgeClass || 'bg-warn/10 text-warn border-warn/30'
            }`}
          >
            {budgetStatus?.statusText || 'Getting close (82%)'}
          </span>
        </div>
        <span className="font-bold font-sans tabular-nums text-warn text-[10.5px]">82%</span>
      </div>

      <div className="w-full bg-line/60 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-warn h-full rounded-full transition-all duration-1000 ease-out motion-reduce:transition-none"
          style={{ width: isVisible ? '82%' : '0%' }}
        />
      </div>

      <div className="flex justify-between items-center text-[9.5px] text-ink-soft font-sans tabular-nums">
        <span>Rs. 8,200 spent</span>
        <span>Rs. 10,000 limit</span>
      </div>
    </div>
  );
};

/* ─── 3. Charts Widget ────────────────────────────────────────────── */
const ChartsWidget = ({ isVisible }) => (
  <div
    aria-hidden="true"
    className="bg-card border border-line rounded-lg p-1.5 px-2 flex items-center justify-between gap-2.5 shadow-xs"
  >
    {/* Compact 38px Inline SVG Donut */}
    <div className="relative w-9.5 h-9.5 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-9.5 h-9.5 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          className="text-line/40"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="34 100"
          strokeDashoffset="0"
          className="text-brand transition-all duration-1000 ease-out motion-reduce:transition-none"
          style={{ strokeDasharray: isVisible ? '34 100' : '0 100' }}
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="24 100"
          strokeDashoffset="-36"
          className="text-income transition-all duration-1000 ease-out motion-reduce:transition-none"
          style={{ strokeDasharray: isVisible ? '24 100' : '0 100' }}
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="16 100"
          strokeDashoffset="-62"
          className="text-info transition-all duration-1000 ease-out motion-reduce:transition-none"
          style={{ strokeDasharray: isVisible ? '16 100' : '0 100' }}
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="12 100"
          strokeDashoffset="-80"
          className="text-warn transition-all duration-1000 ease-out motion-reduce:transition-none"
          style={{ strokeDasharray: isVisible ? '12 100' : '0 100' }}
        />
      </svg>
    </div>

    {/* Mini Trend Bars */}
    <div className="flex items-end gap-1.5 h-9 pb-0.5">
      {MINI_BARS.map((bar, i) => (
        <div
          key={i}
          className={`w-1.5 sm:w-2 rounded-t-xs transition-all duration-700 ease-out motion-reduce:transition-none ${
            bar.type === 'income' ? 'bg-income' : 'bg-expense'
          }`}
          style={{ height: isVisible ? bar.height : '0%' }}
        />
      ))}
    </div>
  </div>
);

/* ─── 4. Categories Widget ────────────────────────────────────────── */
const CategoriesWidget = () => (
  <div
    aria-hidden="true"
    className="bg-card border border-line rounded-lg p-1.5 flex flex-wrap gap-1 shadow-xs"
  >
    {REAL_CATEGORIES.map((cat) => (
      <span
        key={cat.name}
        className={`rounded-md border text-[9.5px] px-1.5 py-0.5 font-medium shadow-2xs ${cat.color}`}
      >
        {cat.name}
      </span>
    ))}
  </div>
);

/* ─── 5. Search Widget ────────────────────────────────────────────── */
const SearchWidget = () => (
  <div aria-hidden="true" className="space-y-1">
    <div className="bg-card border border-line rounded-lg px-2 py-1 flex items-center justify-between gap-1.5 shadow-2xs">
      <div className="flex items-center gap-1.5 truncate min-w-0">
        <Search className="w-3 h-3 text-ink-soft flex-shrink-0" />
        <span className="text-[10.5px] text-ink font-medium truncate">
          Super
          <span className="bg-brand-soft text-brand-dark px-1 py-0.2 rounded font-semibold">
            market
          </span>
        </span>
      </div>
      <span className="text-[9px] font-semibold bg-brand-soft text-brand-dark px-1.5 py-0.2 rounded-full border border-brand/20 flex-shrink-0 font-mono">
        3 matches
      </span>
    </div>
    <div className="flex items-center gap-1.5 text-[9.5px] text-ink-soft font-medium">
      <span className="bg-card border border-line rounded-md px-1.5 py-0.2">
        Type: All
      </span>
      <span className="bg-card border border-line rounded-md px-1.5 py-0.2">
        Date: This month
      </span>
    </div>
  </div>
);

/* ─── 6. Theme Widget (Interactive & Accessible) ─────────────────── */
const ThemeWidget = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="rounded-full bg-card border border-line p-0.5 flex items-center gap-1 shadow-2xs">
      <button
        type="button"
        onClick={() => isDark && toggleTheme()}
        aria-pressed={!isDark}
        className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-full text-[10.5px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ring-brand/50 cursor-pointer ${
          !isDark ? 'bg-brand text-white shadow-xs' : 'text-ink-soft hover:text-ink'
        }`}
      >
        <Sun className="w-3 h-3" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => !isDark && toggleTheme()}
        aria-pressed={isDark}
        className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-full text-[10.5px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ring-brand/50 cursor-pointer ${
          isDark ? 'bg-brand text-white shadow-xs' : 'text-ink-soft hover:text-ink'
        }`}
      >
        <Moon className="w-3 h-3" />
        <span>Dark</span>
      </button>
    </div>
  );
};

/* ─── 6 Core Feature Cards Configuration ─────────────────────────── */
const CARDS = [
  {
    id: 1,
    step: '01',
    title: 'Income & expense tracking',
    subtext: 'Log earnings and daily expenses with instant classification and dates.',
    icon: ArrowLeftRight,
    accent: 'income',
    Widget: TransactionsWidget,
  },
  {
    id: 2,
    step: '02',
    title: 'Monthly budgets',
    subtext: 'Set monthly spending targets and get visual alerts before crossing limits.',
    icon: Gauge,
    accent: 'warn',
    Widget: BudgetWidget,
  },
  {
    id: 3,
    step: '03',
    title: 'Visual charts',
    subtext: 'Understand where money goes with category breakdowns and 6-month trends.',
    icon: PieChart,
    accent: 'info',
    Widget: ChartsWidget,
  },
  {
    id: 4,
    step: '04',
    title: 'Smart categories',
    subtext: 'Organise every transaction into food, bills, travel and income sources.',
    icon: Tag,
    accent: 'brand',
    Widget: CategoriesWidget,
  },
  {
    id: 5,
    step: '05',
    title: 'Search and filters',
    subtext: 'Search by title and filter by category or date range to review history.',
    icon: Search,
    accent: 'neutral',
    Widget: SearchWidget,
  },
  {
    id: 6,
    step: '06',
    title: 'Responsive & dual themes',
    subtext: 'A warm cream light theme or sleek dark mode on any phone, tablet or monitor.',
    icon: Smartphone,
    accent: 'income',
    Widget: ThemeWidget,
  },
];

/* ─── Core Features Section Component ────────────────────────────── */
const CoreFeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lightImgFailed, setLightImgFailed] = useState(false);
  const [darkImgFailed, setDarkImgFailed] = useState(false);
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
      className="relative isolate overflow-hidden scroll-mt-24 py-8 sm:py-10 lg:py-12 bg-cream transition-colors"
    >
      {/* ─── Background Layer (z-0) - 100% Sharp & Clear Real-World Photo ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Fallback only if images fail */}
        {(lightImgFailed || darkImgFailed) && (
          <div className="features-dotted-grid absolute inset-0 opacity-30" />
        )}

        {/* Light Mode High-Resolution Real-World Background Image (100% Crisp) */}
        {!lightImgFailed && (
          <img
            src="/landing/features-bg.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={2000}
            height={1125}
            onError={() => setLightImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-center dark:hidden opacity-100"
          />
        )}

        {/* Dark Mode High-Resolution Real-World Background Image (Crystal Clear & Deep) */}
        {!darkImgFailed && (
          <img
            src="/landing/features-bg-dark.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={2000}
            height={1125}
            onError={() => setDarkImgFailed(true)}
            className="hidden dark:block absolute inset-0 h-full w-full object-cover object-center opacity-95"
          />
        )}

        {/* Soft edge feathers ONLY at very top and bottom to seamlessly merge with adjacent sections */}
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-cream via-cream/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-cream via-cream/60 to-transparent pointer-events-none" />
      </div>

      {/* ─── Content Layer (z-10) ─── */}
      <div className="container-page relative z-10">
        
        {/* Header (Centred, compact) */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-5">
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-brand mb-1.5 px-2.5 py-0.5 rounded-full bg-cream/70 backdrop-blur-xs border border-line/40">
            Core features
          </span>
          <h2
            id="features-title"
            tabIndex={-1}
            className="font-serif text-xl sm:text-2xl lg:text-[28px] font-bold text-ink tracking-tight leading-tight max-w-2xl mx-auto text-balance outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-lg px-2"
          >
            Everything you need to master your money
          </h2>
          <p
            className="mt-1 sm:mt-1.5 text-xs sm:text-[13px] text-ink-body max-w-xl mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 8px rgb(var(--cream) / 0.9)' }}
          >
            Thoughtfully built to replace bloated spreadsheets with fast, intuitive cashflow tracking.
          </p>
        </div>

        {/* 6 Cards Grid (1-col on mobile, 2-col on md, 3-col on xl) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5 lg:gap-4 mt-4 sm:mt-5 items-stretch">
          {CARDS.map((card, index) => {
            const Icon = card.icon;
            const accentClasses = ACCENTS[card.accent];
            const CardWidget = card.Widget;

            return (
              <div
                key={card.id}
                style={{ transitionDelay: `${index * 60}ms` }}
                className={`feature-glass-card relative overflow-hidden rounded-2xl border border-line p-3.5 sm:p-4 shadow-[0_4px_20px_rgb(var(--ink)/0.06)] dark:shadow-none dark:border-line-light/40 flex flex-col justify-between group transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 focus-within:-translate-y-1 focus-within:border-brand/40 motion-reduce:transform-none motion-reduce:transition-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/50 dark:before:bg-white/[0.06] before:pointer-events-none ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none`}
              >
                {/* 2px Accent Bar along top edge */}
                <div
                  className={`absolute top-0 inset-x-0 h-0.5 pointer-events-none ${accentClasses.topBar}`}
                />

                {/* Soft Corner Accent Wash */}
                <div
                  className={`absolute -top-14 -left-14 w-28 h-28 rounded-full pointer-events-none bg-gradient-to-br ${accentClasses.wash} to-transparent opacity-50 group-hover:opacity-80 transition-opacity`}
                />

                <div>
                  {/* Top Row: Icon Tile + Step Chip */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 group-focus-within:scale-105 shadow-2xs border ${accentClasses.iconTile}`}
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-semibold rounded-full px-2 py-0.2 bg-card/80 border border-line text-ink-soft font-mono">
                      {card.step}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-sm sm:text-[15px] font-bold font-serif text-ink mt-2 tracking-tight leading-snug">
                    {card.title}
                  </h3>

                  {/* Card Subtext */}
                  <p className="text-[11.5px] sm:text-xs text-ink-body leading-normal mt-0.5">
                    {card.subtext}
                  </p>
                </div>

                {/* Bottom Aligned Widget Container inside Visual Stage */}
                <div className="mt-auto pt-2 sm:pt-2.5">
                  <div className="rounded-xl bg-cream-band/75 border border-line/60 p-2 min-h-[72px] sm:min-h-[76px] flex flex-col justify-center">
                    <CardWidget isVisible={isVisible} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── "Also included" Pills Row ─── */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-ink-soft mb-2">
            Also included in SpendWise
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <div className="rounded-full bg-card/85 border border-line text-[11px] sm:text-xs px-3 py-1 backdrop-blur-xs flex items-center gap-1.5 text-ink-body font-medium shadow-2xs">
              <Download className="w-3 h-3 text-brand flex-shrink-0" />
              <span>CSV & PDF Export</span>
            </div>
            <div className="rounded-full bg-card/85 border border-line text-[11px] sm:text-xs px-3 py-1 backdrop-blur-xs flex items-center gap-1.5 text-ink-body font-medium shadow-2xs">
              <ListOrdered className="w-3 h-3 text-brand flex-shrink-0" />
              <span>Server Pagination</span>
            </div>
            <div className="rounded-full bg-card/85 border border-line text-[11px] sm:text-xs px-3 py-1 backdrop-blur-xs flex items-center gap-1.5 text-ink-body font-medium shadow-2xs">
              <Undo2 className="w-3 h-3 text-brand flex-shrink-0" />
              <span>Instant Undo Delete</span>
            </div>
            <div className="rounded-full bg-card/85 border border-line text-[11px] sm:text-xs px-3 py-1 backdrop-blur-xs flex items-center gap-1.5 text-ink-body font-medium shadow-2xs">
              <SlidersHorizontal className="w-3 h-3 text-brand flex-shrink-0" />
              <span>3-Tier Alert Thresholds</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CoreFeaturesSection;
