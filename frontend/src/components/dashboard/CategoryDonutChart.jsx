import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as LucidePieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

// Category colors defined in Warm Cream / Monarch specs
const CATEGORY_COLOR_MAP = {
  Food: '#ea580c',        // Orange
  Groceries: '#ea580c',
  Bills: '#d97706',       // Amber
  Transport: '#0284c7',   // Sky
  Shopping: '#7c3aed',    // Violet
  Entertainment: '#db2777',// Pink
  Health: '#0d9488',      // Teal
  Others: '#78716c',      // Grey
  Other: '#78716c',
};

const DEFAULT_COLORS = ['#ea580c', '#d97706', '#0284c7', '#7c3aed', '#db2777', '#0d9488', '#78716c'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-bg-card border border-line rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold text-ink flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }}></span>
          {data.name}
        </p>
        <p className="text-sm font-mono font-bold text-ink mt-0.5">
          {formatCurrency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

const CategoryDonutChart = ({
  data = [],
  monthName = 'October',
}) => {
  const hasData = data && data.length > 0;

  const chartData = (hasData ? data : []).map((item, index) => {
    const color = CATEGORY_COLOR_MAP[item.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    return {
      ...item,
      color,
    };
  });

  const totalExpense = chartData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  // Compact total text (e.g. Rs. 145K)
  const compactTotal = totalExpense >= 1000
    ? `Rs. ${(totalExpense / 1000).toFixed(0)}K`
    : `Rs. ${totalExpense}`;

  return (
    <div className="bg-bg-card border border-line rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-ink">Expenses by Category</h3>
          <p className="text-xs text-ink-soft">Distribution of spending</p>
        </div>
        <span className="text-xs text-ink-muted bg-bg-secondary px-2.5 py-1 rounded-lg border border-line">
          {monthName}
        </span>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-cream-band border border-line flex items-center justify-center text-ink-soft mb-3">
            <LucidePieChart className="w-5 h-5 text-ink-soft" />
          </div>
          <h4 className="text-sm font-bold text-ink">No category expenses yet</h4>
          <p className="text-xs text-ink-soft max-w-xs mt-1">
            Expenses logged for this month will be broken down by category here.
          </p>
        </div>
      ) : (
        <>
          {/* Donut Chart with Center Total */}
          <div className="relative w-full h-52 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="transparent"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Total</span>
              <span className="text-base font-mono font-bold text-ink">{compactTotal}</span>
            </div>
          </div>

          {/* Color Legend with percentage */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-line">
            {chartData.map((item, idx) => {
              const pct = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-ink-soft truncate">
                    {item.name} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryDonutChart;
