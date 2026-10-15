import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import { BarChart3 } from 'lucide-react';

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === 'income')?.value || 0;
    const expense = payload.find((p) => p.dataKey === 'expense')?.value || 0;
    const net = income - expense;

    return (
      <div className="bg-card border border-line rounded-xl p-3.5 shadow-xl text-xs space-y-1.5 min-w-[150px]">
        <p className="font-bold text-ink border-b border-line pb-1.5">{label}</p>
        <div className="flex justify-between items-center text-income">
          <span className="font-medium">Income:</span>
          <span className="font-sans font-bold tabular-nums">+{formatCurrency(income)}</span>
        </div>
        <div className="flex justify-between items-center text-expense">
          <span className="font-medium">Expense:</span>
          <span className="font-sans font-bold tabular-nums">-{formatCurrency(expense)}</span>
        </div>
        <div className="flex justify-between items-center pt-1.5 border-t border-line text-ink-soft">
          <span className="font-medium">Net Margin:</span>
          <span
            className={`font-sans font-bold tabular-nums ${
              net >= 0 ? 'text-income' : 'text-expense'
            }`}
          >
            {net >= 0 ? `+${formatCurrency(net)}` : `-${formatCurrency(Math.abs(net))}`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CashFlowBarChart = ({ data = [] }) => {
  const hasData = data && data.length > 0;
  const chartData = hasData ? data : [];

  return (
    <div className="dash-card flex flex-col justify-between h-full shadow-xs animate-dash-fade">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-info/10 border border-info/20 text-info flex items-center justify-center flex-shrink-0 shadow-2xs">
            <BarChart3 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink tracking-tight">
              Cash Flow Analysis (Last 6 Months)
            </h3>
            <p className="text-xs text-ink-soft">Monthly income and expenses</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-income">
            <span className="w-2.5 h-2.5 rounded-sm bg-income flex-shrink-0" />
            <span>Income</span>
          </span>
          <span className="flex items-center gap-1.5 text-expense">
            <span className="w-2.5 h-2.5 rounded-sm bg-expense flex-shrink-0" />
            <span>Expense</span>
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-brand-soft border border-brand/20 text-brand flex items-center justify-center mb-3 shadow-2xs">
            <BarChart3 className="w-6 h-6 stroke-[2]" />
          </div>
          <h4 className="font-serif text-base font-bold text-ink">
            No cash flow trend recorded yet
          </h4>
          <p className="text-xs text-ink-soft max-w-xs mt-1 leading-relaxed">
            Multi-month cash flow trends will automatically materialize as transactions accumulate.
          </p>
        </div>
      ) : (
        <>
          {/* Responsive Bar Chart */}
          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(var(--line))"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="rgb(var(--ink-soft))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgb(var(--line))' }}
                />
                <YAxis
                  stroke="rgb(var(--ink-soft))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="rgb(var(--income))"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="rgb(var(--expense))"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-ink-soft text-center pt-3 border-t border-line/60 mt-2">
            Evaluated across verified historical monthly transaction logs.
          </p>
        </>
      )}
    </div>
  );
};

export default CashFlowBarChart;
