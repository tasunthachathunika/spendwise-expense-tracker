import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Receipt,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { formatDate, formatCurrency, categoryIcon } from '../../utils/helpers';

const RecentTransactionsTable = ({
  transactions = [],
  monthlyExpenses = 0,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const listToRender = (transactions || []).slice(0, 5);

  return (
    <div className="dash-card flex flex-col justify-between overflow-hidden animate-card-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div>
          <h2 className="text-base font-bold font-serif text-ink tracking-tight">
            Recent Transactions
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Latest recorded activity across your accounts
          </p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-brand hover:text-brand-dark flex items-center gap-1 transition"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {listToRender.length === 0 ? (
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center my-auto">
          <div className="w-12 h-12 rounded-2xl bg-cream-band border border-line flex items-center justify-center text-ink-soft mb-3">
            <Receipt className="w-5 h-5 text-ink-soft" />
          </div>
          <h3 className="text-sm font-bold text-ink">No transactions recorded</h3>
          <p className="text-xs text-ink-soft max-w-xs mt-1 mb-4">
            Add your first income or expense to see it in your recent transactions list.
          </p>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add your first transaction</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table (>= 640px) */}
          <div className="hidden sm:block overflow-x-auto pt-1">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {listToRender.map((tx) => {
                  const isIncome = tx.type === 'Income';
                  const iconName = categoryIcon(tx.category);
                  const IconComp = LucideIcons[iconName] || LucideIcons.Tag;
                  
                  // Compute real share of monthly spending for expenses
                  const shareOfSpending =
                    !isIncome && monthlyExpenses > 0
                      ? Math.round((Number(tx.amount) / monthlyExpenses) * 100)
                      : 0;

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-cream-hover transition-colors group"
                    >
                      {/* Transaction info (icon + title + note/method) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isIncome
                                ? 'bg-income/10 text-income'
                                : 'bg-brand/10 text-brand'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate text-xs sm:text-sm">
                              {tx.description || (
                                <span className="text-ink-soft italic">Untitled Transaction</span>
                              )}
                            </p>
                            <p className="text-[11px] text-ink-soft truncate mt-0.5">
                              {tx.notes
                                ? tx.notes
                                : tx.paymentMethod
                                ? `Paid via ${tx.paymentMethod}`
                                : tx.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Chip */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-cream-band text-ink-soft border border-line">
                          {tx.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs font-mono text-ink-soft">
                        {formatDate(tx.date, { month: 'short', day: 'numeric' })}
                      </td>

                      {/* Amount with Real Share of Spending Bar */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-xs sm:text-sm tabular-nums inline-block">
                          <span className={isIncome ? 'text-income' : 'text-expense'}>
                            {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                          </span>
                        </div>
                        {!isIncome && shareOfSpending > 0 && (
                          <div
                            className="flex items-center justify-end gap-1.5 mt-1"
                            title={`${shareOfSpending}% of this month's total spending`}
                          >
                            <div className="w-12 h-1.5 bg-cream-band rounded-full overflow-hidden border border-line/40">
                              <div
                                className="h-full bg-expense rounded-full"
                                style={{ width: `${Math.min(shareOfSpending, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-ink-soft">
                              {shareOfSpending}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit && onEdit(tx)}
                            className="p-1 text-ink-soft hover:text-brand hover:bg-cream-band rounded transition"
                            title="Edit transaction"
                            aria-label={`Edit ${tx.description || 'transaction'}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete && onDelete(tx._id)}
                            className="p-1 text-ink-soft hover:text-expense hover:bg-expense/10 rounded transition"
                            title="Delete transaction"
                            aria-label={`Delete ${tx.description || 'transaction'}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Rows (< 640px) */}
          <div className="sm:hidden divide-y divide-line/60 pt-1">
            {listToRender.map((tx) => {
              const isIncome = tx.type === 'Income';
              const iconName = categoryIcon(tx.category);
              const IconComp = LucideIcons[iconName] || LucideIcons.Tag;

              return (
                <div key={tx._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isIncome ? 'bg-income/10 text-income' : 'bg-brand/10 text-brand'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate text-xs">
                        {tx.description || 'Untitled Transaction'}
                      </p>
                      <p className="text-[10px] text-ink-soft mt-0.5">
                        {formatDate(tx.date, { month: 'short', day: 'numeric' })} • {tx.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`font-mono font-bold text-xs tabular-nums ${
                        isIncome ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </span>
                    <button
                      onClick={() => onEdit && onEdit(tx)}
                      className="p-1 text-ink-soft hover:text-brand"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(tx._id)}
                      className="p-1 text-ink-soft hover:text-expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer View All Link */}
          <div className="pt-3 border-t border-line mt-2 flex justify-end">
            <Link
              to="/transactions"
              className="text-xs font-semibold text-ink-soft hover:text-brand inline-flex items-center gap-1.5 transition"
            >
              <span>View all {transactions.length > 5 ? `${transactions.length} transactions` : 'transactions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentTransactionsTable;
