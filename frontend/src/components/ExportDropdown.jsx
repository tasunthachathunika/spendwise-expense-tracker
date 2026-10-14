import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { exportTransactionsToPdf } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';

/**
 * Accessible Export Dropdown Button for Transactions
 * Supports server-side CSV streaming and client-side lazy-loaded PDF generation.
 */
const ExportDropdown = ({
  total = 0,
  filters = {},
  sort = 'date',
  order = 'desc',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingType, setExportingType] = useState(null); // 'csv' | 'pdf' | null
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { user } = useAuth();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation & accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const items = dropdownRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
        if (items && items.length > 0) {
          items[0].focus();
        }
      }
    }
  };

  const handleMenuKeyDown = (e, index) => {
    const items = dropdownRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
    if (!items || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % items.length;
      items[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + items.length) % items.length;
      items[prevIndex].focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  // Helper to build active filter query parameters
  const getFilterParams = () => {
    const params = { sort, order };
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    return params;
  };

  // ─── 1. Export CSV ─────────────────────────────────────────────────────────
  const handleExportCsv = async () => {
    if (total === 0 || exportingType) return;
    setIsOpen(false);
    setExportingType('csv');

    try {
      const params = {
        ...getFilterParams(),
        format: 'csv',
      };

      // Download via API client as blob with JWT Authorization header
      const res = await api.get('/transactions/export', {
        params,
        responseType: 'blob',
      });

      // Extract filename from header or fallback
      let filename = `spendwise-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      const disposition = res.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      // Create temporary object URL and trigger download
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('CSV downloaded successfully');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      toast.error(err.response?.data?.message || 'Failed to download CSV');
    } finally {
      setExportingType(null);
    }
  };

  // ─── 2. Export PDF ─────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    if (total === 0 || exportingType) return;
    setIsOpen(false);
    setExportingType('pdf');

    try {
      const params = {
        ...getFilterParams(),
        format: 'json',
      };

      const res = await api.get('/transactions/export', { params });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch transaction data for PDF');
      }

      const transactions = res.data.transactions || [];
      if (transactions.length === 0) {
        toast.error('No transactions available to generate PDF');
        return;
      }

      if (res.data.capped) {
        toast('Note: PDF export is capped at 2,000 transactions', { icon: 'ℹ️' });
      }

      await exportTransactionsToPdf(transactions, {
        activeFilters: filters,
        userName: user?.name || 'Kasun Perera',
      });

      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      toast.error(err.message || 'Failed to generate PDF report');
    } finally {
      setExportingType(null);
    }
  };

  const isDisabled = total === 0 || exportingType !== null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        id="export-dropdown-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="export-dropdown-menu"
        disabled={isDisabled}
        title={total === 0 ? 'No matching transactions to export' : `Export ${total} transactions`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`btn btn-secondary flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-line transition select-none ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cream-hover cursor-pointer'
        }`}
      >
        {exportingType ? (
          <Loader2 size={15} className="animate-spin text-brand" />
        ) : (
          <Download size={15} className="text-ink-soft" />
        )}
        <span>{exportingType ? 'Exporting...' : 'Export'}</span>
        <ChevronDown
          size={13}
          className={`text-ink-soft transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="export-dropdown-menu"
          role="menu"
          aria-labelledby="export-dropdown-button"
          className="absolute right-0 mt-1.5 w-60 rounded-xl bg-card border border-line shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header count indicator */}
          <div className="px-3.5 py-2 border-b border-line">
            <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
              Export Transactions
            </p>
            <p className="text-xs text-ink font-medium mt-0.5">
              Exports <span className="text-brand font-bold">{total}</span> matching transaction{total === 1 ? '' : 's'}
            </p>
          </div>

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              tabIndex={0}
              onClick={handleExportCsv}
              onKeyDown={(e) => handleMenuKeyDown(e, 0)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-ink hover:bg-cream-hover hover:text-brand transition text-left cursor-pointer focus:outline-none focus:bg-cream-hover focus:text-brand"
            >
              <FileSpreadsheet size={15} className="text-income shrink-0" />
              <div className="flex-1">
                <div>Download CSV</div>
                <div className="text-[10px] text-ink-soft font-normal">Excel-compatible with UTF-8 BOM</div>
              </div>
            </button>

            <button
              type="button"
              role="menuitem"
              tabIndex={0}
              onClick={handleExportPdf}
              onKeyDown={(e) => handleMenuKeyDown(e, 1)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-ink hover:bg-cream-hover hover:text-brand transition text-left cursor-pointer focus:outline-none focus:bg-cream-hover focus:text-brand"
            >
              <FileText size={15} className="text-expense shrink-0" />
              <div className="flex-1">
                <div>Download PDF</div>
                <div className="text-[10px] text-ink-soft font-normal">Formatted A4 financial report</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
