import React from 'react';

export const StatCardSkeleton = () => (
  <div className="dash-card animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-3 w-24 bg-cream-band rounded"></div>
      <div className="w-8 h-8 rounded-lg bg-cream-band"></div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-7 w-36 bg-cream-band rounded"></div>
      <div className="h-3 w-28 bg-cream-band rounded"></div>
    </div>
  </div>
);

export const ChartSkeleton = ({ height = "h-[280px] sm:h-[320px] lg:h-[340px]" }) => (
  <div className={`dash-card animate-pulse flex flex-col justify-between ${height}`}>
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
      <div className="h-4 w-40 bg-cream-band rounded"></div>
      <div className="h-3 w-16 bg-cream-band rounded"></div>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="w-24 h-24 rounded-full border-4 border-cream-band border-t-brand animate-spin opacity-50"></div>
    </div>
    <div className="h-3 w-48 bg-cream-band rounded mx-auto mt-4"></div>
  </div>
);

export const TableSkeleton = () => (
  <div className="dash-card overflow-hidden animate-pulse">
    <div className="pb-4 border-b border-line flex justify-between items-center">
      <div className="h-4 w-36 bg-cream-band rounded"></div>
      <div className="h-6 w-20 bg-cream-band rounded-xl"></div>
    </div>
    <div className="pt-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 border-b border-line/40 last:border-none">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cream-band"></div>
            <div className="h-3 w-28 bg-cream-band rounded"></div>
          </div>
          <div className="h-3 w-20 bg-cream-band rounded"></div>
          <div className="h-4 w-16 bg-cream-band rounded-full"></div>
          <div className="h-3 w-20 bg-cream-band rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export default { StatCardSkeleton, ChartSkeleton, TableSkeleton };
