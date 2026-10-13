import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Calendar,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, categoryIcon, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/helpers';
import TransactionModal from '../components/TransactionModal';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

const Transactions = () => {
  useDocumentTitle('Transactions');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
      };
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions', { params });
      if (res.data.success) {
        setTransactions(res.data.transactions);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, categoryFilter, startDate, endDate]);

  // Handle Search Debounce / Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleSaveTransaction = async (formData) => {
    try {
      if (selectedTx) {
        await api.put(`/transactions/${selectedTx._id}`, formData);
        toast.success('Transaction updated successfully!');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction created successfully!');
      }
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
      throw err;
    }
  };

  const requestDelete = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await api.delete(`/transactions/${deleteTargetId}`);
      toast.success('Transaction deleted successfully');
      setDeleteTargetId(null);
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddModal = () => {
    setSelectedTx(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="page-subtitle">Manage and review all your financial logs ({total} total)</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-wrap">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search descriptions or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Type filter */}
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
        </select>

        {/* Category filter */}
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Date Filters */}
        <input
          type="date"
          className="filter-select"
          title="Start Date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
        />
        <input
          type="date"
          className="filter-select"
          title="End Date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
        />

        {(search || typeFilter || categoryFilter || startDate || endDate) && (
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleResetFilters}
            title="Reset filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Transactions Table / List */}
      <div className="card">
        {loading ? (
          <div className="page-loading">
            <div className="spinner spinner-lg"></div>
            <span>Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h4 className="empty-state-title">No transactions found</h4>
            <p className="empty-state-text">
              {search || typeFilter || categoryFilter || startDate || endDate
                ? 'Try adjusting your filters or search query.'
                : 'Get started by creating your first transaction.'}
            </p>
            <button className="btn btn-primary mt-2" onClick={openAddModal}>
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>
                        <span className={`badge ${tx.type === 'Income' ? 'badge-income' : 'badge-expense'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span>{categoryIcon(tx.category)}</span>
                          <span className="font-medium text-ink">{tx.category}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-ink-body">
                          {tx.description || <span className="text-ink-soft italic">—</span>}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-ink-soft bg-cream-band border border-line px-2 py-0.5 rounded">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className="text-ink-soft text-sm">{formatDate(tx.date)}</span>
                      </td>
                      <td>
                        <span className={`font-bold font-mono ${tx.type === 'Income' ? 'text-income' : 'text-expense'}`}>
                          {tx.type === 'Income' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="btn btn-icon edit"
                            onClick={() => openEditModal(tx)}
                            title="Edit Transaction"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-icon delete"
                            onClick={() => requestDelete(tx._id)}
                            title="Delete Transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                <span className="text-xs text-ink-soft">
                  Page {page} of {pages} ({total} items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    disabled={page >= pages}
                    onClick={() => setPage(page + 1)}
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transaction={selectedTx}
      />

      {/* Accessible Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction record? This action cannot be reversed."
        confirmText="Delete Transaction"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default Transactions;
