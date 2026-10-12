import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const BudgetProgress = ({
  budgetAmount = 180000,
  spentAmount = 145000,
  daysRemaining = 22,
}) => {
  // Calculate percentage
  const percent = budgetAmount > 0 
    ? Math.round((spentAmount / budgetAmount) * 1000) / 10 
    : 0;
  const isOverBudget = spentAmount > budgetAmount;
  const remainingLimit = budgetAmount - spentAmount;

  // Determine threshold states
  // 0% – 70%: Emerald (#10b981)
  // 70% – 90%: Amber Warning (#f59e0b)
  // 90%+ or Over budget: Rose Alert (#f43f5e)
  let statusColor = 'bg-brand shadow-brand/30';
  let badgeClass = 'bg-brand/10 text-brand border-brand/30';
  let badgeLabel = `● On Track (${percent}%)`;
  let statusText = '0-70% Emerald, 70-90% Amber Warning, 90%+ Rose Alert';
  let BadgeIcon = CheckCircle2;

  if (isOverBudget || percent >= 90) {
    statusColor = 'bg-expense shadow-expense/30';
    badgeClass = 'bg-expense/10 text-expense border-expense/30';
    badgeLabel = isOverBudget
      ? `● Critical: Over Budget (${percent}%)`
      : `● Alert: Nearing Limit (${percent}%)`;
    BadgeIcon = AlertOctagon;
  } else if (percent >= 70) {
    statusColor = 'bg-warn shadow-warn/30';
    badgeClass = 'bg-warn/10 text-warn border-warn/30';
    badgeLabel = `● Warning: Near Limit (${percent}%)`;
    BadgeIcon = AlertTriangle;
  }

  const fillWidth = Math.min(percent, 100);

  return (
    <div className="bg-bg-card border border-line rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-ink">
            Monthly Budget Status ({percent}% Used)
          </h2>
          <p className="text-xs text-ink-soft">Rule: {statusText}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${badgeClass}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badgeLabel}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-bg-primary h-3.5 rounded-full overflow-hidden p-0.5 border border-line">
        <div
          className={`h-full rounded-full transition-all duration-700 shadow-sm ${statusColor}`}
          style={{ width: `${fillWidth}%` }}
        ></div>
      </div>

      {/* Budget Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-line text-xs">
        <div>
          <span className="text-ink-muted block">Budget Set</span>
          <span className="font-mono font-bold text-ink text-sm">
            {formatCurrency(budgetAmount)}
          </span>
        </div>
        <div>
          <span className="text-ink-muted block">Spent to Date</span>
          <span className="font-mono font-bold text-expense text-sm">
            -{formatCurrency(spentAmount)}
          </span>
        </div>
        <div>
          <span className="text-ink-muted block">Remaining Limit</span>
          <span className={`font-mono font-bold text-sm ${remainingLimit < 0 ? 'text-expense' : 'text-income'}`}>
            {remainingLimit < 0 ? `-${formatCurrency(Math.abs(remainingLimit))}` : formatCurrency(remainingLimit)}
          </span>
        </div>
        <div>
          <span className="text-ink-muted block">Days Remaining</span>
          <span className="font-mono font-bold text-ink text-sm">
            {daysRemaining} Days
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;
