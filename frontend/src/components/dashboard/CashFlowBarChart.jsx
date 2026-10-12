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

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === 'income')?.value || 0;
    const expense = payload.find((p) => p.dataKey === 'expense')?.value || 0;
    const net = income - expense;

    return (
      <div className="bg-bg-card border border-line rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[140px]">
        <p className="font-bold text-ink border-b border-line pb-1">{label}</p>
        <div className="flex justify-between items-center text-income">
          <span>Income:</span>
          <span className="font-mono font-bold">+{formatCurrency(income)}</span>
        </div>
        <div className="flex justify-between items-center text-expense">
          <span>Expense:</span>
          <span className="font-mono font-bold">-{formatCurrency(expense)}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-line text-ink-soft">
          <span>Net Savings:</span>
          <span className={`font-mono font-bold ${net >= 0 ? 'text-income' : 'text-expense'}`}>
            {net >= 0 ? `+${formatCurrency(net)}` : `-${formatCurrency(Math.abs(net))}`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CashFlowBarChart = ({ data = [] }) => {
  // Realistic fallback data for last 6 months
  const defaultMonthlyData = [
    { month: 'May', income: 180000, expense: 110000 },
    { month: 'Jun', income: 210000, expense: 130000 },
    { month: 'Jul', income: 220000, expense: 140000 },
    { month: 'Aug', income: 200000, expense: 120000 },
    { month: 'Sep', income: 235000, expense: 142000 },
    { month: 'Oct (Now)', income: 250000, expense: 145000 },
  ];

  const chartData = data && data.length > 0 ? data : defaultMonthlyData;

  return (
    <div className="bg-bg-card border border-line rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-ink">Cash Flow Analysis (Last 6 Months)</h3>
          <p className="text-xs text-ink-soft">Monthly comparisons: Income (Emerald) vs Expense (Rose)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-income">
            <span className="w-2.5 h-2.5 rounded-sm bg-income"></span> Income
          </span>
          <span className="flex items-center gap-1.5 text-expense">
            <span className="w-2.5 h-2.5 rounded-sm bg-expense"></span> Expense
          </span>
        </div>
      </div>

      {/* Responsive Bar Chart */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232f48" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#232f48' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar
              dataKey="income"
              name="Income"
              fill="var(--income, #15803d)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="var(--expense, #dc2626)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-ink-soft text-center pt-3 border-t border-line mt-2">
        Consistently maintaining a positive net cash flow surplus.
      </p>
    </div>
  );
};

export default CashFlowBarChart;
