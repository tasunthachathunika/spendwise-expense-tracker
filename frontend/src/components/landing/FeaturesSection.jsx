import React from 'react';
import {
  ArrowLeftRight,
  Tags,
  Search,
  Target,
  PieChart,
  Smartphone
} from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-cream dark:bg-[#0a0e17] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="uppercase tracking-widest text-xs font-semibold text-brand mb-3">
            Powerful features
          </div>
          <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink tracking-tight">
            Everything you need to manage your money
          </h2>
          <p className="mt-4 text-ink-soft text-lg max-w-2xl mx-auto">
            Practical tools built to eliminate financial anxiety and bring effortless clarity to every rupee.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Income and Expense Tracking (Wide card spanning 2 columns on lg) */}
          <div className="lg:col-span-2 bg-white dark:bg-bg-card border border-line rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-soft dark:bg-brand/15 text-brand flex items-center justify-center mb-5">
                <ArrowLeftRight className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink">
                Income and expense tracking
              </h3>
              <p className="mt-2 text-ink-body text-sm leading-relaxed max-w-lg">
                Log every paycheck, freelance gig, grocery bill, or dinner with description, category, and date in seconds.
              </p>
            </div>

            {/* Decorative mini transaction list built with clean divs */}
            <div className="mt-6 space-y-2.5 bg-cream dark:bg-[#111827] p-4 rounded-xl border border-line/60">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-income" />
                  <span className="font-medium text-ink">Freelance Client Payout</span>
                  <span className="text-[10px] text-ink-soft hidden sm:inline">• Work</span>
                </div>
                <span className="font-bold text-income">+Rs. 45,000</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-expense" />
                  <span className="font-medium text-ink">Supermarket Groceries</span>
                  <span className="text-[10px] text-ink-soft hidden sm:inline">• Food</span>
                </div>
                <span className="font-bold text-expense">-Rs. 8,420</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-expense" />
                  <span className="font-medium text-ink">Electricity & Water Utility</span>
                  <span className="text-[10px] text-ink-soft hidden sm:inline">• Bills</span>
                </div>
                <span className="font-bold text-expense">-Rs. 5,200</span>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Categories */}
          <div className="bg-white dark:bg-bg-card border border-line rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-soft dark:bg-brand/15 text-brand flex items-center justify-center mb-5">
                <Tags className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink">
                Smart categories
              </h3>
              <p className="mt-2 text-ink-body text-sm leading-relaxed">
                Color-coded categories for Rent, Food, Utilities, Transport, and Entertainment that automatically organise your money.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Food & Dining
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Housing
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Utilities
              </span>
            </div>
          </div>

          {/* Card 3: Search and Filters */}
          <div className="bg-white dark:bg-bg-card border border-line rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-soft dark:bg-brand/15 text-brand flex items-center justify-center mb-5">
                <Search className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink">
                Search and filters
              </h3>
              <p className="mt-2 text-ink-body text-sm leading-relaxed">
                Filter by date range, transaction type, or category. Instantly find any past payment with fuzzy title search.
              </p>
            </div>
            <div className="mt-6 p-2.5 bg-cream dark:bg-[#111827] rounded-xl border border-line text-xs text-ink-soft flex items-center justify-between">
              <span>Filter: Income only</span>
              <span className="text-brand font-semibold">October 2026</span>
            </div>
          </div>

          {/* Card 4: Monthly Budgets */}
          <div className="bg-white dark:bg-bg-card border border-line rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-soft dark:bg-brand/15 text-brand flex items-center justify-center mb-5">
                <Target className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink">
                Monthly budgets
              </h3>
              <p className="mt-2 text-ink-body text-sm leading-relaxed">
                Establish spending caps per category and receive visual alerts as spending nears threshold levels.
              </p>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-ink">Food Cap: Rs. 30,000</span>
                <span className="text-amber-600 font-bold">68% used</span>
              </div>
              <div className="w-full bg-cream dark:bg-[#111827] rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[68%]" />
              </div>
            </div>
          </div>

          {/* Card 5: Visual Charts */}
          <div className="bg-white dark:bg-bg-card border border-line rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-soft dark:bg-brand/15 text-brand flex items-center justify-center mb-5">
                <PieChart className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink">
                Visual charts
              </h3>
              <p className="mt-2 text-ink-body text-sm leading-relaxed">
                Gain instant clarity on your net margin through cash flow bar charts and category donut breakdowns.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 py-1 bg-cream dark:bg-[#111827] rounded-xl border border-line/60">
              {/* Mini inline SVG donut */}
              <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e9e1ca" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#ea580c" strokeWidth="4" strokeDasharray="50 100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#15803d" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-50" />
              </svg>
              {/* Mini bar indicators */}
              <div className="flex items-end gap-1.5 h-8">
                <div className="w-2.5 bg-income rounded-t h-7" />
                <div className="w-2.5 bg-expense rounded-t h-4" />
                <div className="w-2.5 bg-income rounded-t h-8" />
                <div className="w-2.5 bg-expense rounded-t h-5" />
              </div>
            </div>
          </div>

          {/* Card 6: Responsive on every device (Spans 1 on md, or 3 on lg if needed) */}
          <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-bg-card border border-line rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-soft dark:bg-brand/15 text-brand flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-ink">
                  Responsive on every screen
                </h3>
                <p className="mt-1 text-ink-body text-sm leading-relaxed max-w-xl">
                  Optimized for phone, tablet, and desktop viewports. Check balances on the go or analyze detailed financials at your desk.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold px-4 py-2 rounded-xl bg-cream dark:bg-[#111827] border border-line text-brand flex-shrink-0">
              Mobile + Tablet + Desktop
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
