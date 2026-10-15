import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Search, ArrowRight, Plus, ReceiptText } from 'lucide-react';
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
    <div className="dash-card p-0! overflow-hidden shadow-xs animate-dash-fade">
      {/* Header with Icon Tile, Search, and View All CTA */}
      <div className="p-5 lg:p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ReceiptText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink tracking-tight">
              Recent Transactions
            </h3>
            <p className="text-xs text-ink-soft">Latest entries logged across your accounts.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cream-band/60 border border-line text-xs rounded-xl pl-8 pr-3 py-2 text-ink placeholder:text-ink-soft/70 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand w-48 transition"
            />
            <Search className="w-3.5 h-3.5 text-ink-soft absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-brand hover:text-brand-dark flex items-center gap-1 transition flex-shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {listToRender.length === 0 ? (
        <div className="p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-soft border border-brand/20 text-brand flex items-center justify-center mb-3 shadow-2xs">
            <ReceiptText className="w-6 h-6 stroke-[2]" />
          </div>
          <h4 className="font-serif text-base font-bold text-ink">No transactions recorded</h4>
          <p className="text-xs text-ink-soft max-w-xs mt-1 mb-4 leading-relaxed">
            Add your first income or expense entry to begin tracking real-time cash flow.
          </p>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Transaction</span>
            </button>
          )}
        </div>
      ) : (
        /* Responsive Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink-soft">
            <thead className="bg-cream-band/50 text-[11px] uppercase font-semibold text-ink-soft border-b border-line tracking-wider">
              <tr>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Method</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-ink-soft text-xs">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isIncome = tx.type === 'Income';
                  return (
                    <tr key={tx._id} className="hover:bg-cream-hover transition-colors">
                      <td className="py-3.5 px-5 text-xs font-sans tabular-nums whitespace-nowrap">
                        {formatDate(tx.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-ink">
                        {tx.description || <span className="text-ink-soft/70 italic">Untitled Transaction</span>}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs bg-cream-band text-ink-soft border border-line font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
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
                        className={`py-3.5 px-5 text-right font-sans font-bold tabular-nums whitespace-nowrap ${
                          isIncome ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                      </td>
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit && onEdit(tx)}
                            className="p-1.5 text-ink-soft hover:text-ink hover:bg-cream-band transition rounded-lg cursor-pointer"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete && onDelete(tx._id)}
                            className="p-1.5 text-ink-soft hover:text-expense hover:bg-expense/10 transition rounded-lg cursor-pointer"
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
