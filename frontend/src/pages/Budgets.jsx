import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, monthName } from '../utils/helpers';
import BudgetModal from '../components/BudgetModal';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [expensesByMonth, setExpensesByMonth] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const fetchBudgetsAndExpenses = async () => {
    try {
      setLoading(true);
      const [budgetsRes, summaryRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/dashboard/summary'),
      ]);

      if (budgetsRes.data.success) {
        setBudgets(budgetsRes.data.budgets);
      }

      // We can also fetch all transactions or calculate expenses per month
      const txRes = await api.get('/transactions?limit=500&type=Expense');
      if (txRes.data.success) {
        const expenseMap = {};
        txRes.data.transactions.forEach((tx) => {
          const d = new Date(tx.date);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          expenseMap[key] = (expenseMap[key] || 0) + tx.amount;
        });
        setExpensesByMonth(expenseMap);
      }
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetsAndExpenses();
  }, []);

  const handleSaveBudget = async (budgetData) => {
    try {
      await api.post('/budgets', budgetData);
      toast.success('Budget saved successfully!');
      fetchBudgetsAndExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
      throw err;
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget plan?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      fetchBudgetsAndExpenses();
    } catch (err) {
      toast.error('Failed to delete budget');
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
          <h2 className="page-title">Monthly Budgets</h2>
          <p className="page-subtitle">Track and limit spending limits per month</p>
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
            <div className="empty-state-icon">🎯</div>
            <h4 className="empty-state-title">No budgets established yet</h4>
            <p className="empty-state-text">
              Establish a monthly budget threshold to keep your expenses organized and avoid overspending.
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
            const key = `${b.year}-${b.month}`;
            const spent = expensesByMonth[key] || 0;
            const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
            const isExceeded = spent > b.amount;
            const isCurrent = b.month === currentMonth && b.year === currentYear;

            return (
              <div 
                key={b._id} 
                className={`budget-card relative ${isCurrent ? 'ring-2 ring-brand/50' : ''}`}
              >
                <div className="budget-card-header">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="budget-month-label">
                        {monthName(b.month)} {b.year}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-brand-soft text-brand font-bold px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="btn btn-icon delete"
                      onClick={() => handleDeleteBudget(b._id)}
                      title="Delete Budget"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Warning badge if exceeded */}
                {isExceeded ? (
                  <div className="budget-exceeded-badge mb-3">
                    <AlertTriangle size={14} />
                    <span>Budget Exceeded</span>
                  </div>
                ) : percent >= 90 ? (
                  <div className="budget-exceeded-badge mb-3">
                    <AlertTriangle size={14} />
                    <span>Critical Limit ({percent}%)</span>
                  </div>
                ) : percent >= 70 ? (
                  <div className="inline-flex items-center gap-1 text-xs text-warn font-semibold mb-3">
                    <AlertTriangle size={14} />
                    <span>Nearing Limit ({percent}%)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 text-xs text-income font-semibold mb-3">
                    <CheckCircle2 size={14} />
                    <span>On Track ({percent}%)</span>
                  </div>
                )}

                {/* Amount details */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Target Budget:</span>
                    <span className="font-bold text-ink">{formatCurrency(b.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Total Spent:</span>
                    <span className={`font-bold ${isExceeded || percent >= 90 ? 'text-expense' : 'text-ink-body'}`}>
                      {formatCurrency(spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Remaining:</span>
                    <span className={`font-bold ${isExceeded ? 'text-expense' : 'text-income'}`}>
                      {formatCurrency(b.amount - spent)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${isExceeded || percent >= 90 ? 'exceeded' : percent >= 70 ? 'warning' : 'safe'}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-line">
                  <span className="text-xs text-ink-soft">Usage: {percent}%</span>
                  <button
                    className="btn btn-sm btn-secondary text-xs"
                    onClick={() => openEditModal(b)}
                  >
                    Adjust Budget
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set/Edit Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBudget}
        budget={selectedBudget}
        initialMonth={currentMonth}
        initialYear={currentYear}
      />
    </div>
  );
};

export default Budgets;
