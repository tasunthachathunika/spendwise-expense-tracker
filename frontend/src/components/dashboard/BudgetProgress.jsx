import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, Info } from 'lucide-react';
import { formatLKR, getBudgetStatus } from '../../utils/helpers';

const BudgetProgress = ({
  budgetAmount = 0,
  spentAmount = 0,
  daysRemaining = 0,
  periodLabel = null,
  periodType = null,
  periodNote = null,
  onSetBudget,
}) => {
  if (budgetAmount <= 0) {
    return (
      <div className="bg-bg-card border border-line rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-ink">
            {periodLabel ? `Budget Status: ${periodLabel}` : 'Monthly Budget Status'}
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            You haven't established a spending budget limit for this period yet.
          </p>
          {periodNote && (
            <p className="text-xs text-info mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>{periodNote}</span>
            </p>
          )}
        </div>
        {onSetBudget && (
          <button
            onClick={onSetBudget}
            className="px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/30 rounded-xl text-xs font-semibold transition flex-shrink-0 cursor-pointer"
          >
            Set Budget
          </button>
        )}
      </div>
    );
  }

  // Determine threshold states using unified getBudgetStatus helper
  const status = getBudgetStatus(spentAmount, budgetAmount) || {
    percent: 0,
    statusText: '0-70% On Track, 70-90% Warning, 90%+ Alert',
    badgeLabel: 'On Track (0%)',
    barColor: 'bg-brand shadow-brand/30',
    textColor: 'text-income',
    badgeClass: 'bg-brand/10 text-brand border-brand/30',
    isOverBudget: false,
  };

  const remainingLimit = budgetAmount - spentAmount;
  const isOverBudget = spentAmount > budgetAmount;
  const percent = status.percent;

  const BadgeIcon = isOverBudget || percent >= 90
    ? AlertOctagon
    : percent >= 70
    ? AlertTriangle
    : CheckCircle2;

  const fillWidth = Math.min(percent, 100);
  const titleDisplay = periodLabel
    ? `Budget: ${periodLabel}`
    : `Monthly Budget Status`;

  return (
    <div className="bg-bg-card border border-line rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-ink">
              {titleDisplay}
            </h2>
            <span className="text-xs font-semibold text-ink-soft font-mono">
              ({percent}% Used)
            </span>
            {periodType === 'custom' && (
              <span className="text-[11px] bg-info/10 text-info border border-info/20 font-bold px-2 py-0.5 rounded-full">
                Custom Period
              </span>
            )}
          </div>
          {periodNote ? (
            <p className="text-xs text-info font-medium mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{periodNote}</span>
            </p>
          ) : (
            <p className="text-xs text-ink-soft mt-0.5">
              Threshold Rules: 0-70% On Track, 70-90% Warning, 90%+ Alert
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${status.badgeClass}`}>
            <BadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{status.statusText}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-bg-primary h-3.5 rounded-full overflow-hidden p-0.5 border border-line">
        <div
          className={`h-full rounded-full transition-all duration-700 shadow-sm ${status.barColor}`}
          style={{ width: `${fillWidth}%` }}
        ></div>
      </div>

      {/* Budget Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-line text-xs">
        <div>
          <span className="text-ink-soft block font-medium">Budget Set</span>
          <span className="font-mono font-bold text-ink text-sm">
            {formatLKR(budgetAmount)}
          </span>
        </div>
        <div>
          <span className="text-ink-soft block font-medium">Spent to Date</span>
          <span className="font-mono font-bold text-expense text-sm">
            -{formatLKR(spentAmount)}
          </span>
        </div>
        <div>
          <span className="text-ink-soft block font-medium">Remaining Limit</span>
          <span className={`font-mono font-bold text-sm ${remainingLimit < 0 ? 'text-expense' : 'text-income'}`}>
            {remainingLimit < 0 ? `-${formatLKR(Math.abs(remainingLimit))}` : formatLKR(remainingLimit)}
          </span>
        </div>
        <div>
          <span className="text-ink-soft block font-medium">Days Remaining</span>
          <span className="font-mono font-bold text-ink text-sm">
            {daysRemaining !== undefined && daysRemaining !== null
              ? (daysRemaining === 0 ? 'Ended' : `${daysRemaining} Days`)
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;
