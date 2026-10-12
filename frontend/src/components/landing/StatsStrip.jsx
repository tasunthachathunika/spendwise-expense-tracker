import React from 'react';

const stats = [
  { value: '100%', label: 'Free to use', sub: 'Zero hidden subscriptions' },
  { value: '6+', label: 'Expense categories', sub: 'Housing, food, bills and more' },
  { value: 'Real-time', label: 'Budget tracking', sub: 'Instant cash flow calculation' },
  { value: 'Instant', label: 'Analytics view', sub: 'Income vs expense breakdown' },
];

const StatsStrip = () => {
  return (
    <section className="bg-cream dark:bg-[#0a0e17] relative z-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-10 lg:-mt-14">
        <div className="bg-white dark:bg-bg-card border border-line rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-line">
            {stats.map((item, index) => (
              <div
                key={index}
                className={`text-center ${index > 0 ? 'pt-6 sm:pt-0 sm:pl-6 lg:pl-8' : ''}`}
              >
                <div className="font-serif font-bold text-3xl sm:text-4xl text-brand">
                  {item.value}
                </div>
                <div className="text-sm font-semibold text-ink mt-1">
                  {item.label}
                </div>
                <div className="text-xs text-ink-soft mt-0.5">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
