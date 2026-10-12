import React from 'react';

export const StatCardSkeleton = () => (
  <div className="bg-bg-card border border-line rounded-2xl p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-3 w-24 bg-bg-hover rounded"></div>
      <div className="w-8 h-8 rounded-lg bg-bg-hover"></div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-7 w-36 bg-bg-hover rounded"></div>
      <div className="h-3 w-28 bg-bg-hover rounded"></div>
    </div>
  </div>
);

export const ChartSkeleton = ({ height = "h-64" }) => (
  <div className={`bg-bg-card border border-line rounded-2xl p-6 animate-pulse flex flex-col justify-between ${height}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 w-40 bg-bg-hover rounded"></div>
      <div className="h-3 w-16 bg-bg-hover rounded"></div>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="w-36 h-36 rounded-full border-4 border-bg-hover border-t-brand animate-spin opacity-50"></div>
    </div>
    <div className="h-3 w-48 bg-bg-hover rounded mx-auto mt-4"></div>
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-bg-card border border-line rounded-2xl overflow-hidden animate-pulse">
    <div className="p-5 border-b border-line flex justify-between items-center">
      <div className="h-4 w-36 bg-bg-hover rounded"></div>
      <div className="h-8 w-44 bg-bg-hover rounded-xl"></div>
    </div>
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-line/40 last:border-none">
          <div className="h-3 w-20 bg-bg-hover rounded"></div>
          <div className="h-3 w-40 bg-bg-hover rounded"></div>
          <div className="h-5 w-16 bg-bg-hover rounded-full"></div>
          <div className="h-3 w-24 bg-bg-hover rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export default { StatCardSkeleton, ChartSkeleton, TableSkeleton };
