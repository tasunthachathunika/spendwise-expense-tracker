import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Target,
  PieChart,
  Download,
  Loader2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const QuickActionsCard = ({ onAddNew }) => {
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const response = await api.get('/transactions/export?format=csv', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `spendwise-transactions-${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Transactions CSV exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export transactions CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dash-card animate-card-fade-up">
      <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
        <div>
          <h2 className="text-base font-bold font-serif text-ink tracking-tight flex items-center gap-1.5">
            <span>Quick Actions</span>
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">Frequent account operations</p>
        </div>
      </div>

      {/* 2x2 Grid of Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Add Transaction (Primary CTA) */}
        <button
          type="button"
          onClick={onAddNew}
          className="bg-brand hover:bg-brand-dark text-white rounded-xl p-3.5 flex flex-col items-center justify-center text-center gap-2 shadow-md shadow-brand/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold leading-tight">Add Transaction</span>
        </button>

        {/* 2. Set Budget */}
        <Link
          to="/budgets"
          className="bg-card hover:bg-cream-hover border border-line hover:border-line-light rounded-xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 hover:-translate-y-0.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-warn/10 text-warn flex items-center justify-center group-hover:scale-110 transition-transform">
            <Target className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-semibold text-ink leading-tight">Set Budget</span>
        </Link>

        {/* 3. View Analytics */}
        <Link
          to="/analytics"
          className="bg-card hover:bg-cream-hover border border-line hover:border-line-light rounded-xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 hover:-translate-y-0.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center group-hover:scale-110 transition-transform">
            <PieChart className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-semibold text-ink leading-tight">View Analytics</span>
        </Link>

        {/* 4. Export CSV */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="bg-card hover:bg-cream-hover border border-line hover:border-line-light rounded-xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-lg bg-income/10 text-income flex items-center justify-center group-hover:scale-110 transition-transform">
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 stroke-[2.2]" />
            )}
          </div>
          <span className="text-xs font-semibold text-ink leading-tight">
            {exporting ? 'Exporting...' : 'Export CSV'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActionsCard;
