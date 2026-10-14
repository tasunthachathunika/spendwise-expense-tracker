import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { exportTransactionsToCsv } from '../utils/exportCsv.js';
import toast from 'react-hot-toast';

/**
 * Professional Export Popover Trigger & Menu.
 * Provides immediate CSV spreadsheet download and opens the PDF report configuration dialog.
 */
const ExportPopover = ({
  total = 0,
  filters = {},
  sort = 'date',
  order = 'desc',
  onOpenPdfDialog,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
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

  // Keyboard accessibility
  const handleButtonKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => {
        const firstItem = popoverRef.current?.querySelector('[role="menuitem"]');
        firstItem?.focus();
      }, 50);
    }
  };

  const handleItemKeyDown = (e, index) => {
    const items = popoverRef.current?.querySelectorAll('[role="menuitem"]');
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

  // ─── Direct CSV Export ─────────────────────────────────────────────────────
  const handleDownloadCsv = async () => {
    if (total === 0 || isExportingCsv) return;
    setIsOpen(false);
    setIsExportingCsv(true);

    try {
      const res = await exportTransactionsToCsv({
        ...filters,
        sort,
        order,
      });
      toast.success(`CSV downloaded: ${res.filename}`);
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error(err.response?.data?.message || 'Failed to download CSV');
    } finally {
      setIsExportingCsv(false);
      buttonRef.current?.focus();
    }
  };

  // ─── Open PDF Dialog ───────────────────────────────────────────────────────
  const handleOpenPdf = () => {
    if (total === 0) return;
    setIsOpen(false);
    onOpenPdfDialog();
  };

  const isDisabled = total === 0;

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        id="export-popover-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="export-popover-menu"
        disabled={isDisabled || isExportingCsv}
        title={total === 0 ? 'No transactions to export' : `Export ${total} transactions`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className={`btn btn-secondary flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-line transition select-none ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed bg-card'
            : 'hover:bg-cream-hover cursor-pointer shadow-2xs'
        }`}
      >
        {isExportingCsv ? (
          <Loader2 size={15} className="animate-spin text-brand" />
        ) : (
          <Download size={15} className="text-ink-soft" />
        )}
        <span>{isExportingCsv ? 'Downloading CSV...' : 'Export'}</span>
        <ChevronDown
          size={13}
          className={`text-ink-soft transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          id="export-popover-menu"
          role="menu"
          aria-labelledby="export-popover-button"
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-card border border-line shadow-2xl z-30 py-2 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header count indicator */}
          <div className="px-4 py-2 border-b border-line">
            <p className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">
              Export Dataset
            </p>
            <p className="text-xs text-ink font-medium mt-0.5">
              Exports <span className="text-brand font-bold">{total}</span> matching transaction{total === 1 ? '' : 's'}
            </p>
          </div>

          <div className="p-1.5 space-y-1">
            {/* CSV Option */}
            <button
              type="button"
              role="menuitem"
              tabIndex={0}
              onClick={handleDownloadCsv}
              onKeyDown={(e) => handleItemKeyDown(e, 0)}
              className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-cream-hover transition cursor-pointer group focus:outline-none focus:bg-cream-hover"
            >
              <div className="w-8 h-8 rounded-lg bg-income/10 text-income flex items-center justify-center shrink-0 border border-income/20 mt-0.5">
                <FileSpreadsheet size={16} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-ink group-hover:text-brand transition">
                  CSV spreadsheet
                </div>
                <div className="text-[11px] text-ink-soft font-normal mt-0.5">
                  Best for Excel and data analysis
                </div>
              </div>
            </button>

            {/* PDF Option */}
            <button
              type="button"
              role="menuitem"
              tabIndex={0}
              onClick={handleOpenPdf}
              onKeyDown={(e) => handleItemKeyDown(e, 1)}
              className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-cream-hover transition cursor-pointer group focus:outline-none focus:bg-cream-hover"
            >
              <div className="w-8 h-8 rounded-lg bg-expense/10 text-expense flex items-center justify-center shrink-0 border border-expense/20 mt-0.5">
                <FileText size={16} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-ink group-hover:text-brand transition">
                  PDF report
                </div>
                <div className="text-[11px] text-ink-soft font-normal mt-0.5">
                  Best for printing and sharing
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPopover;
