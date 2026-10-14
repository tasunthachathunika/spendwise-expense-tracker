import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { PieChart as LucidePieChart } from 'lucide-react';
import { formatCurrency, CHART_COLORS, categoryIcon } from '../../utils/helpers';

const CustomDonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-bg-card border border-line rounded-xl px-3 py-2 shadow-xl text-xs space-y-1 min-w-[130px]">
        <div className="font-semibold text-ink flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: data.payload.color }}
          />
          <span>{data.name}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-1 border-t border-line text-ink">
          <span className="font-mono font-bold text-sm">{formatCurrency(data.value)}</span>
          <span className="text-[11px] font-medium text-ink-soft">{data.payload.percent}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const CategoryDonutChart = ({
  data = [],
  monthName = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const rawList = (data || []).filter((item) => Number(item.value) > 0);
  const totalExpense = rawList.reduce((sum, item) => sum + Number(item.value), 0);
  const hasData = rawList.length > 0 && totalExpense > 0;

  // Process data: top 5 categories + "Other"
  let processedData = [];
  if (hasData) {
    const sorted = [...rawList].sort((a, b) => b.value - a.value);
    if (sorted.length <= 5) {
      processedData = sorted.map((cat, idx) => ({
        ...cat,
        color: CHART_COLORS[idx % CHART_COLORS.length],
        percent: Math.round((cat.value / totalExpense) * 100),
      }));
    } else {
      const top5 = sorted.slice(0, 5).map((cat, idx) => ({
        ...cat,
        color: CHART_COLORS[idx % CHART_COLORS.length],
        percent: Math.round((cat.value / totalExpense) * 100),
      }));
      const remainingTotal = sorted.slice(5).reduce((sum, c) => sum + c.value, 0);
      top5.push({
        name: 'Other',
        value: remainingTotal,
        color: CHART_COLORS[5] || '#78716c',
        percent: Math.round((remainingTotal / totalExpense) * 100),
      });
      processedData = top5;
    }
  }

  return (
    <div
      role="region"
      aria-label="Spending by Category Chart"
      className="dash-card flex flex-col justify-between h-[280px] sm:h-[320px] lg:h-[340px] animate-card-fade-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div>
          <h2 className="text-base font-bold font-serif text-ink tracking-tight">
            Spending by Category
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            {monthName ? `Expense breakdown for ${monthName}` : 'Expense breakdown for selected month'}
          </p>
          <span className="sr-only">
            Donut chart showing proportional breakdown of expenses by category for the selected month.
          </span>
        </div>
        {hasData && (
          <span className="text-xs font-mono font-semibold text-ink-soft bg-cream-band border border-line px-2 py-0.5 rounded-lg">
            {processedData.length} categories
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-cream-band border border-line flex items-center justify-center text-ink-soft mb-3">
            <LucidePieChart className="w-5 h-5 text-ink-soft" />
          </div>
          <h3 className="text-sm font-bold text-ink">No expenses this month</h3>
          <p className="text-xs text-ink-soft max-w-xs mt-1">
            Expenses logged for this month will be categorized and analyzed here.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between pt-2 min-h-0">
          {/* Donut Chart with Center Total */}
          <div className="relative w-full h-36 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomDonutTooltip />} />
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={processedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="rgb(var(--card))"
                  strokeWidth={2}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  isAnimationActive={true}
                  animationDuration={700}
                >
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label (Tabular-nums formatted) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                Total spent
              </span>
              <span className="text-sm font-mono font-bold text-ink tabular-nums mt-0.5">
                {formatCurrency(totalExpense)}
              </span>
            </div>
          </div>

          {/* Legend beneath: Name, percentage and amount (Top 5 plus Other) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs pt-2.5 border-t border-line mt-auto">
            {processedData.map((cat, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between gap-1 p-1 rounded-md transition-colors cursor-default ${
                  activeIndex === idx ? 'bg-cream-hover' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-ink truncate text-xs">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-ink-soft flex-shrink-0">
                  <span>{cat.percent}%</span>
                  <span className="hidden sm:inline text-ink font-semibold">({formatCurrency(cat.value)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDonutChart;
