import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toInputDate, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/helpers';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Debit Card',
  'Credit Card',
  'Online Payment',
];

const TransactionModal = ({ isOpen, onClose, onSave, transaction = null }) => {
  const [formData, setFormData] = useState({
    type: 'Expense',
    amount: '',
    category: '',
    description: '',
    date: toInputDate(new Date()),
    paymentMethod: 'Debit Card',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'Expense',
        amount: transaction.amount || '',
        category: transaction.category || '',
        description: transaction.description || '',
        date: toInputDate(transaction.date) || toInputDate(new Date()),
        paymentMethod: transaction.paymentMethod || 'Debit Card',
      });
    } else {
      setFormData({
        type: 'Expense',
        amount: '',
        category: 'Food',
        description: '',
        date: toInputDate(new Date()),
        paymentMethod: 'Debit Card',
      });
    }
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const categories = formData.type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations: amount > 0, category and date required
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    if (!formData.category.trim()) {
      toast.error('Category is required');
      return;
    }
    if (!formData.date) {
      toast.error('Date is required');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        amount: numAmount,
      });
      onClose();
    } catch (err) {
      // Error handled by caller
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type selector toggle */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-toggle-btn ${formData.type === 'Expense' ? 'active expense' : ''}`}
                  onClick={() => setFormData({ ...formData, type: 'Expense', category: 'Food' })}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`type-toggle-btn ${formData.type === 'Income' ? 'active income' : ''}`}
                  onClick={() => setFormData({ ...formData, type: 'Income', category: 'Salary' })}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount (Rs.) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-control"
                placeholder="e.g. 5000.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            {/* Category and Payment Method */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  required
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-control"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Grocery shopping at Trader Joe's"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner"></span>}
              {loading ? 'Saving...' : transaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
