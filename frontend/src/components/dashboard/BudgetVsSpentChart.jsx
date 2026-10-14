import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import * as LucideIcons from 'lucide-react';
import { formatCurrency, categoryIcon, CHART_COLORS } from '../../utils/helpers';

const CustomBudgetStackedTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const spent = payload.find((p) => p.dataKey === 'spent')?.value || 0;
    const remaining = payload.find((p) => p.dataKey === 'remaining')?.value || 0;
    const total = spent + remaining;

    return (
      <div className="bg-bg-card border border-line rounded-xl p-3 shadow-xl text-xs space-y-2 min-w-[170px]">
        <p className="font-bold text-ink border-b border-line pb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] font-normal text-ink-soft">Budget Allocation</span>
        </p>
        <div className="flex justify-between items-center text-brand">
          <span>Spent:</span>
          <span className="font-mono font-bold">{formatCurrency(spent)}</span>
        </div>
        <div className="flex justify-between items-center text-ink-soft">
          <span>Remaining:</span>
          <span className="font-mono font-bold">{formatCurrency(remaining)}</span>
        </div>
        <div className="flex justify-between items-center pt-1.5 border-t border-line text-ink">
          <span>Total Budget:</span>
          <span className="font-mono font-bold text-ink">{formatCurrency(total)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const BudgetVsSpentChart = ({
  trendData = [],
  categoryData = [],
  selectedMonth = '',
  selectedYear = '',
}) => {
  // Check if historical budgets exist in real data (at least 2 months with budget > 0)
  const monthsWithBudget = (trendData || []).filter((m) => Number(m.budget) > 0);
  const hasBudgetHistory = monthsWithBudget.length >= 2;

  // Prepare stacked bar data if history exists
  const stackedData = hasBudgetHistory
    ? trendData.map((m) => {
        const spent = Number(m.expense) || 0;
        const budget = Number(m.budget) || 0;
        const remaining = Math.max(0, budget - spent);
        const isSelected =
          m.monthNum === Number(selectedMonth) ||
          m.month === selectedMonth;
        return {
          month: m.month,
          spent,
          remaining,
          budget,
          isSelected,
        };
      })
    : [];

  // Top spending categories fallback (never fake, computed from real expenses)
  const expenseCategories = (categoryData || []).filter((c) => Number(c.value) > 0);
  const totalExpense = expenseCategories.reduce((sum, c) => sum + Number(c.value), 0);
  const sortedCategories = [...expenseCategories]
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  return (
    <div
      role="region"
      aria-label={hasBudgetHistory ? 'Budget vs Spent Chart' : 'Top Spending Categories'}
      className="dash-card flex flex-col justify-between h-[280px] sm:h-[320px] lg:h-[340px] animate-card-fade-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div>
          <h2 className="text-base font-bold font-serif text-ink tracking-tight">
            {hasBudgetHistory ? 'Budget vs Spent' : 'Top Spending Categories'}
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            {hasBudgetHistory
              ? '6-month budget tracking'
              : 'Share of monthly expenditure'}
          </p>
          <span className="sr-only">
            {hasBudgetHistory
              ? 'Stacked bar chart tracking monthly budget limits against expenditure over the past 6 months.'
              : 'Ranked list of top spending categories with amounts and percentage shares for the selected month.'}
          </span>
        </div>

        {hasBudgetHistory ? (
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-brand">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand" /> Spent
            </span>
            <span className="flex items-center gap-1.5 text-ink-soft">
              <span className="w-2.5 h-2.5 rounded-sm bg-line-light" /> Remaining
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono font-semibold text-ink-soft bg-cream-band border border-line px-2 py-0.5 rounded-lg">
            Real Usage
          </span>
        )}
      </div>

      {hasBudgetHistory ? (
        /* Real 6-month Stacked Bars */
        <div className="w-full flex-1 pt-3 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stackedData}
              margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(var(--line))"
                strokeOpacity={0.6}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="rgb(var(--ink-soft))"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'rgb(var(--line))' }}
              />
              <YAxis
                stroke="rgb(var(--ink-soft))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `Rs. ${(v / 1000).toFixed(0)}k` : `Rs. ${v}`
                }
              />
              <Tooltip content={<CustomBudgetStackedTooltip />} />
              <Bar
                dataKey="spent"
                name="Spent"
                stackId="a"
                fill="rgb(var(--brand))"
                radius={[0, 0, 0, 0]}
                maxBarSize={28}
                isAnimationActive={true}
                animationDuration={700}
              />
              <Bar
                dataKey="remaining"
                name="Remaining"
                stackId="a"
                fill="rgb(var(--line-light))"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                isAnimationActive={true}
                animationDuration={700}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : sortedCategories.length > 0 ? (
        /* Top Spending Categories Horizontal Progress Bars */
        <div className="flex-1 flex flex-col justify-around py-2">
          {sortedCategories.map((cat, idx) => {
            const pct = totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0;
            const iconName = categoryIcon(cat.name);
            const IconComponent = LucideIcons[iconName] || LucideIcons.Tag;
            const barColor = CHART_COLORS[idx % CHART_COLORS.length];

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: barColor }}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-ink">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-ink">{formatCurrency(cat.value)}</span>
                    <span className="text-ink-soft text-[11px] font-normal w-9 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Horizontal Share Bar */}
                <div className="w-full bg-cream-band h-2 rounded-full overflow-hidden border border-line/50">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-cream-band border border-line flex items-center justify-center text-ink-soft mb-3">
            <LucideIcons.BarChart2 className="w-5 h-5 text-ink-soft" />
          </div>
          <h3 className="text-sm font-bold text-ink">No category spending logged</h3>
          <p className="text-xs text-ink-soft max-w-xs mt-1">
            As you log expenses, your top spending categories will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetVsSpentChart;
