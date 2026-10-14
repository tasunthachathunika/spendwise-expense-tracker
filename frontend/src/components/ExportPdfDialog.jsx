import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  Loader2, 
  AlertTriangle, 
  AlertCircle, 
  Check, 
  Layers, 
  FileCode2, 
  TrendingUp, 
  TrendingDown, 
  Wallet 
} from 'lucide-react';
import { generateTransactionsPdf } from '../utils/exportPdf.js';
import { exportTransactionsToCsv } from '../utils/exportCsv.js';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MAX_PDF_CAP = 2000;

/**
 * Accessible PDF Export Configuration Dialog & Mobile Bottom Sheet.
 * Features live filtered summary preview, custom title, layout controls,
 * 2,000 row cap alerts with 1-click CSV fallback, and robust error handling.
 */
const ExportPdfDialog = ({
  isOpen,
  onClose,
  total = 0,
  filters = {},
  sort = 'date',
  order = 'desc',
  summary = {},
  user = null,
}) => {
  const [reportTitle, setReportTitle] = useState('Transactions report');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [orientation, setOrientation] = useState('portrait'); // 'portrait' | 'landscape'

  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const dialogRef = useRef(null);
  const titleInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setReportTitle('Transactions report');
      setIncludeSummary(true);
      setIncludeNotes(true);
      setOrientation('portrait');
      setErrorMsg(null);
      setGenerating(false);

      // Focus title input on open
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 50);
    } else {
      // Cancel any ongoing fetch if dialog is closed
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [isOpen]);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !generating) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, generating, onClose]);

  if (!isOpen) return null;

  // Active filter chip descriptors
  const activeChips = [];
  if (filters.type) activeChips.push(`Type: ${filters.type}`);
  if (filters.category) activeChips.push(`Category: ${filters.category}`);
  if (filters.search) activeChips.push(`Search: "${filters.search}"`);
  if (filters.startDate || filters.endDate) {
    activeChips.push(`Date: ${filters.startDate || 'Start'} to ${filters.endDate || 'Present'}`);
  }

  // ─── PDF Generation Handler ───────────────────────────────────────────────
  const handleGeneratePdf = async () => {
    if (generating) return;
    setErrorMsg(null);
    setGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Fetch all matching rows via the JSON export endpoint
      const params = {
        sort,
        order,
        format: 'json',
      };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get('/transactions/export', {
        params,
        signal: controller.signal,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || 'Server failed to export transactions.');
      }

      const rows = res.data.transactions || [];
      if (rows.length === 0) {
        throw new Error('No transactions match the selected filters.');
      }

      // Small tick to ensure UI renders "Generating PDF..." state
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Generate the PDF document
      const result = await generateTransactionsPdf(rows, {
        reportTitle: reportTitle.trim() || 'Transactions report',
        includeSummary,
        includeNotes,
        orientation,
        user,
        filters,
        summary,
      });

      toast.success(`PDF downloaded: ${result.filename}`);
      onClose();
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }
      console.error('PDF generation error:', err);
      setErrorMsg(err.message || 'Failed to generate PDF report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // ─── Fallback: Switch to CSV ──────────────────────────────────────────────
  const handleSwitchToCsv = async () => {
    try {
      onClose();
      toast.loading('Downloading CSV spreadsheet...', { id: 'csv-toast' });
      const res = await exportTransactionsToCsv(filters);
      toast.success(`CSV downloaded: ${res.filename}`, { id: 'csv-toast' });
    } catch (err) {
      toast.error('Failed to download CSV', { id: 'csv-toast' });
    }
  };

  const isCapped = total > MAX_PDF_CAP;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!generating) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-dialog-title"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-card border border-line rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-2 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center border border-brand/20">
              <FileText size={17} />
            </span>
            <div>
              <h2 id="pdf-dialog-title" className="text-sm font-bold text-ink">
                Export PDF report
              </h2>
              <p className="text-[11px] text-ink-soft">
                Generate a publication-ready financial ledger document
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            aria-label="Close export dialog"
            className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-band transition cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="bg-expense/10 border border-expense/30 text-expense rounded-xl p-3 flex items-start justify-between gap-3 animate-in fade-in duration-150"
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={handleGeneratePdf}
                className="px-2.5 py-1 bg-expense text-white rounded-lg font-semibold hover:opacity-90 shrink-0 cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {/* 2,000 Cap Warning Banner */}
          {isCapped && (
            <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Dataset exceeds 2,000 records.</span>{' '}
                  Only the newest 2,000 transactions fit in a PDF report. Use CSV to export everything.
                </div>
              </div>
              <button
                type="button"
                onClick={handleSwitchToCsv}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-card hover:bg-cream-hover text-ink font-semibold rounded-lg border border-line transition cursor-pointer"
              >
                <FileSpreadsheet size={13} className="text-income" />
                <span>Switch to CSV (Exports all {total} rows)</span>
              </button>
            </div>
          )}

          {/* Live Export Preview Card */}
          <div className="bg-cream-band/50 border border-line rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                Export Target
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand font-bold font-mono text-[11px]">
                {Math.min(total, MAX_PDF_CAP)} transactions
              </span>
            </div>

            {/* Active filters chips */}
            {activeChips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-card border border-line text-[10.5px] font-medium text-ink"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-ink-soft italic">
                All transactions (No filters active)
              </p>
            )}

            {/* Totals Preview */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-line/60">
              <div>
                <p className="text-[10px] text-ink-soft">Income</p>
                <p className="font-bold font-mono text-income text-[11px]">
                  +Rs. {(summary.income || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-soft">Expenses</p>
                <p className="font-bold font-mono text-expense text-[11px]">
                  -Rs. {(summary.expense || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-soft">Net</p>
                <p className={`font-bold font-mono text-[11px] ${summary.net >= 0 ? 'text-income' : 'text-expense'}`}>
                  {summary.net >= 0 ? '+' : '-'}Rs. {Math.abs(summary.net || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-3.5">
            {/* Report Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="report-title-input" className="font-semibold text-ink">
                  Report Title
                </label>
                <span className="text-[10px] text-ink-soft">
                  {reportTitle.length} / 60
                </span>
              </div>
              <input
                id="report-title-input"
                ref={titleInputRef}
                type="text"
                maxLength={60}
                disabled={generating}
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Q4 Financial Ledger Report"
                className="w-full bg-cream-band/60 border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:bg-card focus-visible:ring-2 focus-visible:ring-brand/40 transition"
              />
            </div>

            {/* Page Orientation Segmented Control */}
            <div>
              <label className="font-semibold text-ink block mb-1">
                Page Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => setOrientation('portrait')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    orientation === 'portrait'
                      ? 'bg-brand text-white border-brand shadow-xs'
                      : 'bg-card border-line text-ink hover:bg-cream-hover'
                  }`}
                >
                  <Layers size={14} className={orientation === 'portrait' ? 'text-white' : 'text-ink-soft'} />
                  <span>Portrait (Standard A4)</span>
                </button>

                <button
                  type="button"
                  disabled={generating}
                  onClick={() => setOrientation('landscape')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    orientation === 'landscape'
                      ? 'bg-brand text-white border-brand shadow-xs'
                      : 'bg-card border-line text-ink hover:bg-cream-hover'
                  }`}
                >
                  <FileCode2 size={14} className={orientation === 'landscape' ? 'text-white' : 'text-ink-soft'} />
                  <span>Landscape (Wide Table)</span>
                </button>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={generating}
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded border-line text-brand focus:ring-brand/50 cursor-pointer"
                />
                <span className="text-ink">Include KPI Summary Cards & Category Breakdown</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={generating}
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="rounded border-line text-brand focus:ring-brand/50 cursor-pointer"
                />
                <span className="text-ink">Include Transaction Notes under Description</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-line bg-cream-band/30">
          <button
            type="button"
            disabled={generating}
            onClick={onClose}
            className="btn btn-secondary px-4 py-2 text-xs font-medium rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={generating || total === 0}
            onClick={handleGeneratePdf}
            className={`btn btn-primary px-5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition ${
              generating ? 'opacity-80 cursor-wait' : 'cursor-pointer hover:shadow'
            }`}
          >
            {generating ? (
              <>
                <Loader2 size={15} className="animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText size={15} />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPdfDialog;
