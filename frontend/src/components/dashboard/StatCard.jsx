import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const StatCard = ({
  type = 'income',
  label,
  amount = 0,
  caption,
  subtitle,
  badgeText,
  badgePositive = true,
  budgetData = null,
  onSetBudget = null,
  delayIndex = 0,
}) => {
  const isZero = Number(amount) === 0;

  // Determine Modifier Class & Icons
  let modifierClass = 'kpi-income';
  let Icon = ArrowUpRight;
  let valueColorClass = 'text-income';
  let formattedValue = '';

  if (type === 'income') {
    modifierClass = 'kpi-income';
    Icon = ArrowUpRight;
    valueColorClass = isZero ? 'text-ink-soft' : 'text-income';
    formattedValue = `+${formatCurrency(amount)}`;
  } else if (type === 'expense') {
    modifierClass = 'kpi-expense';
    Icon = ArrowDownRight;
    valueColorClass = isZero ? 'text-ink-soft' : 'text-expense';
    formattedValue = `-${formatCurrency(amount)}`;
  } else if (type === 'balance') {
    const isNegative = Number(amount) < 0;
    modifierClass = isNegative ? 'kpi-expense' : 'kpi-balance';
    Icon = Wallet;
    valueColorClass = isNegative ? 'text-expense' : isZero ? 'text-ink-soft' : 'text-ink';
    formattedValue = formatCurrency(amount);
  } else if (type === 'budget') {
    const hasBudget = Number(amount) > 0;
    const percent = budgetData?.percent || 0;
    if (!hasBudget) {
      modifierClass = 'kpi-budget-warn';
      valueColorClass = 'text-ink-soft';
    } else if (percent >= 90) {
      modifierClass = 'kpi-budget-danger';
      valueColorClass = 'text-ink';
    } else if (percent >= 70) {
      modifierClass = 'kpi-budget-warn';
      valueColorClass = 'text-ink';
    } else {
      modifierClass = 'kpi-budget-ok';
      valueColorClass = 'text-ink';
    }
    Icon = Target;
    formattedValue = hasBudget ? formatCurrency(amount) : 'Not Set';
  }

  // Derive Sub-Line Status Chip & Truthful Caption
  let ChipIcon = ArrowUpRight;
  let chipText = badgeText || '';
  let chipClass = 'bg-income/12 text-income border-income/25';
  let displayCaption = caption || subtitle || '';

  if (type === 'income') {
    ChipIcon = ArrowUpRight;
    chipText = 'Credited';
    chipClass = 'bg-income/12 text-income border-income/25';
  } else if (type === 'expense') {
    ChipIcon = ArrowDownRight;
    chipText = 'Debited';
    chipClass = 'bg-expense/12 text-expense border-expense/25';
  } else if (type === 'balance') {
    const num = Number(amount);
    if (num > 0) {
      ChipIcon = TrendingUp;
      chipText = 'Surplus';
      chipClass = 'bg-income/12 text-income border-income/25';
    } else if (num < 0) {
      ChipIcon = TrendingDown;
      chipText = 'Deficit';
      chipClass = 'bg-expense/12 text-expense border-expense/25';
    } else {
      ChipIcon = Minus;
      chipText = isZero ? 'No activity' : 'Break-even';
      chipClass = 'bg-cream-band text-ink-soft border-line';
    }
  } else if (type === 'budget') {
    const hasBudget = Number(amount) > 0;
    const percent = budgetData?.percent || 0;
    if (!hasBudget) {
      ChipIcon = Minus;
      chipText = 'Not set';
      chipClass = 'bg-cream-band text-ink-soft border-line';
    } else if (percent >= 90) {
      ChipIcon = AlertOctagon;
      chipText = `${percent}% Over`;
      chipClass = 'bg-expense/12 text-expense border-expense/25';
    } else if (percent >= 70) {
      ChipIcon = AlertTriangle;
      chipText = `${percent}% Warn`;
      chipClass = 'bg-warn/12 text-warn border-warn/25';
    } else {
      ChipIcon = CheckCircle2;
      chipText = `${percent}% OK`;
      chipClass = 'bg-income/12 text-income border-income/25';
    }
  }

  const hasBudget = type === 'budget' && Number(amount) > 0;
  const budgetPercent = budgetData?.percent || 0;
  const clampedBudgetBar = Math.min(budgetPercent, 100);

  return (
    <div
      className={`kpi-card ${modifierClass} animate-dash-fade flex flex-col justify-between`}
      style={{ animationDelay: `${delayIndex * 60}ms` }}
    >
      <div className="relative z-10">
        {/* Top Row: Label & Themed Icon Tile */}
        <div className="flex items-center justify-between gap-2.5 mb-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-ink-soft uppercase tracking-wider truncate">
            {label}
          </span>
          <div className="kpi-icon-tile shadow-2xs">
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>

        {/* Primary Metric Value (Inter 700, Tabular-Nums, Never Monospace) */}
        <div className="mt-0.5">
          <h3
            className={`text-[22px] sm:text-[24px] lg:text-[26px] font-bold font-sans tracking-tight leading-none tabular-nums truncate ${valueColorClass}`}
            title={formattedValue}
          >
            {formattedValue}
          </h3>
        </div>

        {/* Mini 6px Progress Bar for Budget Card */}
        {hasBudget && (
          <div className="w-full bg-cream-band h-1.5 rounded-full overflow-hidden mt-2 border border-line/60 p-px">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent >= 90
                  ? 'bg-expense'
                  : budgetPercent >= 70
                  ? 'bg-warn'
                  : 'bg-income'
              }`}
              style={{ width: `${clampedBudgetBar}%` }}
            />
          </div>
        )}
      </div>

      {/* Sub-line: Status Chip + Truthful Caption */}
      <div className="relative z-10 flex items-center flex-wrap gap-1.5 pt-2 mt-2 border-t border-line/40 text-[11px] sm:text-xs">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${chipClass}`}
        >
          <ChipIcon className="w-3 h-3 flex-shrink-0" />
          <span>{chipText}</span>
        </span>

        {displayCaption && (
          <span className="text-ink-soft truncate font-medium" title={displayCaption}>
            {displayCaption}
          </span>
        )}

        {type === 'budget' && Number(amount) <= 0 && onSetBudget && (
          <button
            type="button"
            onClick={onSetBudget}
            className="text-brand font-semibold hover:underline ml-auto cursor-pointer"
          >
            Set budget
          </button>
        )}
      </div>
    </div>
  );
};

export default StatCard;
