import React from 'react';
import { CheckCircle2, TrendingUp, TrendingDown, Wallet, Target, Sparkles } from 'lucide-react';

const ProductPreview = () => {
  return (
    <section className="py-20 lg:py-28 bg-cream-band dark:bg-[#111827]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="uppercase tracking-widest text-xs font-semibold text-brand mb-3">
            See it in action
          </div>
          <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink tracking-tight">
            A dashboard that makes sense at a glance
          </h2>
          <p className="mt-4 text-ink-soft text-lg max-w-2xl mx-auto">
            Clean visual feedback so you never have to guess your financial standing.
          </p>
        </div>

        {/* Browser Frame Mockup */}
        <div className="relative max-w-5xl mx-auto text-left">
          
          <div className="bg-white dark:bg-bg-card border border-line rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Browser Top Window Bar */}
            <div className="bg-cream dark:bg-[#161f30] px-4 py-3 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-ink-soft font-mono ml-3 px-3 py-0.5 rounded-full bg-white/70 dark:bg-bg-card/70 border border-line/70 hidden sm:inline">
                  spendwise.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span className="font-mono text-[11px] uppercase">Live Overview</span>
              </div>
            </div>

            {/* Simulated Desktop Dashboard Body */}
            <div className="p-6 sm:p-8 space-y-6 bg-cream/30 dark:bg-bg-card">
              
              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white dark:bg-[#161f30] p-4 rounded-xl border border-line shadow-sm">
                  <div className="flex justify-between items-center text-xs text-ink-soft uppercase font-semibold">
                    <span>Income</span>
                    <TrendingUp className="w-4 h-4 text-income" />
                  </div>
                  <div className="font-serif font-bold text-xl sm:text-2xl text-income mt-2">
                    +Rs. 185,000
                  </div>
                  <div className="text-[11px] text-ink-soft mt-1">October 2026</div>
                </div>

                <div className="bg-white dark:bg-[#161f30] p-4 rounded-xl border border-line shadow-sm">
                  <div className="flex justify-between items-center text-xs text-ink-soft uppercase font-semibold">
                    <span>Expenses</span>
                    <TrendingDown className="w-4 h-4 text-expense" />
                  </div>
                  <div className="font-serif font-bold text-xl sm:text-2xl text-expense mt-2">
                    -Rs. 68,450
                  </div>
                  <div className="text-[11px] text-ink-soft mt-1">42 transactions</div>
                </div>

                <div className="bg-white dark:bg-[#161f30] p-4 rounded-xl border border-line shadow-sm">
                  <div className="flex justify-between items-center text-xs text-ink-soft uppercase font-semibold">
                    <span>Net Balance</span>
                    <Wallet className="w-4 h-4 text-brand" />
                  </div>
                  <div className="font-serif font-bold text-xl sm:text-2xl text-ink mt-2">
                    Rs. 116,550
                  </div>
                  <div className="text-[11px] text-income font-semibold mt-1">63% savings rate</div>
                </div>

                <div className="bg-white dark:bg-[#161f30] p-4 rounded-xl border border-line shadow-sm">
                  <div className="flex justify-between items-center text-xs text-ink-soft uppercase font-semibold">
                    <span>Monthly Budget</span>
                    <Target className="w-4 h-4 text-warn" />
                  </div>
                  <div className="font-serif font-bold text-xl sm:text-2xl text-ink mt-2">
                    Rs. 100,000
                  </div>
                  <div className="text-[11px] text-warn font-semibold mt-1">68% allocated</div>
                </div>

              </div>

              {/* Progress Bar & Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Budget Health Bar (2 cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#161f30] p-5 rounded-xl border border-line shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-serif font-bold text-sm text-ink">Total Monthly Budget Status</span>
                    <span className="text-xs font-bold text-income">On Track (Rs. 31,550 Remaining)</span>
                  </div>
                  <div className="w-full bg-cream dark:bg-[#111827] rounded-full h-3 overflow-hidden">
                    <div className="bg-income h-full rounded-full w-[68%]" />
                  </div>
                  
                  {/* Mini Recent Transactions */}
                  <div className="mt-5 space-y-2">
                    <div className="text-xs font-semibold text-ink-soft uppercase">Recent Transactions</div>
                    <div className="divide-y divide-line/60 text-xs">
                      <div className="py-2 flex justify-between items-center">
                        <span className="font-medium text-ink">Keells Supermarket Groceries</span>
                        <span className="font-bold text-expense">-Rs. 6,850</span>
                      </div>
                      <div className="py-2 flex justify-between items-center">
                        <span className="font-medium text-ink">Web Development Project Milestone</span>
                        <span className="font-bold text-income">+Rs. 75,000</span>
                      </div>
                      <div className="py-2 flex justify-between items-center">
                        <span className="font-medium text-ink">Colombo Cafe & Coffee</span>
                        <span className="font-bold text-expense">-Rs. 1,450</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown (1 col) */}
                <div className="bg-white dark:bg-[#161f30] p-5 rounded-xl border border-line shadow-sm flex flex-col justify-between">
                  <div className="font-serif font-bold text-sm text-ink mb-3">Top Expenses</div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-ink-soft mb-1">
                        <span>Housing & Utilities</span>
                        <span className="font-semibold text-ink">Rs. 35,000</span>
                      </div>
                      <div className="w-full bg-cream rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand h-full w-[50%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-ink-soft mb-1">
                        <span>Food & Dining</span>
                        <span className="font-semibold text-ink">Rs. 20,450</span>
                      </div>
                      <div className="w-full bg-cream rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-full w-[30%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-ink-soft mb-1">
                        <span>Transport</span>
                        <span className="font-semibold text-ink">Rs. 13,000</span>
                      </div>
                      <div className="w-full bg-cream rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-full w-[20%]" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Overlapping Mobile Frame Mockup (Hidden below md) */}
          <div className="hidden md:block absolute -right-6 -bottom-8 w-64 bg-white dark:bg-[#161f30] border-4 border-line dark:border-[#304163] rounded-3xl shadow-2xl p-4 animate-float">
            <div className="w-12 h-1 bg-line rounded-full mx-auto mb-3" />
            <div className="text-[10px] uppercase font-bold text-ink-soft">Mobile Wallet</div>
            <div className="font-serif font-bold text-lg text-ink mt-0.5">Rs. 116,550</div>
            <div className="mt-3 p-2 rounded-lg bg-cream dark:bg-[#111827] text-[10px] space-y-1">
              <div className="flex justify-between text-income font-semibold">
                <span>Income</span>
                <span>+Rs. 185,000</span>
              </div>
              <div className="flex justify-between text-expense font-semibold">
                <span>Expenses</span>
                <span>-Rs. 68,450</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3 Callouts Row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-ink">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-income stroke-[2.5]" />
            <span>Instant summary</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-income stroke-[2.5]" />
            <span>Category breakdown</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-income stroke-[2.5]" />
            <span>Budget alerts</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductPreview;
