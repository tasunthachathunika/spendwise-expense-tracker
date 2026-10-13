import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Search, ArrowRight, Plus } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';

const RecentTransactionsTable = ({
  transactions = [],
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const listToRender = transactions || [];

  const filtered = listToRender.filter((tx) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (tx.description && tx.description.toLowerCase().includes(term)) ||
      (tx.category && tx.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-bg-card border border-line rounded-2xl overflow-hidden shadow-sm">
      {/* Header with Search and View All CTA */}
      <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-ink">Recent Transactions</h3>
          <p className="text-xs text-ink-soft">Latest entries logged across your accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-bg-primary border border-line text-xs rounded-xl pl-8 pr-3 py-2 text-ink placeholder-ink-muted focus:outline-none focus:border-brand w-48 transition"
            />
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-brand hover:text-brand-light flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {listToRender.length === 0 ? (
        <div className="p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-cream-band border border-line flex items-center justify-center text-ink-soft mb-3">
            <Plus className="w-5 h-5 text-ink-soft" />
          </div>
          <h4 className="text-sm font-bold text-ink">No transactions recorded</h4>
          <p className="text-xs text-ink-soft max-w-xs mt-1 mb-4">
            Add your first income or expense to see it in your recent transactions list.
          </p>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          )}
        </div>
      ) : (
        /* Responsive Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink-soft">
            <thead className="bg-bg-secondary/60 text-xs uppercase font-semibold text-ink-muted border-b border-line">
              <tr>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5 text-right">Amount</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-ink-muted text-xs">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
              filtered.map((tx) => {
                const isIncome = tx.type === 'Income';
                return (
                  <tr key={tx._id} className="hover:bg-bg-hover transition-colors">
                    <td className="py-3.5 px-5 text-xs font-mono whitespace-nowrap">
                      {formatDate(tx.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-ink">
                      {tx.description || <span className="text-ink-muted italic">Untitled Transaction</span>}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-bg-primary text-ink-soft border border-line">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          isIncome
                            ? 'bg-income/10 text-income border-income/20'
                            : 'bg-expense/10 text-expense border-expense/20'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs whitespace-nowrap">
                      {tx.paymentMethod || 'Cash'}
                    </td>
                    <td
                      className={`py-3.5 px-5 text-right font-mono font-bold whitespace-nowrap ${
                        isIncome ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </td>
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit && onEdit(tx)}
                          className="p-1 text-ink-muted hover:text-ink transition rounded"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(tx._id)}
                          className="p-1 text-ink-muted hover:text-expense transition rounded"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default RecentTransactionsTable;
