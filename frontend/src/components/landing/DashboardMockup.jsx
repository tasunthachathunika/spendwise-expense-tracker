import React, { useRef, useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  WalletCards,
  Target,
  ShoppingCart,
  Zap,
  ArrowDownLeft,
  Calendar,
  Lock,
  UtensilsCrossed
} from 'lucide-react';

/* ─── Sample Data (100% Preserved) ────────────────────────────────── */
export const SAMPLE_METRICS = {
  income: {
    label: 'Total income',
    amount: 250000,
    change: '+14.2% vs last month',
  },
  expenses: {
    label: 'Total expenses',
    amount: -145000,
    change: 'Across 4 categories',
  },
  balance: {
    label: 'Net balance',
    amount: 105000,
    change: '42% of income saved',
  },
  monthlyBudget: {
    label: 'Monthly budget',
    amount: 180000,
    change: 'Rs. 35,000 remaining',
  },
};

export const SAMPLE_BUDGET = {
  totalBudget: 180000,
  spent: 145000,
  remaining: 35000,
  percentage: 80.5,
  status: 'Near limit',
};

export const SAMPLE_CHART_DATA = [
  { month: 'May', income: 195000, expense: 120000 },
  { month: 'Jun', income: 215000, expense: 130000 },
  { month: 'Jul', income: 230000, expense: 140000 },
  { month: 'Aug', income: 240000, expense: 135000 },
  { month: 'Sep', income: 235000, expense: 150000 },
  { month: 'Oct', income: 250000, expense: 145000 },
];

export const SAMPLE_TRANSACTIONS = [
  {
    id: 1,
    title: 'Client UI project',
    amount: 45000,
    type: 'income',
    meta: 'Today · Direct deposit',
    icon: ArrowDownLeft,
  },
  {
    id: 2,
    title: 'Supermarket groceries',
    amount: -12450,
    type: 'expense',
    meta: 'Today · Debit card',
    tag: 'Auto-tagged: Food',
    icon: ShoppingCart,
  },
  {
    id: 3,
    title: 'Internet and electricity',
    amount: -8900,
    type: 'expense',
    meta: 'Yesterday · Utility bill',
    icon: Zap,
  },
];

export const SAMPLE_FLOATING_CARD = {
  category: 'Food and dining',
  spent: 13600,
  limit: 20000,
  percentage: 68,
};

/* ─── Currency Formatter ─────────────────────────────────────────── */
const formatLKR = (amount, signed = false) => {
  const formatted = new Intl.NumberFormat('en-LK').format(Math.abs(amount));
  if (!signed) return `Rs. ${formatted}`;
  return `${amount >= 0 ? '+' : '-'}Rs. ${formatted}`;
};

/**
 * One-time pulse ring when a region activates (700ms)
 */
const HighlightPulse = ({ activeKey }) => (
  <span
    key={activeKey}
    className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-brand animate-highlight-pulse motion-reduce:hidden z-20"
    aria-hidden="true"
  />
);

