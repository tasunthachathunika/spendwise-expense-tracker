import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { formatCurrency, getBudgetStatus } from '../../utils/helpers';

const BudgetProgress = ({
  budgetAmount = 0,
  spentAmount = 0,
  daysRemaining = 0,
  onSetBudget,
}) => {
  if (budgetAmount <= 0) {
    return (
      <div className="dash-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-ink">Monthly Budget Status</h2>
          <p className="text-xs text-ink-soft mt-0.5">
            You haven't established a spending budget limit for this month yet.
          </p>
        </div>
        {onSetBudget && (
          <button
            onClick={onSetBudget}
            className="px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/30 rounded-xl text-xs font-semibold transition flex-shrink-0 cursor-pointer"
          >
            Set Monthly Budget
          </button>
        )}
      </div>
    );
  }

  const budgetStatus = getBudgetStatus(spentAmount, budgetAmount);
  const remainingLimit = budgetAmount - spentAmount;
  const percent = budgetStatus?.percent || 0;
  const fillWidth = Math.min(percent, 100);

  const statusColor = budgetStatus?.barColor || 'bg-brand';
  const badgeClass = budgetStatus?.isDanger
    ? 'bg-expense/10 text-expense border-expense/30'
    : budgetStatus?.isWarn
    ? 'bg-warn/10 text-warn border-warn/30'
    : 'bg-income/10 text-income border-income/30';
  const BadgeIcon = budgetStatus?.isDanger ? AlertOctagon : budgetStatus?.isWarn ? AlertTriangle : CheckCircle2;
  const badgeLabel = `● ${budgetStatus?.statusText} (${percent}%)`;
  const statusText = '0-70% On Track, 70-90% Warning, 90%+ Alert';

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
