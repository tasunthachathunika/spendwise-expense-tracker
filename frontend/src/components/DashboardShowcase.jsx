import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  PieChart,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const DashboardShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: 0,
      title: 'Real-Time Cash Flow',
      subtitle: 'Income mathu expenses automated tracking.',
      icon: TrendingUp,
      accentColor: 'text-emerald-500 dark:text-emerald-400',
      tag: 'Automation',
    },
    {
      id: 1,
      title: 'Dynamic Budget Thresholds',
      subtitle: '70-90% warning range alli amber status bar display.',
      icon: AlertCircle,
      accentColor: 'text-amber-500 dark:text-amber-400',
      tag: 'Threshold Guard',
    },
    {
      id: 2,
      title: 'Instant Liquidity Calculations',
      subtitle: 'Net balance mathu surplus analysis.',
      icon: PieChart,
      accentColor: 'text-cyan-500 dark:text-cyan-400',
      tag: 'Surplus Analysis',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-cream-band/60 dark:bg-[#0e1422] border-t border-b border-line/70 dark:border-white/10 transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient Depth Glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-brand/10 dark:bg-brand/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 dark:bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/25 text-brand text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>LIVE PRODUCT PREVIEW</span>
          </div>

          <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink">
            See How SpendWise Operates in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-amber-600 to-emerald-600 dark:from-brand-light dark:via-amber-400 dark:to-emerald-400">
              Real-Time
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-ink-body max-w-2xl leading-relaxed">
            Effortlessly track transactions, monitor budget caps, and maintain positive cash flow.
          </p>
        </div>

        {/* 2-Column Responsive Layout: Left Steps + Right Floating Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ─── 1. EDAGADE VIBHAGA (LEFT SIDE - INTERACTIVE WORKFLOW & STEPS) ─── */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2">
              Select an engine capability to preview:
            </p>

            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isActive = activeTab === idx;

              return (
                <div
                  key={feature.id}
                  onClick={() => setActiveTab(idx)}
                  className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isActive
                      ? 'bg-card dark:bg-[#151c2d] border-brand/50 shadow-xl shadow-brand/10 ring-1 ring-brand/30 translate-x-1'
                      : 'bg-card/70 dark:bg-[#151c2d]/60 hover:bg-card dark:hover:bg-[#151c2d] border-line dark:border-white/10 hover:border-line-light dark:hover:border-white/20'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveTab(idx);
                    }
                  }}
                >
                  {/* Left Active Accent Pill Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-brand rounded-r-full" />
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive
                          ? 'bg-brand/15 dark:bg-brand/25 text-brand shadow-sm'
                          : 'bg-cream dark:bg-[#0b0f19] text-ink-soft group-hover:text-ink'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-base sm:text-lg text-ink group-hover:text-brand transition-colors">
                          {feature.title}
                        </h3>
                        {isActive ? (
                          <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                        ) : (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cream-band dark:bg-white/10 text-ink-soft">
                            {feature.tag}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs sm:text-sm text-ink-body leading-relaxed">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Action Hint */}
            <div className="pt-2 flex items-center gap-2 text-xs text-ink-soft">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive preview updates live on the right screen</span>
            </div>
          </div>

          {/* ─── 2. BALAGADE VIBHAGA (RIGHT SIDE - FLOATING DASHBOARD MOCKUP) ─── */}
          <div className="lg:col-span-7 relative">
            
            {/* Ambient Card Backlight */}
            <div className="absolute -inset-2 bg-gradient-to-r from-brand/20 via-amber-500/15 to-emerald-500/20 rounded-3xl blur-2xl opacity-80 -z-10" />

            {/* Glassmorphic Mockup Window */}
            <div className="relative bg-card/90 dark:bg-[#121827]/90 backdrop-blur-md border border-line dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
              
              {/* Mockup Window Header */}
              <div className="bg-cream-band/90 dark:bg-[#0b0f19]/90 px-4 sm:px-6 py-3.5 border-b border-line dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-expense/80" />
                  <div className="w-3 h-3 rounded-full bg-warn/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-ink-soft font-mono font-medium hidden sm:inline">
                    spendwise.app/dashboard • Emerald Wealth
                  </span>
                </div>

                {/* Right Live Date Badge */}
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-card dark:bg-[#151c2d] border border-line dark:border-white/10 text-[11px] font-mono font-bold text-ink">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  <span>OCTOBER 2026</span>
                </div>
              </div>

              {/* Mockup Body Content */}
              <div className="p-4 sm:p-6 lg:p-7 space-y-5 bg-card dark:bg-[#121827] text-left transition-all duration-300">
                
                {/* 4 Key Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  
                  {/* Card 1: Total Income */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      activeTab === 0
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : 'bg-cream/80 dark:bg-[#151c2d] border-line dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-ink-soft uppercase font-semibold">
                      <span>Total Income</span>
                      <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      +Rs. 250,000
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      +14.2% this month
                    </div>
                  </div>

                  {/* Card 2: Total Expenses */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      activeTab === 0
                        ? 'bg-red-500/10 dark:bg-red-500/15 border-red-500/50 shadow-md shadow-red-500/10 ring-1 ring-red-500/30'
                        : 'bg-cream/80 dark:bg-[#151c2d] border-line dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-ink-soft uppercase font-semibold">
                      <span>Total Expenses</span>
                      <span className="p-1 rounded-md bg-red-500/15 text-red-500">
                        <CreditCard className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-red-500">
                      -Rs. 145,000
                    </div>
                    <div className="text-[10px] text-ink-soft mt-1 font-medium">
                      Across 4 categories
                    </div>
                  </div>

                  {/* Card 3: Net Balance */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      activeTab === 2
                        ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'bg-cream/80 dark:bg-[#151c2d] border-line dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-ink-soft uppercase font-semibold">
                      <span>Net Balance</span>
                      <span className="p-1 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                        <PieChart className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-ink">
                      Rs. 105,000
                    </div>
                    <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1 font-bold">
                      42% saved surplus
                    </div>
                  </div>

                  {/* Card 4: Monthly Budget */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      activeTab === 2 || activeTab === 1
                        ? 'bg-brand/10 dark:bg-brand/15 border-brand/50 shadow-md shadow-brand/10 ring-1 ring-brand/30'
                        : 'bg-cream/80 dark:bg-[#151c2d] border-line dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-ink-soft uppercase font-semibold">
                      <span>Monthly Budget</span>
                      <span className="p-1 rounded-md bg-amber-500/15 text-amber-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="mt-2 text-lg sm:text-xl font-bold font-mono text-ink">
                      Rs. 180,000
                    </div>
                    <div className="text-[10px] text-brand mt-1 font-semibold">
                      Rs. 35,000 Remaining
                    </div>
                  </div>

                </div>

                {/* Progress Bar Container: Budget Consumption (80.5% Used) */}
                <div
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    activeTab === 1
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/30'
                      : 'bg-cream/80 dark:bg-[#151c2d] border-line dark:border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs sm:text-sm font-bold text-ink">
                      Budget Consumption (80.5% Used)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Amber Warning: Near Limit
                    </span>
                  </div>

                  {/* Dynamic Progress Bar filled with amber color */}
                  <div className="w-full bg-cream-band dark:bg-[#0b0f19] h-3 rounded-full overflow-hidden p-0.5 border border-line dark:border-white/10">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                      style={{ width: '80.5%' }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-ink-soft mt-1.5 font-mono">
                    <span>Safe threshold: 0 - 70%</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Current: 80.5% (Warning range: 70 - 90%)</span>
                    <span>Cap: 100%</span>
                  </div>
                </div>

                {/* Recent Transactions Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                    <span>Recent Transactions</span>
                    {activeTab === 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live Synced
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {/* Item 1 */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all duration-300 ${
                        activeTab === 0
                          ? 'bg-card dark:bg-[#151c2d] border-emerald-500/40 shadow-xs'
                          : 'bg-cream/60 dark:bg-[#151c2d]/70 border-line dark:border-white/10'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-ink truncate">Client UI Project</p>
                        <p className="text-[10px] text-ink-soft">Income Transfer</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        +Rs. 45,000
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all duration-300 ${
                        activeTab === 0
                          ? 'bg-card dark:bg-[#151c2d] border-red-500/40 shadow-xs'
                          : 'bg-cream/60 dark:bg-[#151c2d]/70 border-line dark:border-white/10'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-ink truncate">Supermarket Groceries</p>
                        <p className="text-[10px] text-ink-soft">Debit Card</p>
                      </div>
                      <span className="font-mono font-bold text-red-500 shrink-0">
                        -Rs. 12,450
                      </span>
                    </div>

                    {/* Item 3 */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all duration-300 ${
                        activeTab === 0
                          ? 'bg-card dark:bg-[#151c2d] border-red-500/40 shadow-xs'
                          : 'bg-cream/60 dark:bg-[#151c2d]/70 border-line dark:border-white/10'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-ink truncate">Internet & Electricity...</p>
                        <p className="text-[10px] text-ink-soft">Utility Bills</p>
                      </div>
                      <span className="font-mono font-bold text-red-500 shrink-0">
                        -Rs. 8,900
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Overlay Badge (Over lower right of mockup) */}
              <div
                className={`hidden sm:block absolute bottom-4 right-4 z-20 bg-card/95 dark:bg-[#151c2d]/95 backdrop-blur-md rounded-xl border border-line dark:border-white/15 shadow-xl p-3.5 w-60 text-left transition-all duration-300 ${
                  activeTab === 1
                    ? 'ring-2 ring-amber-500/60 shadow-amber-500/20 scale-105'
                    : 'hover:scale-102'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Monthly Budget
                  </span>
                  <span className="text-amber-500 font-bold">68% used</span>
                </div>
                <div className="w-full bg-cream-band dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full w-[68%]" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-ink-soft mt-2 font-mono">
                  <span>Rs. 68,000 spent</span>
                  <span>Rs. 100,000 limit</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default DashboardShowcase;
