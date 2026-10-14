import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === 'income')?.value || 0;
    const expense = payload.find((p) => p.dataKey === 'expense')?.value || 0;
    const net = income - expense;

    return (
      <div className="bg-bg-card border border-line rounded-xl p-3 shadow-xl text-xs space-y-2 min-w-[170px]">
        <p className="font-bold text-ink border-b border-line pb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] font-normal text-ink-soft">Cash Flow</span>
        </p>
        <div className="flex justify-between items-center text-income">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-income inline-block" />
            Income:
          </span>
          <span className="font-mono font-bold">+{formatCurrency(income)}</span>
        </div>
        <div className="flex justify-between items-center text-expense">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-expense inline-block" />
            Expenses:
          </span>
          <span className="font-mono font-bold">-{formatCurrency(expense)}</span>
        </div>
        <div className="flex justify-between items-center pt-1.5 border-t border-line text-ink">
          <span className="text-ink-soft">Net Balance:</span>
          <span className={`font-mono font-bold ${net >= 0 ? 'text-income' : 'text-expense'}`}>
            {net >= 0 ? `+${formatCurrency(net)}` : `-${formatCurrency(Math.abs(net))}`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CashFlowAreaChart = ({ data = [], isDark = false }) => {
  const hasData = data && data.length > 0 && data.some((d) => (d.income || 0) > 0 || (d.expense || 0) > 0);
  const chartData = data || [];

  return (
    <div
      role="region"
      aria-label="Cash Flow Trend Chart"
      className="dash-card flex flex-col justify-between h-[280px] sm:h-[320px] lg:h-[340px] animate-card-fade-up"
    >
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div>
          <h2 className="text-base font-bold font-serif text-ink tracking-tight">
            Cash Flow Trend
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Income vs expenses for the last 6 months
          </p>
          <span className="sr-only">
            Interactive area chart comparing monthly income and expenses across the past 6 months.
          </span>
        </div>

        {/* Legend with explicit text labels */}
        <div className="flex items-center gap-3.5 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-income">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5 text-expense">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Expenses</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-cream-band border border-line flex items-center justify-center text-ink-soft mb-3">
            <Calendar className="w-5 h-5 text-ink-soft" />
          </div>
          <h3 className="text-sm font-bold text-ink">No cash flow trend yet</h3>
          <p className="text-xs text-ink-soft max-w-xs mt-1">
            Log transactions across months to generate cash flow comparisons.
          </p>
        </div>
      ) : (
        <div className="w-full flex-1 pt-3 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cf-income-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--income))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(var(--income))" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cf-expense-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--expense))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(var(--expense))" stopOpacity={0.0} />
                </linearGradient>
              </defs>

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
                dy={6}
              />

              <YAxis
                stroke="rgb(var(--ink-soft))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000000
                    ? `Rs. ${(v / 1000000).toFixed(1)}M`
                    : v >= 1000
                    ? `Rs. ${(v / 1000).toFixed(0)}k`
                    : `Rs. ${v}`
                }
              />

              <Tooltip content={<CustomAreaTooltip />} />

              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="rgb(var(--income))"
                strokeWidth={2}
                fill="url(#cf-income-gradient)"
                isAnimationActive={true}
                animationDuration={700}
                activeDot={{ r: 5, stroke: 'rgb(var(--card))', strokeWidth: 2, fill: 'rgb(var(--income))' }}
              />

              <Area
                type="monotone"
                dataKey="expense"
                name="Expenses"
                stroke="rgb(var(--expense))"
                strokeWidth={2}
                fill="url(#cf-expense-gradient)"
                isAnimationActive={true}
                animationDuration={700}
                activeDot={{ r: 5, stroke: 'rgb(var(--card))', strokeWidth: 2, fill: 'rgb(var(--expense))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CashFlowAreaChart;
