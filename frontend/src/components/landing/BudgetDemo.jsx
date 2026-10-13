import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ShieldAlert, Check } from 'lucide-react';

const BUDGET_LIMIT = 100000;

const formatLKR = (val) => {
  return `Rs. ${new Intl.NumberFormat('en-LK').format(val)}`;
};

const BudgetDemo = () => {
  const [spent, setSpent] = useState(74000);

  const percentage = (spent / BUDGET_LIMIT) * 100;
  const clampedBarWidth = Math.min(percentage, 100);

  // Colour rules: 0 to 70% income, 70 to 90% warn, 90%+ expense
  let statusText = 'On track';
  let statusBadgeClass = 'bg-income/10 text-income border-income/30';
  let barColorClass = 'bg-income';

  if (percentage >= 90) {
    statusText = 'Over budget';
    statusBadgeClass = 'bg-expense/10 text-expense border-expense/30';
    barColorClass = 'bg-expense';
  } else if (percentage >= 70) {
    statusText = 'Getting close';
    statusBadgeClass = 'bg-warn/10 text-warn border-warn/30';
    barColorClass = 'bg-warn';
  }

  const remaining = BUDGET_LIMIT - spent;

  return (
    <section id="budgets" className="scroll-mt-24 py-20 lg:py-28 bg-cream-band border-t border-line/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Context & Benefits */}
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-brand block mb-3">
              Smart Thresholds
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-ink tracking-tight">
              Stay in control of every month
            </h2>
            <p className="mt-4 text-ink-body text-lg leading-relaxed">
              SpendWise protects you against month-end surprises. The 3-tier threshold warning system gives you continuous feedback without rigid restrictions.
            </p>

            {/* 4 Benefits with Check Icons */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-income/15 text-income flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <p className="text-ink text-sm sm:text-base">
                  <strong>0 – 70% Safe Zone:</strong> Emerald green indicator confirms you are well within target savings limits.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-warn/15 text-warn flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <p className="text-ink text-sm sm:text-base">
                  <strong>70 – 90% Caution Phase:</strong> Timely amber indicator alerts you when discretionary spending is rising fast.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-expense/15 text-expense flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <p className="text-ink text-sm sm:text-base">
                  <strong>90%+ Critical Alert:</strong> High-visibility warning so you can pause non-essential purchases before going negative.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand/15 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <p className="text-ink text-sm sm:text-base">
                  <strong>Dynamic Adjustment:</strong> Change budget thresholds month-by-month as your lifestyle or savings goals evolve.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Card & Live Slider */}
          <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-5 border-b border-line">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-ink-soft">
                  Monthly Target
                </p>
                <h3 className="font-serif text-2xl font-bold text-ink mt-0.5">
                  Monthly budget {formatLKR(BUDGET_LIMIT)}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${statusBadgeClass}`}
              >
                ● {statusText}
              </span>
            </div>

            {/* Spent vs Remaining Summary */}
            <div className="grid grid-cols-2 gap-4 py-6">
              <div>
                <span className="text-xs text-ink-soft block font-medium">Amount Spent</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-ink">
                  {formatLKR(spent)}
                </span>
                <span className="text-[11px] text-ink-soft block mt-0.5 font-mono">
                  {percentage.toFixed(1)}% of budget
                </span>
              </div>
              <div>
                <span className="text-xs text-ink-soft block font-medium">
                  {remaining >= 0 ? 'Remaining Surplus' : 'Over Limit By'}
                </span>
                <span
                  className={`font-mono text-xl sm:text-2xl font-bold ${
                    remaining >= 0 ? 'text-income' : 'text-expense'
                  }`}
                >
                  {formatLKR(Math.abs(remaining))}
                </span>
                <span className="text-[11px] text-ink-soft block mt-0.5 font-mono">
                  {remaining >= 0 ? 'Safe margin' : 'Deficit alert'}
                </span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-cream h-4 rounded-full overflow-hidden border border-line p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
                  style={{ width: `${clampedBarWidth}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-ink-soft font-mono">
                <span>0%</span>
                <span className="text-income">70% Safe</span>
                <span className="text-warn">90% Warning</span>
                <span className="text-expense">100%+</span>
              </div>
            </div>

            {/* Interactive Range Slider */}
            <div className="mt-8 pt-6 border-t border-line space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-ink">
                <label htmlFor="budget-slider" className="cursor-pointer">
                  Try it: amount spent
                </label>
                <span className="font-mono text-brand font-bold">{formatLKR(spent)}</span>
              </div>

              <input
                id="budget-slider"
                type="range"
                min="0"
                max="120000"
                step="1000"
                value={spent}
                onChange={(e) => setSpent(Number(e.target.value))}
                className="w-full h-2.5 bg-cream rounded-lg appearance-none cursor-pointer accent-brand border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              />

              <div className="flex justify-between text-[11px] text-ink-soft">
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

export default BudgetDemo;
