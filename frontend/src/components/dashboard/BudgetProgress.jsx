import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Info,
  Target,
} from 'lucide-react';
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
  // Empty State: No Budget Configured
  if (budgetAmount <= 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-brand/40 bg-brand/[0.04] dark:bg-brand/[0.08] p-6 lg:p-7 transition-all duration-250 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-dash-fade">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand/12 border border-brand/25 text-brand flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Target className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-ink tracking-tight">
              {periodLabel ? `Budget Status: ${periodLabel}` : 'Monthly Budget Status'}
            </h2>
            <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">
              Establish a spending target to monitor cash outflow and receive proactive threshold alerts.
            </p>
            {periodNote && (
              <p className="text-xs text-info font-medium mt-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{periodNote}</span>
              </p>
            )}
          </div>
        </div>

        {onSetBudget && (
          <button
            type="button"
            onClick={onSetBudget}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-semibold transition shadow-sm flex-shrink-0 cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Set Monthly Budget</span>
          </button>
        )}
      </div>
    );
  }

  // Active State: Budget Established
  const status = getBudgetStatus(spentAmount, budgetAmount) || {
    percent: 0,
    statusText: 'On track',
    badgeLabel: 'On track (0%)',
    barColor: 'bg-income',
    textColor: 'text-income',
    badgeClass: 'bg-income/10 text-income border-income/25',
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
  const titleDisplay = periodLabel ? `Budget: ${periodLabel}` : 'Monthly Budget Status';

  // Left accent bar color
  const accentBarColor = percent >= 90
    ? 'bg-expense'
    : percent >= 70
    ? 'bg-warn'
    : 'bg-income';

  return (
    <div className="dash-card relative overflow-hidden pl-6 sm:pl-7 p-6 lg:p-7 shadow-xs animate-dash-fade">
      {/* 4px Status-Coloured Left Accent Bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${accentBarColor} transition-colors duration-500`}
      />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-ink tracking-tight">
              {titleDisplay}
            </h2>
            {periodType === 'custom' && (
              <span className="text-[11px] font-sans font-semibold bg-info/10 text-info border border-info/20 px-2.5 py-0.5 rounded-full">
                Custom Period
              </span>
            )}
          </div>
          {periodNote ? (
            <p className="text-xs text-info font-medium mt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{periodNote}</span>
            </p>
          ) : (
            <p className="text-xs text-ink-soft mt-0.5">
              Proactive threshold monitoring: 70% warning, 90% critical limit.
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${status.badgeClass}`}
          >
            <BadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {status.statusText} ({percent}%)
            </span>
          </span>
        </div>
      </div>

      {/* 10px Progress Bar with Threshold Tick Markers */}
      <div className="relative w-full bg-cream-band h-2.5 rounded-full overflow-hidden p-0.5 border border-line my-4">
        {/* Threshold Tick Marker at 70% */}
        <div
          className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-ink-soft/40 z-10 pointer-events-none"
          title="70% Warning Threshold"
        />
        {/* Threshold Tick Marker at 90% */}
        <div
          className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-expense/60 z-10 pointer-events-none"
          title="90% Critical Threshold"
        />

        {/* Animated Bar Fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 shadow-2xs ${status.barColor}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>

      {/* Budget Stat Columns (Tabular-Nums, Never Monospace) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-line/60 text-xs">
        <div>
          <span className="text-ink-soft block font-medium uppercase tracking-wider text-[11px]">
            Budget Set
          </span>
          <span className="font-sans font-bold text-ink text-base tabular-nums mt-0.5 block truncate">
            {formatLKR(budgetAmount)}
          </span>
        </div>

        <div>
          <span className="text-ink-soft block font-medium uppercase tracking-wider text-[11px]">
            Spent to Date
          </span>
          <span className="font-sans font-bold text-expense text-base tabular-nums mt-0.5 block truncate">
            -{formatLKR(spentAmount)}
          </span>
        </div>

        <div>
          <span className="text-ink-soft block font-medium uppercase tracking-wider text-[11px]">
            Remaining Limit
          </span>
          <span
            className={`font-sans font-bold text-base tabular-nums mt-0.5 block truncate ${
              remainingLimit < 0 ? 'text-expense' : 'text-income'
            }`}
          >
            {remainingLimit < 0
              ? `-${formatLKR(Math.abs(remainingLimit))}`
              : formatLKR(remainingLimit)}
          </span>
        </div>

        <div>
          <span className="text-ink-soft block font-medium uppercase tracking-wider text-[11px]">
            Time Remaining
          </span>
          <span className="font-sans font-bold text-ink text-base tabular-nums mt-0.5 block truncate">
            {daysRemaining !== undefined && daysRemaining !== null
              ? daysRemaining === 0
                ? 'Period Ended'
                : `${daysRemaining} Days`
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;
