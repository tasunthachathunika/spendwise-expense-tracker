import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, AlertTriangle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import {
  formatCurrency,
  formatLKR,
  toInputDate,
  formatBudgetPeriod,
  getSalaryDayRange,
  useCurrency,
} from '../utils/helpers';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const PRESET_AMOUNTS = [25000, 50000, 100000, 150000];

const BudgetModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete = null,
  budget = null,
  initialMonth,
  initialYear,
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  const { symbol } = useCurrency();

  // Mode: 'month' (Calendar month) or 'custom' (Custom period)
  const [mode, setMode] = useState('month');

  // Month mode fields
  const [month, setMonth] = useState(initialMonth || currentDate.getMonth() + 1);
  const [year, setYear] = useState(initialYear || currentDate.getFullYear());

  // Custom mode fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salaryDay, setSalaryDay] = useState(25);
  const [showSalaryPicker, setShowSalaryPicker] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // Amount & Submission State
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const amountInputRef = useRef(null);
  const tabMonthRef = useRef(null);
  const tabCustomRef = useRef(null);
  const modalRef = useRef(null);

  // Initialize or reset form state when modal opens or budget changes
  useEffect(() => {
    if (!isOpen) return;

    setBackendError(null);
    setShowSalaryPicker(false);

    if (budget) {
      const isCustom = budget.periodType === 'custom' || (!budget.month && budget.startDate);
      setMode(isCustom ? 'custom' : 'month');

      if (isCustom) {
        setStartDate(toInputDate(budget.startDate));
        setEndDate(toInputDate(budget.endDate));
        setActivePreset(null);
      } else {
        setMonth(budget.month || initialMonth || currentDate.getMonth() + 1);
        setYear(budget.year || initialYear || currentDate.getFullYear());
      }

      if (budget.amount) {
        setDisplayAmount(Number(budget.amount).toLocaleString('en-US'));
      } else {
        setDisplayAmount('');
      }
    } else {
      setMode('month');
      setMonth(initialMonth || currentDate.getMonth() + 1);
      setYear(initialYear || currentDate.getFullYear());

      // Prepopulate custom dates with next 30 days as a clean default if user switches
      const s = toInputDate(currentDate);
      const e = toInputDate(new Date(Date.now() + 29 * 24 * 60 * 60 * 1000));
      setStartDate(s);
      setEndDate(e);
      setActivePreset(null);
      setDisplayAmount('');
    }

    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [budget, isOpen, initialMonth, initialYear]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Format amount input with thousands separators while typing
  const handleAmountChange = (e) => {
    setBackendError(null);
    const rawVal = e.target.value.replace(/,/g, '');

    // Allow digits and at most one decimal point
    if (rawVal === '' || /^\d+(\.\d{0,2})?$/.test(rawVal)) {
      if (rawVal === '') {
        setDisplayAmount('');
        return;
      }
      const parts = rawVal.split('.');
      const formattedInt = Number(parts[0]).toLocaleString('en-US');
      const formatted = parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
      setDisplayAmount(formatted);
    }
  };

  const handlePresetAmount = (val) => {
    setBackendError(null);
    setDisplayAmount(Number(val).toLocaleString('en-US'));
    amountInputRef.current?.focus();
  };

  // Keyboard navigation for segmented control (ArrowLeft / ArrowRight)
  const handleTabKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextMode = mode === 'month' ? 'custom' : 'month';
      setMode(nextMode);
      setBackendError(null);
      if (nextMode === 'month') {
        tabMonthRef.current?.focus();
      } else {
        tabCustomRef.current?.focus();
      }
    }
  };

  // Custom period start date change: auto-adjust end date if start > end
  const handleStartDateChange = (val) => {
    setBackendError(null);
    setActivePreset(null);
    setStartDate(val);
    if (val && endDate && val > endDate) {
      setEndDate(val);
    }
  };

  const handleEndDateChange = (val) => {
    setBackendError(null);
    setActivePreset(null);
    setEndDate(val);
  };

  // Presets handlers
  const applyPresetNext30Days = () => {
    const today = new Date();
    const startStr = toInputDate(today);
    const endStr = toInputDate(new Date(Date.now() + 29 * 24 * 60 * 60 * 1000));
    setStartDate(startStr);
    setEndDate(endStr);
    setActivePreset('next30');
    setShowSalaryPicker(false);
    setBackendError(null);
  };

  const applyPresetThisMonth = () => {
    const now = new Date();
    const startStr = toInputDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)));
    const endStr = toInputDate(new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)));
    setStartDate(startStr);
    setEndDate(endStr);
    setActivePreset('thisMonth');
    setShowSalaryPicker(false);
    setBackendError(null);
  };

  const applyPresetNextMonth = () => {
    const now = new Date();
    const startStr = toInputDate(new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1)));
    const endStr = toInputDate(new Date(Date.UTC(now.getFullYear(), now.getMonth() + 2, 0)));
    setStartDate(startStr);
    setEndDate(endStr);
    setActivePreset('nextMonth');
    setShowSalaryPicker(false);
    setBackendError(null);
  };

  const applySalaryDayPreset = (day) => {
    setSalaryDay(day);
    const range = getSalaryDayRange(day, new Date());
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setActivePreset('salary');
    setShowSalaryPicker(false);
    setBackendError(null);
  };

  // Computed metrics for custom mode live summary
  let customDaysTotal = 0;
  let customPeriodLabel = '';
  let perDayEstimate = null;
  let isCustomDateValid = false;
  let customDateError = null;

  if (mode === 'custom') {
    if (!startDate || !endDate) {
      customDateError = 'Please select both start and end dates.';
    } else {
      const s = new Date(startDate + 'T00:00:00.000Z');
      const e = new Date(endDate + 'T00:00:00.000Z');
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        customDateError = 'Invalid date selected.';
      } else if (e < s) {
        customDateError = 'End date cannot be earlier than start date.';
      } else {
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        customDaysTotal = Math.round((e.getTime() - s.getTime()) / MS_PER_DAY) + 1;
        if (customDaysTotal > 366) {
          customDateError = 'Custom period cannot exceed 366 days (1 year).';
        } else {
          isCustomDateValid = true;
          customPeriodLabel = formatBudgetPeriod(s, e, 'custom');
          const cleanNum = parseFloat(displayAmount.replace(/,/g, ''));
          if (!isNaN(cleanNum) && cleanNum > 0 && customDaysTotal > 0) {
            perDayEstimate = Math.round(cleanNum / customDaysTotal);
          }
        }
      }
    }
  }

  // Amount validation
  const cleanAmountNum = parseFloat(displayAmount.replace(/,/g, ''));
  const isAmountValid = !isNaN(cleanAmountNum) && cleanAmountNum > 0 && cleanAmountNum <= 1000000000;
  const isFormValid = (mode === 'month' || isCustomDateValid) && isAmountValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !isFormValid) return;

    setLoading(true);
    setBackendError(null);

    try {
      if (mode === 'custom') {
        await onSave({
          _id: budget?._id,
          periodType: 'custom',
          startDate,
          endDate,
          amount: cleanAmountNum,
        });
      } else {
        await onSave({
          _id: budget?._id,
          periodType: 'month',
          month: parseInt(month, 10),
          year: parseInt(year, 10),
          amount: cleanAmountNum,
        });
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save budget.';
      setBackendError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="modal max-w-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 id="budget-modal-title" className="modal-title">
              {budget ? 'Adjust Budget' : 'Set New Budget'}
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Establish a spending threshold to protect against unexpected deficits.
            </p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body space-y-4">
            {/* 1. Segmented Control: Calendar Month vs Custom Period */}
            <div>
              <div
                role="tablist"
                aria-label="Budget period selection"
                onKeyDown={handleTabKeyDown}
                className="grid grid-cols-2 p-1 bg-cream-band border border-line rounded-xl"
              >
                <button
                  ref={tabMonthRef}
                  type="button"
                  role="tab"
                  id="tab-month"
                  aria-selected={mode === 'month'}
                  aria-controls="panel-month"
                  tabIndex={mode === 'month' ? 0 : -1}
                  onClick={() => {
                    setMode('month');
                    setBackendError(null);
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    mode === 'month'
                      ? 'bg-brand-soft text-brand shadow-xs'
                      : 'text-ink-soft hover:bg-cream-hover hover:text-ink'
                  }`}
                >
                  Calendar month
                </button>

                <button
                  ref={tabCustomRef}
                  type="button"
                  role="tab"
                  id="tab-custom"
                  aria-selected={mode === 'custom'}
                  aria-controls="panel-custom"
                  tabIndex={mode === 'custom' ? 0 : -1}
                  onClick={() => {
                    setMode('custom');
                    setBackendError(null);
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    mode === 'custom'
                      ? 'bg-brand-soft text-brand shadow-xs'
                      : 'text-ink-soft hover:bg-cream-hover hover:text-ink'
                  }`}
                >
                  Custom period
                </button>
              </div>
              <p className="text-[11px] text-ink-soft mt-1.5 px-1">
                {mode === 'custom'
                  ? 'Set exact start and end dates tailored to your salary or income cycle.'
                  : 'Standard 1st to end-of-month financial budget cycle.'}
              </p>
            </div>

            {/* 2. Mode Content Panels */}
            {mode === 'month' ? (
              /* Calendar Month Fields */
              <div id="panel-month" role="tabpanel" aria-labelledby="tab-month" className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="budget-month-select" className="form-label">
                    Month
                  </label>
                  <select
                    id="budget-month-select"
                    className="form-control"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    disabled={!!budget && budget.periodType !== 'custom'}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="budget-year-select" className="form-label">
                    Year
                  </label>
                  <select
                    id="budget-year-select"
                    className="form-control"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    disabled={!!budget && budget.periodType !== 'custom'}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* Custom Period Mode Fields */
              <div id="panel-custom" role="tabpanel" aria-labelledby="tab-custom" className="space-y-3">
                {/* Quick Presets Row */}
                <div>
                  <span className="block text-[11px] font-semibold text-ink-soft uppercase tracking-wider mb-1.5">
                    Quick Presets
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Salary Day Preset Chip */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSalaryPicker(!showSalaryPicker)}
                        className={`px-3 py-1 rounded-full text-xs border transition cursor-pointer flex items-center gap-1 ${
                          activePreset === 'salary'
                            ? 'bg-brand-soft text-brand border-brand font-semibold'
                            : 'border-line text-ink-soft hover:border-brand hover:text-ink'
                        }`}
                      >
                        <Calendar className="w-3 h-3 text-brand" />
                        <span>Salary day ({salaryDay})</span>
                      </button>

                      {showSalaryPicker && (
                        <div className="absolute left-0 top-full mt-1.5 z-30 bg-card border border-line rounded-xl p-3 shadow-lg w-52 animate-in fade-in">
                          <span className="block text-xs font-semibold text-ink mb-1.5">
                            Select salary payment day:
                          </span>
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => applySalaryDayPreset(d)}
                                className={`h-6 text-xs rounded transition flex items-center justify-center font-mono ${
                                  salaryDay === d
                                    ? 'bg-brand text-white font-bold'
                                    : 'hover:bg-cream-hover text-ink'
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={applyPresetNext30Days}
                      className={`px-3 py-1 rounded-full text-xs border transition cursor-pointer flex items-center gap-1 ${
                        activePreset === 'next30'
                          ? 'bg-brand-soft text-brand border-brand font-semibold'
                          : 'border-line text-ink-soft hover:border-brand hover:text-ink'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>Next 30 days</span>
                    </button>

                    <button
                      type="button"
                      onClick={applyPresetThisMonth}
                      className={`px-3 py-1 rounded-full text-xs border transition cursor-pointer ${
                        activePreset === 'thisMonth'
                          ? 'bg-brand-soft text-brand border-brand font-semibold'
                          : 'border-line text-ink-soft hover:border-brand hover:text-ink'
                      }`}
                    >
                      This month
                    </button>

                    <button
                      type="button"
                      onClick={applyPresetNextMonth}
                      className={`px-3 py-1 rounded-full text-xs border transition cursor-pointer ${
                        activePreset === 'nextMonth'
                          ? 'bg-brand-soft text-brand border-brand font-semibold'
                          : 'border-line text-ink-soft hover:border-brand hover:text-ink'
                      }`}
                    >
                      Next month
                    </button>
                  </div>
                </div>

                {/* Start Date & End Date Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="budget-start-date" className="form-label">
                      Start date *
                    </label>
                    <input
                      id="budget-start-date"
                      type="date"
                      required
                      min="2000-01-01"
                      max="2100-12-31"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="form-control"
                      aria-invalid={!startDate || !!customDateError}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="budget-end-date" className="form-label">
                      End date *
                    </label>
                    <input
                      id="budget-end-date"
                      type="date"
                      required
                      min={startDate || '2000-01-01'}
                      max="2100-12-31"
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="form-control"
                      aria-invalid={!endDate || !!customDateError}
                    />
                  </div>
                </div>

                {/* Inline Validation Error */}
                {customDateError && (
                  <p className="text-xs text-expense font-semibold" role="alert">
                    {customDateError}
                  </p>
                )}

                {/* Live Summary Line */}
                {isCustomDateValid && (
                  <div className="bg-cream-band border border-line rounded-xl p-3 text-sm text-ink-body">
                    <div className="flex items-center gap-1.5 font-semibold text-ink">
                      <span>{customPeriodLabel}</span>
                      <span className="text-ink-soft">·</span>
                      <span className="text-brand font-mono">{customDaysTotal} days</span>
                      {perDayEstimate !== null && (
                        <>
                          <span className="text-ink-soft">·</span>
                          <span className="text-ink font-medium">about {formatLKR(perDayEstimate)} per day</span>
                        </>
                      )}
                    </div>

                    {customDaysTotal < 7 && (
                      <div className="flex items-center gap-1.5 text-xs text-warn font-semibold mt-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Note: This custom period is shorter than 7 days.</span>
                      </div>
                    )}

                    {customDaysTotal > 62 && (
                      <div className="flex items-center gap-1.5 text-xs text-warn font-semibold mt-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Note: This custom period is longer than 62 days (2 months).</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Target Budget Amount Field */}
            <div className="form-group pt-1">
              <label htmlFor="budget-amount-input" className="form-label">
                Target budget amount ({symbol.trim()}) *
              </label>
              <div className="relative">
                <input
                  ref={amountInputRef}
                  id="budget-amount-input"
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="e.g. 150,000"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  className="form-control font-mono font-bold text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-invalid={displayAmount && !isAmountValid}
                />
              </div>

              {/* Quick-Pick Amount Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] font-semibold text-ink-soft uppercase mr-1">
                  Quick-pick:
                </span>
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetAmount(amt)}
                    className="px-2.5 py-1 rounded-full text-xs font-mono bg-card border border-line hover:border-brand hover:text-brand text-ink-soft transition cursor-pointer"
                  >
                    {symbol}{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <span className="text-xs text-ink-soft mt-1.5 block">
                SpendWise monitors expenses during this period and issues 3-tier proactive threshold alerts.
              </span>
            </div>

            {/* Backend Error Banner (e.g. Overlap 409) */}
            {backendError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-expense/10 border border-expense/30 text-expense text-sm flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{backendError}</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer flex items-center justify-between border-t border-line pt-4 mt-4">
            <div>
              {budget && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(budget._id)}
                  disabled={loading}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-expense hover:bg-expense/10 border border-expense/30 transition flex items-center gap-1 cursor-pointer"
                  title="Delete this budget"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary text-sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-sm min-w-[120px]"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Budget</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
