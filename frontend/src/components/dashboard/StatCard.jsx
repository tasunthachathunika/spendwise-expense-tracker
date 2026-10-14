import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency, getBudgetStatus } from '../../utils/helpers';
import useAnimatedNumber from '../../hooks/useAnimatedNumber';

// Sparkline Chart sub-component
const Sparkline = ({ data = [], colorVar = 'income', stroke = 'rgb(var(--income))' }) => {
  // If fewer than 2 points or all zeroes with no activity, omit sparkline
  if (!data || data.length < 2) return null;
  const hasSomeData = data.some((v) => Number(v) > 0 || Number(v) < 0);
  if (!hasSomeData) return null;

  const chartData = data.map((val, idx) => ({ idx, value: Number(val) || 0 }));
  const gradId = `sparkline-grad-${colorVar}`;

  return (
    <div className="w-24 h-9 sm:w-28 sm:h-10 flex-shrink-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            isAnimationActive={true}
            animationDuration={700}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Delta Chip Sub-component
const DeltaChip = ({ current = 0, previous = 0, hasPriorData = false, isExpense = false }) => {
  if (!hasPriorData || previous <= 0) {
    return (
      <span className="inline-flex items-center text-[11px] font-medium text-ink-soft bg-cream-band border border-line px-2 py-0.5 rounded-full">
        No prior data
      </span>
    );
  }

  const diff = current - previous;
  const percent = Math.abs(Math.round((diff / previous) * 100));
  const isUp = diff >= 0;

  // For expenses, an increase is bad (expense colour), a decrease is good (income colour).
  // For income/balance, an increase is good (income colour), a decrease is bad (expense colour).
  let chipClass = '';
  let Icon = isUp ? ArrowUpRight : ArrowDownRight;

  if (isExpense) {
    chipClass = isUp
      ? 'text-expense bg-expense/10 border-expense/20'
      : 'text-income bg-income/10 border-income/20';
  } else {
    chipClass = isUp
      ? 'text-income bg-income/10 border-income/20'
      : 'text-expense bg-expense/10 border-expense/20';
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold border px-2 py-0.5 rounded-full ${chipClass}`}
      title={`${diff >= 0 ? '+' : ''}${formatCurrency(diff)} vs last month`}
    >
      <Icon className="w-3 h-3 stroke-[2.5]" />
      <span>{percent}%</span>
      <span className="text-[10px] opacity-75 font-normal ml-0.5">vs last mo</span>
    </span>
  );
};

/**
 * Universal KPI Card component adhering to SpendWise tokens and SaaS reference layout.
 */
const StatCard = ({
  type = 'income',
  label,
  amount = 0,
  previousAmount = 0,
  hasPriorData = false,
  sparklineData = [],
  budgetTotal = 0,
  staggerIndex = 0,
  onSetBudget,
}) => {
  const animatedAmount = useAnimatedNumber(amount, 600);

  // Special Highlighted Budget Card layout
  if (type === 'budget') {
    const budgetStatus = getBudgetStatus(amount, budgetTotal);
    const hasBudget = budgetTotal > 0;
    const remaining = budgetTotal - amount;

    let glowClass = 'kpi-card';
    if (hasBudget && budgetStatus) {
      glowClass = `kpi-card ${budgetStatus.glowClass}`;
    }

    return (
      <div
        className={`${glowClass} animate-card-fade-up`}
        style={{ animationDelay: `${staggerIndex * 50}ms` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                hasBudget && budgetStatus
                  ? `${budgetStatus.barColor}/15 ${budgetStatus.textColor}`
                  : 'bg-ink-soft/10 text-ink-soft'
              }`}
            >
              <Target className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              {label || 'Monthly Budget'}
            </span>
          </div>

          {hasBudget && budgetStatus ? (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                budgetStatus.isDanger
                  ? 'bg-expense/10 text-expense border-expense/30 animate-pulse'
                  : budgetStatus.isWarn
                  ? 'bg-warn/10 text-warn border-warn/30'
                  : 'bg-income/10 text-income border-income/30'
              }`}
            >
              {budgetStatus.isDanger || budgetStatus.isWarn ? (
                <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              )}
              <span>{budgetStatus.statusText}</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-ink-soft bg-cream-band border border-line px-2 py-0.5 rounded-full">
              No limit set
            </span>
          )}
        </div>

        <div className="mt-3">
          {hasBudget ? (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-bold font-mono tracking-tight text-ink tabular-nums">
                  {formatCurrency(animatedAmount)}
                </div>
                <span className="text-xs text-ink-soft font-mono">
                  of {formatCurrency(budgetTotal)}
                </span>
              </div>

              {/* 6px Progress Bar */}
              <div className="w-full bg-cream-band h-1.5 rounded-full overflow-hidden mt-2.5 border border-line/40">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${budgetStatus?.barColor || 'bg-brand'}`}
                  style={{ width: `${Math.min(budgetStatus?.percent || 0, 100)}%` }}
                />
              </div>

              {/* Remaining & Percentage info row */}
              <div className="flex items-center justify-between mt-2.5 text-xs">
                <span className="text-ink-soft">
                  Remaining:{' '}
                  <strong className={`font-mono ${remaining < 0 ? 'text-expense font-bold' : 'text-ink'}`}>
                    {remaining < 0
                      ? `-${formatCurrency(Math.abs(remaining))}`
                      : formatCurrency(remaining)}
                  </strong>
                </span>
                <span className="font-mono text-ink-soft font-medium">
                  {budgetStatus?.percent || 0}% used
                </span>
              </div>
            </>
          ) : (
            <div className="py-1">
              <div className="text-lg font-semibold text-ink">No budget set</div>
              <p className="text-xs text-ink-soft mt-0.5">
                Establish monthly spending targets to keep finances on track.
              </p>
              {onSetBudget ? (
                <button
                  type="button"
                  onClick={onSetBudget}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition cursor-pointer"
                >
                  <span>Set budget</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <Link
                  to="/budgets"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition"
                >
                  <span>Set budget</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Configuration for Income, Expense, Balance
  const configs = {
    income: {
      glowClass: 'kpi-card kpi-card--income',
      tileClass: 'bg-income/10 text-income',
      Icon: TrendingUp,
      sign: '+',
      valueClass: 'text-ink',
      colorVar: 'income',
      stroke: 'rgb(var(--income))',
      isExpense: false,
    },
    expense: {
      glowClass: 'kpi-card kpi-card--expense',
      tileClass: 'bg-expense/10 text-expense',
      Icon: TrendingDown,
      sign: '-',
      valueClass: 'text-ink',
      colorVar: 'expense',
      stroke: 'rgb(var(--expense))',
      isExpense: true,
    },
    balance: {
      glowClass: 'kpi-card kpi-card--info',
      tileClass: 'bg-info/10 text-info',
      Icon: Wallet,
      sign: amount >= 0 ? '+' : '-',
      valueClass: 'text-ink',
      colorVar: 'info',
      stroke: 'rgb(var(--info))',
      isExpense: false,
    },
  };

  const cfg = configs[type] || configs.income;
  const CardIcon = cfg.Icon;
  const formattedValue = `${cfg.sign}${formatCurrency(Math.abs(animatedAmount))}`;

  return (
    <div
      className={`${cfg.glowClass} animate-card-fade-up`}
      style={{ animationDelay: `${staggerIndex * 50}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.tileClass}`}>
            <CardIcon className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            {label}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className={`text-2xl lg:text-[26px] font-bold font-mono tracking-tight tabular-nums ${cfg.valueClass}`}>
            {formattedValue}
          </div>
          <div className="mt-2">
            <DeltaChip
              current={amount}
              previous={previousAmount}
              hasPriorData={hasPriorData}
              isExpense={cfg.isExpense}
            />
          </div>
        </div>

        {/* Real 6-point sparkline */}
        <Sparkline
          data={sparklineData}
          colorVar={cfg.colorVar}
          stroke={cfg.stroke}
        />
      </div>
    </div>
  );
};

export default StatCard;