const DashboardMockup = ({ activeStep = 0 }) => {
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const mockupRef = useRef(null);

  useEffect(() => {
    if (!mockupRef.current || typeof IntersectionObserver === 'undefined') {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(mockupRef.current);
    return () => observer.disconnect();
  }, []);

  // Highlight mapping based on active step
  const isIncomeHighlighted = activeStep === 0;
  const isExpensesHighlighted = activeStep === 0;
  const isTransactionsHighlighted = activeStep === 0;

  const isBudgetCardHighlighted = activeStep === 1;
  const isBudgetPanelHighlighted = activeStep === 1;

  const isBalanceHighlighted = activeStep === 2;
  const isChartHighlighted = activeStep === 2;

  const getRegionClass = (isHighlighted) => {
    return `relative transition-all duration-700 ease-in-out ${
      isHighlighted
        ? 'ring-2 ring-brand/60 shadow-lg shadow-brand/20 scale-[1.01] opacity-100 z-10 motion-reduce:scale-100'
        : 'opacity-60 scale-100 ring-0 shadow-none z-0 hover:opacity-85'
    }`;
  };

  return (
    <div
      role="tabpanel"
      id={`panel-${activeStep}`}
      aria-labelledby={`tab-${activeStep}`}
      className="relative w-full"
    >
      {/* Screen reader descriptive narration */}
      <span className="sr-only">
        Interactive SpendWise financial ledger preview showing real-time monthly income, expenses, dynamic budget warning threshold, and 6-month cashflow analytics.
      </span>

      {/* Decorative Browser Frame Mockup */}
      <div
        ref={mockupRef}
        aria-hidden="true"
        className="relative bg-card rounded-2xl border border-line shadow-2xl overflow-hidden mockup-3d-tilt transition-all"
      >
        {/* 1. Window Header (Reduced height py-2) */}
        <div className="bg-cream/90 dark:bg-card border-b border-line px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-line" />
            <span className="w-2 h-2 rounded-full bg-line" />
            <span className="w-2 h-2 rounded-full bg-line" />
          </div>

          <div className="bg-card dark:bg-cream-band border border-line/70 rounded-full px-2.5 sm:px-3 py-0.5 text-[11px] font-mono text-ink-soft flex items-center gap-1.5 shadow-xs">
            <Lock className="w-3 h-3 text-ink-soft" />
            <span>spendwise.app/dashboard</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-ink-soft bg-card dark:bg-cream-band rounded-md px-2 py-0.5 border border-line/60 shadow-xs">
            <Calendar className="w-3 h-3 text-brand" />
            <span>October 2026</span>
          </div>
        </div>

        {/* Interior Container */}
        <div className="bg-cream-band/60 dark:bg-cream-band/40 p-3 sm:p-3.5 space-y-2.5 sm:space-y-3">
          
          {/* 2. Metric Row (2-col mobile, 4-col sm+) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            
            {/* Total Income Card (Step 1 highlight) */}
            <div
              className={`bg-card border border-line rounded-xl p-2.5 sm:p-3 ${getRegionClass(
                isIncomeHighlighted
              )}`}
            >
              {isIncomeHighlighted && <HighlightPulse activeKey={`pulse-income-${activeStep}`} />}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft truncate">
                  {SAMPLE_METRICS.income.label}
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-income flex-shrink-0" />
              </div>
              <p className="font-mono tabular-nums text-sm sm:text-base font-bold text-income truncate">
                {formatLKR(SAMPLE_METRICS.income.amount, true)}
              </p>
              <p className="text-[11px] text-ink-soft truncate mt-0.5">
                {SAMPLE_METRICS.income.change}
              </p>
            </div>

            {/* Total Expenses Card (Step 1 highlight) */}
            <div
              className={`bg-card border border-line rounded-xl p-2.5 sm:p-3 ${getRegionClass(
                isExpensesHighlighted
              )}`}
            >
              {isExpensesHighlighted && <HighlightPulse activeKey={`pulse-expenses-${activeStep}`} />}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft truncate">
                  {SAMPLE_METRICS.expenses.label}
                </span>
                <TrendingDown className="w-3.5 h-3.5 text-expense flex-shrink-0" />
              </div>
              <p className="font-mono tabular-nums text-sm sm:text-base font-bold text-expense truncate">
                {formatLKR(SAMPLE_METRICS.expenses.amount, true)}
              </p>
              <p className="text-[11px] text-ink-soft truncate mt-0.5">
                {SAMPLE_METRICS.expenses.change}
              </p>
            </div>

            {/* Net Balance Card (Step 3 highlight ONLY - no permanent glow) */}
            <div
              className={`bg-card border border-line rounded-xl p-2.5 sm:p-3 ${getRegionClass(
                isBalanceHighlighted
              )}`}
            >
              {isBalanceHighlighted && <HighlightPulse activeKey={`pulse-balance-${activeStep}`} />}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft truncate">
                  {SAMPLE_METRICS.balance.label}
                </span>
                <WalletCards className="w-3.5 h-3.5 text-info flex-shrink-0" />
              </div>
              <p className="font-mono tabular-nums text-sm sm:text-base font-bold text-info truncate">
                {formatLKR(SAMPLE_METRICS.balance.amount)}
              </p>
              <p className="text-[11px] text-ink-soft truncate mt-0.5">
                {SAMPLE_METRICS.balance.change}
              </p>
            </div>

            {/* Monthly Budget Card (Step 2 highlight) */}
            <div
              className={`bg-card border border-line rounded-xl p-2.5 sm:p-3 ${getRegionClass(
                isBudgetCardHighlighted
              )}`}
            >
              {isBudgetCardHighlighted && <HighlightPulse activeKey={`pulse-budget-card-${activeStep}`} />}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft truncate">
                  {SAMPLE_METRICS.monthlyBudget.label}
                </span>
                <Target className="w-3.5 h-3.5 text-warn flex-shrink-0" />
              </div>
              <p className="font-mono tabular-nums text-sm sm:text-base font-bold text-warn truncate">
                {formatLKR(SAMPLE_METRICS.monthlyBudget.amount)}
              </p>
              <p className="text-[11px] text-ink-soft truncate mt-0.5">
                {SAMPLE_METRICS.monthlyBudget.change}
              </p>
            </div>

          </div>

          {/* 3. Main Body: 12-col widescreen split on sm+ (Left 7-col, Right 5-col) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
            
            {/* LEFT COLUMN: Chart + Budget Panel (col-span-7) */}
            <div className="sm:col-span-7 flex flex-col gap-2.5 sm:gap-3">
              
              {/* Chart Panel (Step 3 highlight) */}
              <div
                className={`bg-card border border-line rounded-xl p-2.5 sm:p-3 flex flex-col justify-between ${getRegionClass(
                  isChartHighlighted
                )}`}
              >
                {isChartHighlighted && <HighlightPulse activeKey={`pulse-chart-${activeStep}`} />}
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-ink">Income vs expenses</span>
                  
                  {/* Accessible Legend with Shapes & Text */}
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-ink-body font-medium">
                      <span className="w-2 h-2 rounded-xs bg-income" />
                      <span>Income (+)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-body font-medium">
                      <span className="w-2 h-2 rounded-full bg-expense" />
                      <span>Expenses (-)</span>
                    </div>
                  </div>
                </div>

                {/* Chart Area with Horizontal Guide Lines */}
                <div className="h-36 sm:h-40 pt-1 border-b border-line pb-1 relative">
                  <div className="absolute top-4 left-0 right-0 border-b border-line/40 border-dashed pointer-events-none" />
                  <div className="absolute top-18 left-0 right-0 border-b border-line/40 border-dashed pointer-events-none" />

                  <div className="relative z-10 h-full flex items-end justify-between gap-1 sm:gap-1.5">
                    {SAMPLE_CHART_DATA.map((item, index) => {
                      const maxVal = 270000;
                      const incHeight = `${Math.round((item.income / maxVal) * 100)}%`;
                      const expHeight = `${Math.round((item.expense / maxVal) * 100)}%`;

                      return (
                        <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end">
                          <div className="w-full max-w-[36px] sm:max-w-[42px] h-full flex items-end justify-center gap-1 pb-1 rounded-md bg-cream/40 dark:bg-card/40 border border-line/30 px-0.5">
                            <div
                              key={`bar-inc-${hasEnteredView ? 'v' : 'i'}-${activeStep === 2 ? 'act' : 'idl'}-${index}`}
                              style={{ height: incHeight }}
                              className="w-2 sm:w-2.5 bg-income rounded-t-md animate-bar-grow motion-reduce:animate-none"
                            />
                            <div
                              key={`bar-exp-${hasEnteredView ? 'v' : 'i'}-${activeStep === 2 ? 'act' : 'idl'}-${index}`}
                              style={{ height: expHeight }}
                              className="w-2 sm:w-2.5 bg-expense rounded-t-md animate-bar-grow motion-reduce:animate-none"
                            />
                          </div>
                          <span className="font-mono text-[11px] text-ink-soft mt-1">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Budget Panel directly underneath (Step 2 highlight) */}
              <div
                className={`bg-card border border-line rounded-xl p-2.5 sm:p-3 ${getRegionClass(
                  isBudgetPanelHighlighted
                )}`}
              >
                {isBudgetPanelHighlighted && <HighlightPulse activeKey={`pulse-budget-panel-${activeStep}`} />}
                
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-bold text-ink">
                    Budget consumption ({SAMPLE_BUDGET.percentage}% used)
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warn/15 text-warn border border-warn/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-warn" />
                    <span>{SAMPLE_BUDGET.status}</span>
                  </span>
                </div>

                {/* 8px Amber Progress Bar at 80.5% */}
                <div className="relative w-full bg-cream-band dark:bg-line/40 h-2 rounded-full overflow-hidden p-0.5 border border-line/70 shadow-inner">
                  <div
                    key={`budget-bar-${hasEnteredView ? 'v' : 'i'}-${activeStep === 1 ? 'act' : 'idl'}`}
                    className="h-full bg-warn rounded-full animate-budget-fill motion-reduce:animate-none motion-reduce:w-[80.5%]"
                  />
                </div>

                {/* Micro info row */}
                <div className="flex justify-between items-center text-[11px] text-ink-soft font-mono mt-1.5">
                  <span>Spent: {formatLKR(SAMPLE_BUDGET.spent)}</span>
                  <span>Remaining: {formatLKR(SAMPLE_BUDGET.remaining)}</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Recent Transactions Panel (col-span-5) */}
            <div className="sm:col-span-5">
              <div
                className={`bg-card border border-line rounded-xl h-full flex flex-col justify-between overflow-hidden ${getRegionClass(
                  isTransactionsHighlighted
                )}`}
              >
                {isTransactionsHighlighted && <HighlightPulse activeKey={`pulse-transactions-${activeStep}`} />}
                
                {/* Header */}
                <div className="p-2 sm:p-2.5 bg-cream/60 dark:bg-card border-b border-line flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Recent transactions</span>
                  <span className="text-[11px] font-mono text-brand bg-brand-soft px-2 py-0.5 rounded-full border border-brand/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    <span>Real-time ledger</span>
                  </span>
                </div>

                {/* Dense Rows (divide-y divide-line py-1.5 px-2.5) */}
                <div className="divide-y divide-line flex-1 flex flex-col justify-around">
                  
                  {/* Row 1: Client UI project */}
                  <div className="py-2 px-2.5 flex items-center justify-between gap-2 hover:bg-cream/40 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-income/10 border border-income/20 text-income flex items-center justify-center flex-shrink-0">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink truncate leading-tight">
                          Client UI project
                        </p>
                        <p className="text-[11px] text-ink-soft truncate mt-0.5">
                          Today · Direct deposit
                        </p>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums text-xs font-bold text-income flex-shrink-0 text-right">
                      +Rs. 45,000
                    </span>
                  </div>

                  {/* Row 2: Supermarket groceries (Step 1 extra animations) */}
                  <div
                    key={`groceries-row-${activeStep === 0 ? 'act' : 'idl'}`}
                    className={`py-2 px-2.5 flex items-center justify-between gap-2 hover:bg-cream/40 transition-colors ${
                      activeStep === 0 ? 'animate-groceries-slide motion-reduce:animate-none' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-expense/10 border border-expense/20 text-expense flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink truncate leading-tight">
                          Supermarket groceries
                        </p>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 lg:gap-1.5 min-w-0 mt-0.5">
                          <span className="text-[11px] text-ink-soft truncate">Today · Debit card</span>
                          <span
                            key={`food-chip-${activeStep === 0 ? 'act' : 'idl'}`}
                            className={`inline-flex items-center text-[11px] font-semibold bg-brand-soft text-brand-dark px-1.5 py-0.2 rounded-full border border-brand/20 self-start lg:self-auto flex-shrink-0 ${
                              activeStep === 0 ? 'animate-chip-pop motion-reduce:animate-none' : ''
                            }`}
                          >
                            Auto-tagged: Food
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums text-xs font-bold text-expense flex-shrink-0 text-right">
                      -Rs. 12,450
                    </span>
                  </div>

                  {/* Row 3: Internet and electricity */}
                  <div className="py-2 px-2.5 flex items-center justify-between gap-2 hover:bg-cream/40 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-expense/10 border border-expense/20 text-expense flex items-center justify-center flex-shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink truncate leading-tight">
                          Internet and electricity
                        </p>
                        <p className="text-[11px] text-ink-soft truncate mt-0.5">
                          Yesterday · Utility bill
                        </p>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums text-xs font-bold text-expense flex-shrink-0 text-right">
                      -Rs. 8,900
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 4. Floating Card (Outer bottom-right edge, hidden below sm) */}
      <div
        className="hidden sm:block absolute -bottom-5 -right-3 lg:-right-6 z-20 bg-card/80 backdrop-blur-md border border-line rounded-2xl shadow-xl p-3 w-56 sm:w-60 animate-mockup-float motion-reduce:animate-none motion-reduce:transform-none"
        aria-hidden="true"
      >
        <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1">
          <span className="flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-income" />
            <span>{SAMPLE_FLOATING_CARD.category}</span>
          </span>
          <span className="text-income font-bold text-[11px] bg-income/10 px-2 py-0.5 rounded-full border border-income/20">
            {SAMPLE_FLOATING_CARD.percentage}% used
          </span>
        </div>
        
        <div className="w-full bg-cream-band dark:bg-line/40 h-1.5 rounded-full overflow-hidden mt-1.5">
          <div className="bg-income h-full rounded-full w-[68%]" />
        </div>
        
        <div className="flex justify-between items-center text-[11px] text-ink-soft mt-1.5 font-mono">
          <span>Rs. 13,600 spent</span>
          <span>of Rs. 20,000</span>
        </div>
      </div>

      {/* Tiny caption below frame */}
      <p className="text-xs text-ink-soft text-center mt-3" aria-hidden="true">
        Sample data for illustration
      </p>
    </div>
  );
};

export default DashboardMockup;
