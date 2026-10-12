import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Target } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const iconMap = {
  income: {
    icon: ArrowUpRight,
    bg: 'bg-income/10',
    border: 'border-income/20',
    color: 'text-income',
    textColor: 'text-income',
  },
  expense: {
    icon: ArrowDownRight,
    bg: 'bg-expense/10',
    border: 'border-expense/20',
    color: 'text-expense',
    textColor: 'text-expense',
  },
  balance: {
    icon: Wallet,
    bg: 'bg-info/10',
    border: 'border-info/20',
    color: 'text-info',
    textColor: 'text-ink',
  },
  budget: {
    icon: Target,
    bg: 'bg-warn/10',
    border: 'border-warn/20',
    color: 'text-warn',
    textColor: 'text-ink',
  },
};

const StatCard = ({
  type = 'income',
  label,
  amount = 0,
  prefix = '',
  subtitle,
  badgeText,
  badgePositive = true,
}) => {
  const config = iconMap[type] || iconMap.income;
  const Icon = config.icon;

  const displayAmount = prefix
    ? `${prefix}${formatCurrency(amount)}`
    : type === 'income'
    ? `+${formatCurrency(amount)}`
    : type === 'expense'
    ? `-${formatCurrency(amount)}`
    : formatCurrency(amount);

  return (
    <div className="bg-bg-card border border-line hover:border-line-light rounded-2xl p-5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-3">
        <h3 className={`text-2xl font-bold font-mono tracking-tight ${config.textColor}`}>
          {displayAmount}
        </h3>

        {subtitle && (
          <div className="text-[11px] text-ink-soft mt-1.5 flex items-center gap-1.5">
            {badgeText && (
              <span className={`font-semibold ${badgePositive ? 'text-income' : 'text-expense'}`}>
                {badgeText}
              </span>
            )}
            <span className="text-ink-soft">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
