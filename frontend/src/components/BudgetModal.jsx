import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

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

const BudgetModal = ({ isOpen, onClose, onSave, budget = null, initialMonth, initialYear }) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    month: initialMonth || currentDate.getMonth() + 1,
    year: initialYear || currentDate.getFullYear(),
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (budget) {
      setFormData({
        month: budget.month,
        year: budget.year,
        amount: budget.amount || '',
      });
    } else {
      setFormData({
        month: initialMonth || currentDate.getMonth() + 1,
        year: initialYear || currentDate.getFullYear(),
        amount: '',
      });
    }
    if (isOpen) {
      setTimeout(() => amountInputRef.current?.focus(), 50);
    }
  }, [budget, isOpen, initialMonth, initialYear]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid budget amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        amount: numAmount,
      });
      onClose();
    } catch (err) {
      // Error handled by caller
    } finally {
      setLoading(false);
    }
  };

  const currentYear = currentDate.getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {budget ? 'Update Monthly Budget' : 'Set Monthly Budget'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Month</label>
                <select
                  className="form-control"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  disabled={!!budget}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <select
                  className="form-control"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  disabled={!!budget}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Budget Amount (Rs.) *</label>
              <input
                ref={amountInputRef}
                type="number"
                step="1"
                min="1"
                required
                className="form-control"
                placeholder="e.g. 150000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <span className="text-xs text-ink-soft mt-1">
                SpendWise will notify and warn you if your expenses exceed this threshold for the month.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner"></span>}
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
