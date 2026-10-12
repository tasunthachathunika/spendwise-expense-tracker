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

  // Fallback sample data matching the prototype HTML
  const defaultList = [
    {
      _id: '1',
      date: '2026-10-08',
      description: 'Client UI Design Project',
      category: 'Freelance',
      type: 'Income',
      paymentMethod: 'Bank Transfer',
      amount: 45000,
    },
    {
      _id: '2',
      date: '2026-10-07',
      description: 'Supermarket Grocery Run',
      category: 'Food',
      type: 'Expense',
      paymentMethod: 'Debit Card',
      amount: 12450,
    },
    {
      _id: '3',
      date: '2026-10-05',
      description: 'Electricity & Internet Bill',
      category: 'Bills',
      type: 'Expense',
      paymentMethod: 'Online Payment',
      amount: 8900,
    },
    {
      _id: '4',
      date: '2026-10-01',
      description: 'Software Engineering Salary',
      category: 'Salary',
      type: 'Income',
      paymentMethod: 'Bank Transfer',
      amount: 205000,
    },
  ];

  const listToRender = (transactions && transactions.length > 0 ? transactions : defaultList);

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

      {/* Responsive Table */}
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
    </div>
  );
};

export default RecentTransactionsTable;
