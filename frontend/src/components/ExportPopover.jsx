import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  ChevronDown, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { exportTransactionsToCsv } from '../utils/exportCsv.js';
import toast from 'react-hot-toast';

/**
 * Premier Fintech-grade Export Popover Menu & Action Button.
 * Inspired by modern financial platforms (Stripe, Mercury, Linear, Monarch Money).
 * Features dual-toned container, tactile icon pill, micro-badges, and rich popover cards.
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
      {/* ─── Real-world Tactile Export Button ───────────────────────────────── */}
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
        className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold select-none transition-all duration-200 ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed bg-card/60 border-line text-ink-soft shadow-none'
            : isOpen
            ? 'bg-cream-band/70 border-brand/50 ring-2 ring-brand/20 text-brand shadow-xs'
            : 'bg-card hover:bg-cream-hover border-line hover:border-brand/40 text-ink shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer'
        }`}
      >
        {/* Tactile Icon Pill */}
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
            isExportingCsv
              ? 'bg-brand-soft text-brand border-brand/30'
              : isOpen
              ? 'bg-brand text-white border-brand shadow-2xs'
              : 'bg-cream-band group-hover:bg-brand-soft text-ink-body group-hover:text-brand border-line/70'
          }`}
        >
          {isExportingCsv ? (
            <Loader2 size={13} className="animate-spin text-brand" />
          ) : (
            <Download size={13} className="transition-transform group-hover:-translate-y-0.5 duration-200" />
          )}
        </span>

        {/* Button Label */}
        <span className="font-semibold tracking-tight">
          {isExportingCsv ? 'Downloading CSV...' : 'Export'}
        </span>

        {/* Micro-divider */}
        <span className="w-px h-3.5 bg-line/80 mx-0.5" aria-hidden="true" />

        {/* Chevron Caret Indicator */}
        <ChevronDown
          size={13}
          className={`text-ink-soft group-hover:text-ink transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand' : ''
          }`}
        />
      </button>

      {/* ─── Premium Popover Menu ───────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="export-popover-menu"
          role="menu"
          aria-labelledby="export-popover-button"
          className="absolute right-0 mt-2 w-80 rounded-2xl bg-card border border-line shadow-2xl z-40 p-2 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Indicator */}
          <div className="px-3 py-2 border-b border-line mb-1 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">
                Export Ledger
              </p>
              <p className="text-xs font-semibold text-ink mt-0.5">
                Ready to download
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand font-mono font-bold text-[11px] border border-brand/20">
              {total} record{total === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-1">
            {/* Option 1: CSV Spreadsheet */}
            <button
              type="button"
              role="menuitem"
              tabIndex={0}
              onClick={handleDownloadCsv}
              onKeyDown={(e) => handleItemKeyDown(e, 0)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-cream-band/70 border border-transparent hover:border-line transition-all cursor-pointer group focus:outline-none focus:bg-cream-band/80"
            >
              <div className="w-9 h-9 rounded-xl bg-income/10 text-income border border-income/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink group-hover:text-brand transition">
                    CSV spreadsheet
                  </span>
                  <span className="text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-cream-band text-ink-soft border border-line/80">
                    .csv
                  </span>
                </div>
                <p className="text-[11px] text-ink-soft font-normal mt-0.5 leading-snug">
                  Excel-ready with UTF-8 BOM & formula safety
                </p>
              </div>
              <ArrowRight size={14} className="text-ink-soft opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-brand shrink-0" />
            </button>

            {/* Option 2: PDF Executive Report */}
            <button
              type="button"
              role="menuitem"
              tabIndex={0}
              onClick={handleOpenPdf}
              onKeyDown={(e) => handleItemKeyDown(e, 1)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-cream-band/70 border border-transparent hover:border-line transition-all cursor-pointer group focus:outline-none focus:bg-cream-band/80"
            >
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand border border-brand/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink group-hover:text-brand transition">
                    PDF report
                  </span>
                  <span className="text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-brand-soft text-brand border border-brand/25">
                    .pdf
                  </span>
                </div>
                <p className="text-[11px] text-ink-soft font-normal mt-0.5 leading-snug">
                  A4 publication report with summary & charts
                </p>
              </div>
              <ArrowRight size={14} className="text-ink-soft opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-brand shrink-0" />
            </button>
          </div>

          {/* Footer Notice */}
          <div className="mt-1 pt-2 border-t border-line/60 px-3 py-1 flex items-center gap-1.5 text-[10.5px] text-ink-soft">
            <ShieldCheck size={12} className="text-income shrink-0" />
            <span>Preserves all active filters and sort orders</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPopover;
