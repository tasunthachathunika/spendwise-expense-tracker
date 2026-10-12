import React, { useState } from 'react';
import { CheckCircle2, Sliders, AlertCircle } from 'lucide-react';

const benefits = [
  'Categorised spending caps that reflect your lifestyle priorities',
  'Real-time calculation that updates every time a transaction is saved',
  'Color-coded threshold alerts before you cross your safety margins',
  'Automated carry-forward tracking for clean month-to-month resets',
];

const BudgetSystem = () => {
  const [spent, setSpent] = useState(68000);
  const totalBudget = 100000;

  // Calculate percentage and status
  const percentage = Math.min(Math.round((spent / totalBudget) * 100), 120);

  let barColor = 'bg-income';
  let statusText = 'On track';
  let statusBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';

  if (percentage >= 90) {
    barColor = 'bg-expense';
    statusText = 'Over budget';
    statusBadgeClass = 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';
  } else if (percentage >= 70) {
    barColor = 'bg-warn';
    statusText = 'Getting close';
    statusBadgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
  }

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setSpent(val);
    }
  };

  return (
    <section id="budgets" className="py-20 lg:py-28 bg-cream-band dark:bg-[#111827] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Benefits & Copy */}
          <div>
            <div className="uppercase tracking-widest text-xs font-semibold text-brand mb-3">
              Budget system
            </div>
            <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink tracking-tight">
              Stay in control of every month
            </h2>
            <p className="mt-4 text-ink-body text-lg leading-relaxed">
              SpendWise treats your monthly budget as an active guardrail, giving you peace of mind before you spend rather than regret at the end of the month.
            </p>

            <div className="mt-8 space-y-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-income flex-shrink-0 mt-0.5 stroke-[2.5]" />
                  <span className="text-ink-body text-sm leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Live Budget Simulator */}
          <div className="bg-white dark:bg-bg-card border border-line rounded-2xl p-7 sm:p-9 shadow-xl">
            <div className="flex items-center justify-between pb-5 border-b border-line">
              <div>
                <span className="text-xs uppercase font-semibold text-ink-soft">Interactive Demo</span>
                <div className="font-serif font-bold text-xl text-ink mt-0.5">Monthly budget simulator</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass}`}>
                {statusText}
              </span>
            </div>

            {/* Numbers */}
            <div className="mt-6 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-ink-soft">Amount spent</span>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-ink">
                  Rs. {spent.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-ink-soft">Monthly limit</span>
                <div className="font-serif font-bold text-xl text-ink-soft">
                  Rs. {totalBudget.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-cream dark:bg-[#111827] rounded-full h-3.5 overflow-hidden">
                <div
                  className={`${barColor} h-full rounded-full transition-all duration-200`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-ink-soft mt-2">
                <span>{percentage}% allocated</span>
                <span>
                  {spent <= totalBudget
                    ? `Rs. ${(totalBudget - spent).toLocaleString()} remaining`
                    : `Rs. ${(spent - totalBudget).toLocaleString()} exceeded`}
                </span>
              </div>
            </div>

            {/* Range Slider Control */}
            <div className="mt-8 pt-6 border-t border-line">
              <div className="flex items-center justify-between text-xs font-semibold text-ink mb-2">
                <label htmlFor="budget-slider" className="flex items-center gap-1.5 cursor-pointer">
                  <Sliders className="w-4 h-4 text-brand" />
                  <span>Try it: amount spent</span>
                </label>
                <span className="text-brand font-mono font-bold">Rs. {spent.toLocaleString()}</span>
              </div>
              <input
                id="budget-slider"
                type="range"
                min="0"
                max="120000"
                step="1000"
                value={spent}
                onChange={handleSliderChange}
                className="w-full accent-[#ea580c] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-soft mt-1">
                <span>Rs. 0</span>
                <span>Rs. 60,000</span>
                <span>Rs. 120,000</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BudgetSystem;
