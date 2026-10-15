import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Clock,
  Edit2
} from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatLKR, monthName, getBudgetStatus } from '../utils/helpers';
import BudgetModal from '../components/BudgetModal';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useScrollLock } from '../hooks/useScrollLock';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Budgets = () => {
  useDocumentTitle('Budgets');
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useScrollLock(isModalOpen || Boolean(deleteTargetId));

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budgets');
      if (res.data?.success) {
        setBudgets(res.data.budgets || []);
      }
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveBudget = async (budgetData) => {
    try {
      if (budgetData._id && budgetData.periodType === 'custom') {
        await api.put(`/budgets/${budgetData._id}`, budgetData);
        toast.success('Custom budget updated successfully!');
      } else {
        await api.post('/budgets', budgetData);
        toast.success('Budget saved successfully!');
      }
      fetchBudgets();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('spendwise:data-changed'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
      throw err;
    }
  };

  const requestDeleteBudget = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDeleteBudget = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await api.delete(`/budgets/${deleteTargetId}`);
      toast.success('Budget deleted successfully');
      setDeleteTargetId(null);
      setIsModalOpen(false);
      fetchBudgets();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('spendwise:data-changed'));
      }
    } catch (err) {
      toast.error('Failed to delete budget');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreateModal = () => {
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setSelectedBudget(b);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Budgets</h2>
          <p className="page-subtitle">Track and limit spending limits per monthly or custom period</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Set New Budget</span>
        </button>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner spinner-lg"></div>
          <span>Loading budgets...</span>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon flex items-center justify-center mb-2">
              <Target size={36} className="text-ink-soft opacity-70" />
            </div>
            <h4 className="empty-state-title">No budgets established yet</h4>
            <p className="empty-state-text">
              Establish a monthly or custom cycle budget threshold to keep your expenses organized and avoid overspending.
            </p>
            <button className="btn btn-primary mt-2" onClick={openCreateModal}>
              <Plus size={16} />
              <span>Set Your First Budget</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="budget-grid">
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const remaining = b.remaining !== undefined ? b.remaining : b.amount - spent;
            const percent = b.percent !== undefined ? b.percent : (b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0);
            const isCustom = b.periodType === 'custom';
            const isCurrent = b.isCurrent !== undefined
              ? b.isCurrent
              : (!isCustom && b.month === currentMonth && b.year === currentYear);

            const status = getBudgetStatus(spent, b.amount) || {
              statusText: 'On track (0%)',
              barColor: 'bg-income',
              textColor: 'text-income',
              badgeClass: 'bg-income/10 text-income border-income/30',
              isOverBudget: false,
            };

            // Days status label
            let daysLabel = null;
            if (b.daysElapsed === 0 && b.daysLeft > 0) {
              daysLabel = `Starts in ${b.daysLeft}d`;
            } else if (b.daysLeft === 0) {
              daysLabel = 'Ended';
            } else if (b.daysLeft > 0) {
              daysLabel = `${b.daysLeft} days left`;
            }

            return (
              <div 
                key={b._id} 
                className={`budget-card relative ${isCurrent ? 'ring-2 ring-brand/50' : ''}`}
              >
                <div className="budget-card-header">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="budget-month-label font-serif font-bold text-ink text-base">
                        {isCustom ? b.label : (b.label || `${monthName(b.month)} ${b.year}`)}
                      </span>
                      {isCustom && (
                        <span className="text-xs bg-info/10 text-info border border-info/20 font-bold px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs bg-brand-soft text-brand font-bold px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    {daysLabel && (
                      <span className="text-xs text-ink-soft block mt-1">
                        {daysLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="btn btn-icon delete"
                      onClick={() => requestDeleteBudget(b._id)}
                      title="Delete Budget"
                      aria-label={`Delete ${b.label || 'budget'}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* 3-Tier Threshold Status Badge */}
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold mb-3 px-2.5 py-1 rounded-full border ${status.badgeClass}`}>
                  {status.isOverBudget || percent >= 90 ? (
                    <AlertTriangle size={14} className="flex-shrink-0" />
                  ) : (
                    <CheckCircle2 size={14} className="flex-shrink-0" />
                  )}
                  <span>{status.statusText}</span>
                </div>

                {/* Amount details */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Target Budget:</span>
                    <span className="font-bold text-ink">{formatLKR(b.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Total Spent:</span>
                    <span className={`font-bold ${status.textColor}`}>
                      {formatLKR(spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Remaining:</span>
                    <span className={`font-bold ${status.isOverBudget ? 'text-expense' : 'text-income'}`}>
                      {formatLKR(remaining)}
                    </span>
                  </div>
                </div>

                {/* Progress bar with theme tokens */}
                <div className="progress-bar-track">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${status.barColor}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-line">
                  <span className="text-xs text-ink-soft">Usage: {percent}%</span>
                  <button
                    className="btn btn-sm btn-secondary text-xs flex items-center gap-1"
                    onClick={() => openEditModal(b)}
                  >
                    <Edit2 size={12} />
                    <span>Adjust Budget</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set / Adjust Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBudget}
        onDelete={requestDeleteBudget}
        budget={selectedBudget}
        initialMonth={currentMonth}
        initialYear={currentYear}
      />

      {/* Accessible Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Budget Threshold"
        message="Are you sure you want to delete this budget limit? You can establish a new calendar-month or custom period budget at any time."
        confirmText="Delete Budget"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteBudget}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default Budgets;
