import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as LucidePieChart, Calendar } from 'lucide-react';
import { formatCurrency, formatLKR } from '../../utils/helpers';

// Category colors defined in Warm Cream / Monarch design system tokens
const CATEGORY_COLOR_MAP = {
  Food: '#ea580c',        // Orange / Brand
  Groceries: '#ea580c',
  Bills: '#d97706',       // Amber / Warn
  Transport: '#0284c7',   // Sky / Info
  Shopping: '#7c3aed',    // Violet
  Entertainment: '#db2777',// Pink
  Health: '#0d9488',      // Teal
  Salary: '#15803d',      // Green / Income
  Freelance: '#15803d',
  Investments: '#0284c7',
  Others: '#78716c',      // Neutral Warm Grey
  Other: '#78716c',
};

const DEFAULT_COLORS = ['#ea580c', '#d97706', '#0284c7', '#7c3aed', '#db2777', '#0d9488', '#78716c'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-card border border-line rounded-xl px-3.5 py-2.5 shadow-xl">
        <p className="text-xs font-semibold text-ink flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: data.payload.color }}
          />
          <span>{data.name}</span>
        </p>
        <p className="text-sm font-bold font-sans text-ink tabular-nums mt-1">
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

  return (
    <div className="dash-card flex flex-col justify-between h-full shadow-xs animate-dash-fade">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center flex-shrink-0 shadow-2xs">
            <LucidePieChart className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink tracking-tight">
              Expenses by Category
            </h3>
            <p className="text-xs text-ink-soft">Distribution of spending</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-band border border-line text-xs font-medium text-ink-soft">
          <Calendar className="w-3 h-3 text-brand" />
          <span>{monthName}</span>
        </span>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-brand-soft border border-brand/20 text-brand flex items-center justify-center mb-3 shadow-2xs">
            <LucidePieChart className="w-6 h-6 stroke-[2]" />
          </div>
          <h4 className="font-serif text-base font-bold text-ink">
            No expenses recorded for {monthName}
          </h4>
          <p className="text-xs text-ink-soft max-w-xs mt-1 leading-relaxed">
            Expenses logged for this period will automatically appear here with a category distribution breakdown.
          </p>
        </div>
      ) : (
        <>
          {/* Donut Chart with Center Total (Inter 700 Tabular-Nums) */}
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
                  paddingAngle={2}
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

            {/* Center Label (Tabular-Nums, Never Monospace) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                Total spent
              </span>
              <span
                className="text-base sm:text-lg font-bold font-sans text-ink tabular-nums mt-0.5 truncate max-w-[120px]"
                title={formatLKR(totalExpense)}
              >
                {formatLKR(totalExpense)}
              </span>
            </div>
          </div>

          {/* Color Legend with percentage */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-line/60">
            {chartData.map((item, idx) => {
              const pct = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-ink-soft truncate font-medium">
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
