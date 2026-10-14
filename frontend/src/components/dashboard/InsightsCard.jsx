import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { formatCurrency, categoryIcon } from '../../utils/helpers';

const InsightsCard = ({
  expenseByCategory = [],
  monthlyExpenses = 0,
  previousMonthExpenses = 0,
  hasPreviousMonthData = false,
  budgetAmount = 0,
}) => {
  const insights = [];

  // Insight 1: Top spending category (real data)
  if (expenseByCategory && expenseByCategory.length > 0 && monthlyExpenses > 0) {
    const topCat = expenseByCategory[0];
    const catName = topCat._id || 'General';
    const catTotal = Number(topCat.total) || 0;
    const catPct = Math.round((catTotal / monthlyExpenses) * 100);

    const iconName = categoryIcon(catName);
    const IconComponent = LucideIcons[iconName] || PieChart;

    insights.push({
      id: 'top-category',
      icon: IconComponent,
      iconColor: 'bg-brand/10 text-brand',
      title: 'Top spending category',
      text: `${catName} is your largest expense at ${formatCurrency(catTotal)} (${catPct}% of monthly spending).`,
    });
  }

  // Insight 2: Comparison vs previous month (real data)
  if (hasPreviousMonthData && previousMonthExpenses > 0 && monthlyExpenses > 0) {
    const diff = monthlyExpenses - previousMonthExpenses;
    const pct = Math.abs(Math.round((diff / previousMonthExpenses) * 100));

    if (diff < 0) {
      insights.push({
        id: 'expense-comparison',
        icon: TrendingDown,
        iconColor: 'bg-income/10 text-income',
        title: 'Spending trend',
        text: `Expenses are ${pct}% lower than last month (${formatCurrency(Math.abs(diff))} saved).`,
      });
    } else if (diff > 0) {
      insights.push({
        id: 'expense-comparison',
        icon: TrendingUp,
        iconColor: 'bg-expense/10 text-expense',
        title: 'Spending trend',
        text: `Expenses are ${pct}% higher than last month (+${formatCurrency(diff)}).`,
      });
    }
  }

  // Insight 3: Budget status (real data)
  if (budgetAmount > 0) {
    const usagePercent = Math.round((monthlyExpenses / budgetAmount) * 100);
    const remaining = budgetAmount - monthlyExpenses;

    if (remaining < 0) {
      insights.push({
        id: 'budget-status',
        icon: AlertTriangle,
        iconColor: 'bg-expense/10 text-expense',
        title: 'Budget warning',
        text: `You have exceeded your monthly budget by ${formatCurrency(Math.abs(remaining))} (${usagePercent}% used).`,
      });
    } else if (usagePercent >= 70) {
      insights.push({
        id: 'budget-status',
        icon: Target,
        iconColor: 'bg-warn/10 text-warn',
        title: 'Budget threshold',
        text: `You have used ${usagePercent}% of your monthly budget (${formatCurrency(remaining)} remaining).`,
      });
    } else {
      insights.push({
        id: 'budget-status',
        icon: CheckCircle2,
        iconColor: 'bg-income/10 text-income',
        title: 'Budget on track',
        text: `You have used ${usagePercent}% of your budget with ${formatCurrency(remaining)} safe buffer.`,
      });
    }
  }

  // Max 3 insights
  const displayInsights = insights.slice(0, 3);

  // If no insights can be computed from real data, hide the card completely
  if (displayInsights.length === 0) {
    return null;
  }

  return (
    <div className="dash-card animate-card-fade-up">
      <div className="flex items-center justify-between pb-3 border-b border-line mb-3.5">
        <div>
          <h2 className="text-base font-bold font-serif text-ink tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Financial Insights</span>
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">Computed from your active ledger</p>
        </div>
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-soft bg-cream-band border border-line px-2 py-0.5 rounded-full">
          Live
        </span>
      </div>

      <div className="space-y-3">
        {displayInsights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.id}
              className="p-2.5 rounded-xl bg-cream-band/60 border border-line/60 flex items-start gap-3 text-xs"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${insight.iconColor}`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-ink text-xs">{insight.title}</p>
                <p className="text-ink-soft text-[11px] leading-relaxed mt-0.5">
                  {insight.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsCard;
