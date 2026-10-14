import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  RotateCcw,
  CheckSquare,
  Square,
  MinusSquare,
  TrendingUp,
  TrendingDown,
  Wallet,
  Copy
} from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/helpers';
import CategoryIcon from '../components/common/CategoryIcon';
import TransactionModal from '../components/TransactionModal';
import ExportPopover from '../components/ExportPopover';
import ExportPdfDialog from '../components/ExportPdfDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';

const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));
const ALLOWED_LIMITS = [10, 25, 50, 100];
const ALLOWED_SORTS = ['date', 'amount', 'category', 'createdAt'];

const Transactions = () => {
  useDocumentTitle('Transactions');
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── 1. URL Parameter Parsing with Safe Clamping ────────────────────────────
  const rawPage = parseInt(searchParams.get('page'), 10);
  const page = !isNaN(rawPage) && rawPage >= 1 ? rawPage : 1;

  const rawLimit = parseInt(searchParams.get('limit'), 10);
  const limit = ALLOWED_LIMITS.includes(rawLimit) ? rawLimit : 10;

  const rawSort = searchParams.get('sort');
  const sort = ALLOWED_SORTS.includes(rawSort) ? rawSort : 'date';

  const rawOrder = searchParams.get('order');
  const order = rawOrder === 'asc' ? 'asc' : 'desc';

  const typeFilter = searchParams.get('type') || '';
  const categoryFilter = searchParams.get('category') || '';
  const searchFilter = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  // ─── 2. Local State ────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0, count: 0 });

  // Search input with 400ms debounce
  const [searchInput, setSearchInput] = useState(searchFilter);
  const searchInputRef = useRef(null);

  // Selected IDs for Bulk Actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  // Date Preset Tracking
  const [activeDatePreset, setActiveDatePreset] = useState('');

  // Refs for request cancellation and scroll
  const abortControllerRef = useRef(null);
  const tableTopRef = useRef(null);
  const pendingDeletesRef = useRef(new Map()); // id -> { tx, timerId }

  // ─── 3. URL Parameter Updater Helper ────────────────────────────────────────
  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === null || val === '') {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Keep local search input in sync if URL search param changes from outside (e.g. back/forward)
  useEffect(() => {
    setSearchInput(searchFilter);
  }, [searchFilter]);

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchFilter) {
        updateParams({ search: searchInput.trim(), page: 1 });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, searchFilter, updateParams]);

  // ─── 4. Fetch Transactions from Server ──────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setFetchError(null);

      const params = {
        page,
        limit,
        sort,
        order,
      };
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchFilter) params.search = searchFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions', {
        params,
        signal: controller.signal,
      });

      if (res.data.success) {
        const fetchedList = res.data.data || res.data.transactions || [];
        setTransactions(fetchedList);
        setTotal(res.data.total ?? 0);
        setTotalPages(res.data.pagination?.totalPages ?? res.data.pages ?? 1);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      // Ignore canceled requests
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }
      console.error('Failed to fetch transactions:', err);
      setFetchError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, order, typeFilter, categoryFilter, searchFilter, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
    // Clear selection on page/filter change
    setSelectedIds(new Set());
  }, [fetchTransactions]);

  // ─── 5. Cleanup Pending Deletes on Unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      // Flush pending deletes immediately so no deleted record is left orphan
      pendingDeletesRef.current.forEach(async ({ timerId }, id) => {
        clearTimeout(timerId);
        try {
          await api.delete(`/transactions/${id}`);
        } catch (e) {
          console.error('Failed to flush delete on unmount:', e);
        }
      });
      pendingDeletesRef.current.clear();
    };
  }, []);

  // ─── 6. Keyboard Shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input, textarea, or select
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (!isInput) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setSelectedTx(null);
          setIsModalOpen(true);
        } else if (e.key === '/') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── 7. Sort Toggle Handler ─────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sort === field) {
      // Toggle direction
      updateParams({ order: order === 'asc' ? 'desc' : 'asc', page: 1 });
    } else {
      // Default to asc for category, desc for date/amount
      const nextOrder = field === 'category' ? 'asc' : 'desc';
      updateParams({ sort: field, order: nextOrder, page: 1 });
    }
  };

  // ─── 8. Date Presets Handler ────────────────────────────────────────────────
  const handleDatePreset = (presetKey) => {
    setActiveDatePreset(presetKey);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const pad = (n) => String(n).padStart(2, '0');
    const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let newStart = '';
    let newEnd = '';

    if (presetKey === 'this_month') {
      newStart = formatYMD(new Date(year, month, 1));
      newEnd = formatYMD(new Date(year, month + 1, 0));
    } else if (presetKey === 'last_month') {
      newStart = formatYMD(new Date(year, month - 1, 1));
      newEnd = formatYMD(new Date(year, month, 0));
    } else if (presetKey === 'last_3_months') {
      newStart = formatYMD(new Date(year, month - 2, 1));
      newEnd = formatYMD(new Date(year, month + 1, 0));
    } else if (presetKey === 'this_year') {
      newStart = formatYMD(new Date(year, 0, 1));
      newEnd = formatYMD(new Date(year, 11, 31));
    } else if (presetKey === 'clear') {
      newStart = '';
      newEnd = '';
      setActiveDatePreset('');
    }

    updateParams({ startDate: newStart, endDate: newEnd, page: 1 });
  };

  // ─── 9. Filter Reset ────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearchInput('');
    setActiveDatePreset('');
    updateParams({
      search: '',
      type: '',
      category: '',
      startDate: '',
      endDate: '',
      page: 1,
    });
  };

  // ─── 10. Undo Delete with Optimistic UI (6s timeout) ────────────────────────
  const executeDeleteWithUndo = (txToDelete) => {
    const txId = txToDelete._id;
    // Optimistic removal from visible state
    setTransactions((prev) => prev.filter((t) => t._id !== txId));
    setTotal((prev) => Math.max(0, prev - 1));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(txId);
      return next;
    });

    // Schedule delayed actual delete
    const timerId = setTimeout(async () => {
      pendingDeletesRef.current.delete(txId);
      try {
        await api.delete(`/transactions/${txId}`);
      } catch (err) {
        console.error('Failed to permanently delete transaction:', err);
        toast.error('Failed to delete transaction on server');
        fetchTransactions();
      }
    }, 6000);

    pendingDeletesRef.current.set(txId, { tx: txToDelete, timerId });

    // Show undo toast
    toast((t) => (
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-ink">Transaction deleted</span>
        <button
          type="button"
          onClick={() => {
            // Restore record
            const pending = pendingDeletesRef.current.get(txId);
            if (pending) {
              clearTimeout(pending.timerId);
              pendingDeletesRef.current.delete(txId);
              toast.dismiss(t.id);
              setTransactions((prev) => [pending.tx, ...prev]);
              setTotal((prev) => prev + 1);
              toast.success('Transaction restored');
            }
          }}
          className="px-2 py-1 bg-brand text-white font-semibold rounded-md hover:bg-brand-dark transition cursor-pointer flex items-center gap-1"
        >
          <RotateCcw size={12} />
          <span>Undo</span>
        </button>
      </div>
    ), { duration: 6000 });
  };

  const handleConfirmSingleDelete = () => {
    if (!deleteTargetId) return;
    const target = transactions.find((t) => t._id === deleteTargetId);
    setDeleteTargetId(null);
    if (target) {
      executeDeleteWithUndo(target);
    }
  };

  // ─── 11. Bulk Selection & Deletion ──────────────────────────────────────────
  const isAllPageSelected = useMemo(() => {
    if (transactions.length === 0) return false;
    return transactions.every((t) => selectedIds.has(t._id));
  }, [transactions, selectedIds]);

  const isSomePageSelected = useMemo(() => {
    return transactions.some((t) => selectedIds.has(t._id)) && !isAllPageSelected;
  }, [transactions, selectedIds, isAllPageSelected]);

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        transactions.forEach((t) => next.delete(t._id));
      } else {
        transactions.forEach((t) => next.add(t._id));
      }
      return next;
    });
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkDeleting(true);
      const res = await api.delete('/transactions/bulk', {
        data: { ids: Array.from(selectedIds) },
      });
      toast.success(res.data.message || `Deleted ${selectedIds.size} transactions`);
      setSelectedIds(new Set());
      setIsBulkModalOpen(false);
      fetchTransactions();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      toast.error(err.response?.data?.message || 'Failed to bulk delete transactions');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // ─── 12. Modal Save & Duplicate ─────────────────────────────────────────────
  const handleSaveTransaction = async (formData) => {
    try {
      if (selectedTx && selectedTx._id) {
        await api.put(`/transactions/${selectedTx._id}`, formData);
        toast.success('Transaction updated successfully!');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction created successfully!');
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
      throw err;
    }
  };

  const handleDuplicateTransaction = (tx) => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedTx({
      ...tx,
      _id: undefined, // Cleared ID so it creates new
      date: today,
      description: tx.description ? `${tx.description} (Copy)` : '',
    });
    setIsModalOpen(true);
  };

  // ─── 13. Page Change with Smooth Scroll ──────────────────────────────────────
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    updateParams({ page: newPage });
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    tableTopRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  // Numbered pager range calculation
  const paginationRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (page >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }, [page, totalPages]);

  // Showing X to Y of Z
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Active filter indicators
  const activeChips = [];
  if (typeFilter) activeChips.push({ key: 'type', label: `Type: ${typeFilter}` });
  if (categoryFilter) activeChips.push({ key: 'category', label: `Category: ${categoryFilter}` });
  if (searchFilter) activeChips.push({ key: 'search', label: `Search: "${searchFilter}"` });
  if (startDate || endDate) {
    activeChips.push({
      key: 'dates',
      label: `Date: ${startDate || 'Start'} to ${endDate || 'End'}`,
    });
  }

  return (
    <div className="space-y-5">
      <div ref={tableTopRef} />

      {/* ─── Top Header & Primary Action ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink tracking-tight">Transactions</h1>
          <p className="text-xs text-ink-soft mt-0.5">
            Manage, audit, and analyze your financial logs ({total} total records)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Export Popover Menu */}
          <ExportPopover
            total={total}
            filters={{
              type: typeFilter,
              category: categoryFilter,
              search: searchFilter,
              startDate,
              endDate,
            }}
            sort={sort}
            order={order}
            onOpenPdfDialog={() => setIsPdfDialogOpen(true)}
          />

          {/* Add Transaction Button */}
          <button
            type="button"
            className="btn btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl cursor-pointer shadow-sm hover:shadow"
            onClick={() => { setSelectedTx(null); setIsModalOpen(true); }}
          >
            <Plus size={16} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* ─── Financial Summary Strip for Current Filtered Result Set ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
            <span>Total Income</span>
            <TrendingUp size={14} className="text-income" />
          </div>
          <p className="text-base font-bold text-income mt-1 font-mono">
            +Rs. {(summary.income || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
            <span>Total Expenses</span>
            <TrendingDown size={14} className="text-expense" />
          </div>
          <p className="text-base font-bold text-expense mt-1 font-mono">
            -Rs. {(summary.expense || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
            <span>Net Balance</span>
            <Wallet size={14} className={summary.net >= 0 ? 'text-income' : 'text-expense'} />
          </div>
          <p className={`text-base font-bold mt-1 font-mono ${summary.net >= 0 ? 'text-income' : 'text-expense'}`}>
            {summary.net >= 0 ? '+' : '-'}Rs. {Math.abs(summary.net || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
            <span>Matching Records</span>
            <FileText size={14} className="text-brand" />
          </div>
          <p className="text-base font-bold text-ink mt-1 font-mono">
            {total} <span className="text-xs font-normal text-ink-soft">item{total === 1 ? '' : 's'}</span>
          </p>
        </div>
      </div>

      {/* ─── Filters & Search Toolbar ─────────────────────────────────────────── */}
      <div className="bg-card border border-line rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" size={15} />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-cream-band/60 border border-line rounded-xl pl-9 pr-8 py-2 text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:bg-card focus-visible:ring-2 focus-visible:ring-brand/40 transition"
              placeholder="Search descriptions, notes, categories..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-ink-soft hover:text-ink transition"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by type"
              className="w-full bg-cream-band/60 border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:bg-card focus-visible:ring-2 focus-visible:ring-brand/40 transition cursor-pointer"
              value={typeFilter}
              onChange={(e) => updateParams({ type: e.target.value, page: 1 })}
            >
              <option value="">All Types</option>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by category"
              className="w-full bg-cream-band/60 border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:bg-card focus-visible:ring-2 focus-visible:ring-brand/40 transition cursor-pointer"
              value={categoryFilter}
              onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
            >
              <option value="">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="md:col-span-2">
            <input
              type="date"
              aria-label="Start date"
              className="w-full bg-cream-band/60 border border-line rounded-xl px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:bg-card focus-visible:ring-2 focus-visible:ring-brand/40 transition"
              value={startDate}
              onChange={(e) => {
                setActiveDatePreset('');
                updateParams({ startDate: e.target.value, page: 1 });
              }}
            />
          </div>

          {/* End Date */}
          <div className="md:col-span-2">
            <input
              type="date"
              aria-label="End date"
              className="w-full bg-cream-band/60 border border-line rounded-xl px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:bg-card focus-visible:ring-2 focus-visible:ring-brand/40 transition"
              value={endDate}
              onChange={(e) => {
                setActiveDatePreset('');
                updateParams({ endDate: e.target.value, page: 1 });
              }}
            />
          </div>
        </div>

        {/* Date Presets Chips Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-line/60">
          <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mr-1">
            Presets:
          </span>
          {[
            { key: 'this_month', label: 'This Month' },
            { key: 'last_month', label: 'Last Month' },
            { key: 'last_3_months', label: 'Last 3 Months' },
            { key: 'this_year', label: 'This Year' },
          ].map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => handleDatePreset(preset.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                activeDatePreset === preset.key
                  ? 'bg-brand-soft text-brand border-brand/40 font-semibold'
                  : 'bg-cream-band/70 text-ink border-line hover:bg-cream-hover'
              }`}
            >
              {preset.label}
            </button>
          ))}
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => handleDatePreset('clear')}
              className="px-2 py-1 rounded-lg text-xs text-ink-soft hover:text-ink hover:bg-cream-hover transition cursor-pointer"
            >
              Clear dates
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-line/60">
            <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mr-1">
              Active:
            </span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-soft text-brand text-xs font-medium border border-brand/20"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (chip.key === 'type') updateParams({ type: '', page: 1 });
                    if (chip.key === 'category') updateParams({ category: '', page: 1 });
                    if (chip.key === 'search') { setSearchInput(''); updateParams({ search: '', page: 1 }); }
                    if (chip.key === 'dates') { setActiveDatePreset(''); updateParams({ startDate: '', endDate: '', page: 1 }); }
                  }}
                  className="hover:text-brand-dark cursor-pointer"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-brand hover:underline font-semibold ml-2 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ─── Bulk Actions Sticky Bar ─────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-brand text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckSquare size={16} />
            <span>
              {selectedIds.size} transaction{selectedIds.size === 1 ? '' : 's'} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer"
            >
              Deselect all
            </button>
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="px-3 py-1 text-xs font-semibold bg-white text-brand hover:bg-cream-band rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Content Container (Card) ────────────────────────────────────── */}
      <div className="bg-card border border-line rounded-2xl overflow-hidden shadow-sm">
        {/* Error State */}
        {fetchError ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-expense/10 text-expense flex items-center justify-center">
              <AlertCircle size={26} />
            </div>
            <h3 className="text-base font-bold text-ink">Failed to load transactions</h3>
            <p className="text-xs text-ink-soft max-w-sm mx-auto">{fetchError}</p>
            <button
              type="button"
              onClick={() => fetchTransactions()}
              className="btn btn-primary px-4 py-1.5 text-xs rounded-xl"
            >
              Try Again
            </button>
          </div>
        ) : loading && transactions.length === 0 ? (
          /* Initial Loading Skeletons */
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-line animate-pulse">
                <div className="w-16 h-5 bg-cream-band rounded" />
                <div className="w-28 h-5 bg-cream-band rounded" />
                <div className="w-48 h-5 bg-cream-band rounded flex-1" />
                <div className="w-20 h-5 bg-cream-band rounded" />
                <div className="w-24 h-5 bg-cream-band rounded" />
                <div className="w-16 h-5 bg-cream-band rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          /* Friendly Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cream-band border border-line flex items-center justify-center text-ink-soft">
              <FileText size={28} />
            </div>
            <h3 className="text-base font-serif font-bold text-ink">No transactions found</h3>
            <p className="text-xs text-ink-soft max-w-sm mx-auto">
              {typeFilter || categoryFilter || searchFilter || startDate || endDate
                ? 'No transactions match your currently applied filters. Try adjusting your query or clear filters.'
                : 'Your transactions ledger is currently empty. Get started by recording your first transaction.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              {(typeFilter || categoryFilter || searchFilter || startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary px-3.5 py-1.5 text-xs rounded-xl"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => { setSelectedTx(null); setIsModalOpen(true); }}
                className="btn btn-primary px-4 py-1.5 text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>
        ) : (
          /* Data View */
          <div className={`transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-cream-band/40 text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                    {/* Header Select All Checkbox */}
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        aria-label={isAllPageSelected ? 'Deselect all on page' : 'Select all on page'}
                        className="text-ink-soft hover:text-brand cursor-pointer transition"
                      >
                        {isAllPageSelected ? (
                          <CheckSquare size={16} className="text-brand" />
                        ) : isSomePageSelected ? (
                          <MinusSquare size={16} className="text-brand" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>

                    <th className="py-3 px-3">Type</th>

                    {/* Sortable Category */}
                    <th className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-1 hover:text-ink transition cursor-pointer select-none"
                        aria-sort={sort === 'category' ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <span>Category</span>
                        {sort === 'category' ? (
                          order === 'asc' ? <ArrowUp size={13} className="text-brand" /> : <ArrowDown size={13} className="text-brand" />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="py-3 px-3">Description & Notes</th>
                    <th className="py-3 px-3">Payment Method</th>

                    {/* Sortable Date */}
                    <th className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-1 hover:text-ink transition cursor-pointer select-none"
                        aria-sort={sort === 'date' ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <span>Date</span>
                        {sort === 'date' ? (
                          order === 'asc' ? <ArrowUp size={13} className="text-brand" /> : <ArrowDown size={13} className="text-brand" />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    </th>

                    {/* Sortable Amount */}
                    <th className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort('amount')}
                        className="inline-flex items-center gap-1 hover:text-ink transition cursor-pointer select-none ml-auto"
                        aria-sort={sort === 'amount' ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <span>Amount</span>
                        {sort === 'amount' ? (
                          order === 'asc' ? <ArrowUp size={13} className="text-brand" /> : <ArrowDown size={13} className="text-brand" />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line text-xs">
                  {transactions.map((tx) => {
                    const isSelected = selectedIds.has(tx._id);
                    return (
                      <tr
                        key={tx._id}
                        className={`transition-colors ${
                          isSelected ? 'bg-brand-soft/20' : 'hover:bg-cream-hover/60'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectRow(tx._id)}
                            aria-label={`Select transaction ${tx.description || tx.category}`}
                            className="text-ink-soft hover:text-brand cursor-pointer transition"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-brand" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* Type badge */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            tx.type === 'Income'
                              ? 'bg-income/10 text-income border border-income/20'
                              : 'bg-expense/10 text-expense border border-expense/20'
                          }`}>
                            {tx.type}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-cream-band text-brand flex items-center justify-center shrink-0 border border-line">
                              <CategoryIcon category={tx.category} size={13} />
                            </span>
                            <span className="font-medium text-ink">{tx.category}</span>
                          </div>
                        </td>

                        {/* Description & Notes */}
                        <td className="py-3 px-3 max-w-xs">
                          <div className="truncate text-ink-body font-medium" title={tx.description || ''}>
                            {tx.description || <span className="text-ink-soft italic">—</span>}
                          </div>
                          {tx.notes && (
                            <p className="text-[11px] text-ink-soft truncate mt-0.5" title={tx.notes}>
                              Note: {tx.notes}
                            </p>
                          )}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-ink-soft bg-cream-band border border-line px-2 py-0.5 rounded-md">
                            {tx.paymentMethod || 'Cash'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-ink-soft font-mono">
                          {formatDate(tx.date)}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-sm tabular-nums">
                          <span className={tx.type === 'Income' ? 'text-income' : 'text-expense'}>
                            {tx.type === 'Income' ? '+' : '-'} {formatCurrency(tx.amount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateTransaction(tx)}
                              className="p-1.5 rounded-lg text-ink-soft hover:text-brand hover:bg-cream-band transition cursor-pointer"
                              title="Duplicate transaction"
                              aria-label="Duplicate transaction"
                            >
                              <Copy size={14} />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => { setSelectedTx(tx); setIsModalOpen(true); }}
                              className="p-1.5 rounded-lg text-ink-soft hover:text-brand hover:bg-cream-band transition cursor-pointer"
                              title="Edit transaction"
                              aria-label="Edit transaction"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(tx._id)}
                              className="p-1.5 rounded-lg text-ink-soft hover:text-expense hover:bg-expense/10 transition cursor-pointer"
                              title="Delete transaction"
                              aria-label="Delete transaction"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards (< 768px) */}
            <div className="md:hidden divide-y divide-line">
              {transactions.map((tx) => {
                const isSelected = selectedIds.has(tx._id);
                return (
                  <div
                    key={tx._id}
                    className={`p-3.5 space-y-2.5 transition-colors ${
                      isSelected ? 'bg-brand-soft/20' : ''
                    }`}
                  >
                    {/* Top line: title & amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(tx._id)}
                          aria-label={`Select ${tx.description || tx.category}`}
                          className="text-ink-soft hover:text-brand"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-brand" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                        <span className="font-semibold text-xs text-ink">
                          {tx.description || tx.category}
                        </span>
                      </div>

                      <span className={`font-mono font-bold text-xs shrink-0 ${
                        tx.type === 'Income' ? 'text-income' : 'text-expense'
                      }`}>
                        {tx.type === 'Income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </div>

                    {/* Middle line: Category chip, payment method, date */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-soft">
                      <span className="inline-flex items-center gap-1 bg-cream-band px-2 py-0.5 rounded-md border border-line">
                        <CategoryIcon category={tx.category} size={11} className="text-brand" />
                        <span>{tx.category}</span>
                      </span>

                      <span className="bg-cream-band px-2 py-0.5 rounded-md border border-line">
                        {tx.paymentMethod}
                      </span>

                      <span>{formatDate(tx.date)}</span>
                    </div>

                    {/* Notes line */}
                    {tx.notes && (
                      <p className="text-[11px] text-ink-soft italic">
                        Note: {tx.notes}
                      </p>
                    )}

                    {/* Bottom actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-line/60">
                      <button
                        type="button"
                        onClick={() => handleDuplicateTransaction(tx)}
                        className="text-xs text-ink-soft hover:text-brand flex items-center gap-1"
                      >
                        <Copy size={12} />
                        <span>Duplicate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedTx(tx); setIsModalOpen(true); }}
                        className="text-xs text-ink-soft hover:text-brand flex items-center gap-1"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(tx._id)}
                        className="text-xs text-expense flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Upgraded Numbered Pagination Footer Bar ──────────────────── */}
            <div className="bg-card border-t border-line px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              {/* Left: Showing X to Y of Z */}
              <div className="text-ink-soft text-center sm:text-left">
                Showing <span className="font-semibold text-ink">{startItem}</span> to{' '}
                <span className="font-semibold text-ink">{endItem}</span> of{' '}
                <span className="font-semibold text-ink">{total}</span> transactions
              </div>

              {/* Center: Rows per page selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="page-size-select" className="text-ink-soft text-xs whitespace-nowrap">
                  Rows per page:
                </label>
                <select
                  id="page-size-select"
                  aria-label="Select number of rows per page"
                  value={limit}
                  onChange={(e) => updateParams({ limit: Number(e.target.value), page: 1 })}
                  className="bg-card text-ink border border-line rounded-lg px-2.5 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 cursor-pointer"
                >
                  {ALLOWED_LIMITS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Right: Numbered Pager */}
              <nav aria-label="Pagination" className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                    page <= 1
                      ? 'opacity-50 cursor-not-allowed bg-card border-line text-ink-soft'
                      : 'bg-card border-line text-ink hover:bg-cream-hover cursor-pointer'
                  }`}
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Mobile Compact Page Number */}
                <span className="sm:hidden px-2 text-xs font-medium text-ink">
                  Page {page} of {totalPages}
                </span>

                {/* Desktop Numbered Page Buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  {paginationRange.map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-ink-soft select-none">
                          …
                        </span>
                      );
                    }
                    const isCurrent = item === page;
                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        onClick={() => handlePageChange(item)}
                        aria-label={`Go to page ${item}`}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition ${
                          isCurrent
                            ? 'bg-brand text-white border border-brand font-bold shadow-xs'
                            : 'bg-card border border-line text-ink hover:bg-cream-hover cursor-pointer'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                    page >= totalPages
                      ? 'opacity-50 cursor-not-allowed bg-card border-line text-ink-soft'
                      : 'bg-card border-line text-ink hover:bg-cream-hover cursor-pointer'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={14} />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transaction={selectedTx}
      />

      {/* ─── Single Delete Confirm Dialog ─────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? You can undo this action within 6 seconds."
        confirmText="Delete Transaction"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmSingleDelete}
        onClose={() => setDeleteTargetId(null)}
      />

      {/* ─── Bulk Delete Confirm Dialog ───────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isBulkModalOpen}
        title={`Delete ${selectedIds.size} Transactions`}
        message={`Are you sure you want to permanently delete all ${selectedIds.size} selected transaction records? This action cannot be reversed.`}
        confirmText={`Delete ${selectedIds.size} Records`}
        isDestructive={true}
        isLoading={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* ─── Export PDF Configuration Dialog ──────────────────────────────────── */}
      <ExportPdfDialog
        isOpen={isPdfDialogOpen}
        onClose={() => setIsPdfDialogOpen(false)}
        total={total}
        filters={{
          type: typeFilter,
          category: categoryFilter,
          search: searchFilter,
          startDate,
          endDate,
        }}
        sort={sort}
        order={order}
        summary={summary}
        user={user}
      />
    </div>
  );
};

export default Transactions;
