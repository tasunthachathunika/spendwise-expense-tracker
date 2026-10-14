import React, { useState, useEffect } from 'react';
import { Plus, Calendar, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/helpers';

// Modular Dashboard Subcomponents
import StatCard from '../components/dashboard/StatCard';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import CategoryDonutChart from '../components/dashboard/CategoryDonutChart';
import CashFlowBarChart from '../components/dashboard/CashFlowBarChart';
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '../components/common/SkeletonLoader';

// Modals
import TransactionModal from '../components/TransactionModal';
import BudgetModal from '../components/BudgetModal';

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    });
  }
  return options;
};

import useDocumentTitle from '../hooks/useDocumentTitle';

const MONTH_OPTIONS = generateMonthOptions();

const Dashboard = () => {
  useDocumentTitle('Dashboard');
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(MONTH_OPTIONS[0]);

  // Dashboard authentic initial state
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    budgetAmount: 0,
    budgetRemaining: 0,
    budgetUsagePercent: 0,
    daysRemaining: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);

  // Modals state
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary', {
        params: {
          month: selectedPeriod.month,
          year: selectedPeriod.year,
        },
      });

      if (res.data?.success) {
        const d = res.data;
        if (d.summary) {
          const now = new Date();
          const daysInMonth = new Date(selectedPeriod.year, selectedPeriod.month, 0).getDate();
          const daysLeft = Math.max(0, daysInMonth - now.getDate());

          setSummary({
            totalIncome: Number(d.summary.totalIncome) || 0,
            totalExpenses: Number(d.summary.totalExpenses) || 0,
            balance: Number(d.summary.balance) || 0,
            monthlyIncome: Number(d.summary.monthlyIncome) || 0,
            monthlyExpenses: Number(d.summary.monthlyExpenses) || 0,
            budgetAmount: Number(d.summary.budgetAmount) || 0,
            budgetRemaining: Number(d.summary.budgetRemaining) || 0,
            budgetUsagePercent: Number(d.summary.budgetUsagePercent) || 0,
            daysRemaining: daysLeft,
          });
        }

        setRecentTransactions(d.recentTransactions || []);

        setCategoryData(
          (d.expenseByCategory || []).map((cat) => ({
            name: cat._id,
            value: cat.total,
          }))
        );

        if (d.monthlyTrend && d.monthlyTrend.length > 0) {
          const monthMap = {};
          d.monthlyTrend.forEach((item) => {
            const key = `${item._id.month}/${item._id.year}`;
            const mName = new Date(item._id.year, item._id.month - 1, 1).toLocaleString('default', {
              month: 'short',
            });
            if (!monthMap[key]) {
              monthMap[key] = { month: mName, income: 0, expense: 0 };
            }
            if (item._id.type === 'Income') monthMap[key].income = item.total;
            if (item._id.type === 'Expense') monthMap[key].expense = item.total;
          });
          setCashFlowData(Object.values(monthMap).slice(-6));
        } else {
          setCashFlowData([]);
        }
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      toast.error('Unable to fetch live dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  // Transaction CRUD handlers
  const handleSaveTransaction = async (formData) => {
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id}`, formData);
        toast.success('Transaction updated successfully!');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction added successfully!');
      }
      setIsTransModalOpen(false);
      setEditingTransaction(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
      throw err;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      await api.post('/budgets', budgetData);
      toast.success('Budget saved successfully!');
      setIsBudgetModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update budget');
      throw err;
    }
  };

  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setIsTransModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Header / Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Financial Overview
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Real-time breakdown of your income, expenses, and budget usage.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Month Selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={`${selectedPeriod.month}-${selectedPeriod.year}`}
              onChange={(e) => {
                const [m, y] = e.target.value.split('-').map(Number);
                const opt = MONTH_OPTIONS.find((o) => o.month === m && o.year === y) || {
                  label: `${m}/${y}`,
                  month: m,
                  year: y,
                };
                setSelectedPeriod(opt);
              }}
              className="w-full sm:w-auto bg-bg-card border border-line text-ink text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-line-light focus:ring-1 focus:ring-brand cursor-pointer"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchDashboardData}
            title="Refresh metrics"
            className="p-2.5 bg-bg-card border border-line hover:border-line-light rounded-xl text-ink-soft hover:text-ink transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>

          {/* Primary CTA Button (Emerald #10b981 with Dark Contrast Text #06251b) */}
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsTransModalOpen(true);
            }}
            className="bg-brand hover:bg-brand-dark text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-brand/20 flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Financial Metric Cards Grid */}
      {loading && !summary.totalIncome ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Income */}
          <StatCard
            type="income"
            label="Total Income"
            amount={summary.totalIncome}
            badgeText={summary.monthlyIncome > 0 ? "Active" : "Logged"}
            badgePositive={true}
            subtitle={summary.monthlyIncome > 0 ? `This month: +${formatCurrency(summary.monthlyIncome)}` : "All-time credited"}
          />

          {/* Total Expenses */}
          <StatCard
            type="expense"
            label="Total Expenses"
            amount={summary.totalExpenses}
            badgeText={summary.monthlyExpenses > 0 ? "Active" : "Logged"}
            badgePositive={false}
            subtitle={summary.monthlyExpenses > 0 ? `This month: -${formatCurrency(summary.monthlyExpenses)}` : "All-time debited"}
          />

          {/* Net Balance (Info / Sky highlight) */}
          <StatCard
            type="balance"
            label="Net Balance"
            amount={summary.balance}
            badgeText={summary.balance >= 0 ? "Surplus" : "Deficit"}
            badgePositive={summary.balance >= 0}
            subtitle={summary.balance >= 0 ? "Positive liquidity" : "Expenses exceed income"}
          />

          {/* Monthly Budget Target */}
          <StatCard
            type="budget"
            label="Monthly Budget"
            amount={summary.budgetAmount}
            badgeText={summary.budgetAmount > 0 ? `${summary.budgetUsagePercent}% used` : "Not Set"}
            badgePositive={summary.budgetRemaining >= 0}
            subtitle={summary.budgetAmount > 0 ? `Remaining: ${formatCurrency(summary.budgetRemaining)}` : "No limit set"}
          />
        </div>
      )}

      {/* Budget Progress & Threshold Indicator (State Rules: 0-70% Emerald, 70-90% Amber, 90%+ Rose) */}
      <BudgetProgress
        budgetAmount={summary.budgetAmount}
        spentAmount={summary.monthlyExpenses}
        daysRemaining={summary.daysRemaining}
        onSetBudget={() => setIsBudgetModalOpen(true)}
      />

      {/* Analytics Charts Section (1/3 Donut Category + 2/3 Cash Flow Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses by Category */}
        <div className="lg:col-span-1">
          {loading && categoryData.length === 0 ? (
            <ChartSkeleton height="h-80" />
          ) : (
            <CategoryDonutChart
              data={categoryData}
              monthName={selectedPeriod.label.split(' ')[0]}
            />
          )}
        </div>

        {/* Cash Flow Analysis (Last 6 Months) */}
        <div className="lg:col-span-2">
          {loading && cashFlowData.length === 0 ? (
            <ChartSkeleton height="h-80" />
          ) : (
            <CashFlowBarChart data={cashFlowData} />
          )}
        </div>
      </div>

      {/* Recent Transactions Table Section */}
      {loading && recentTransactions.length === 0 ? (
        <TableSkeleton />
      ) : (
        <RecentTransactionsTable
          transactions={recentTransactions}
          onEdit={handleEditClick}
          onDelete={handleDeleteTransaction}
          onAddNew={() => {
            setEditingTransaction(null);
            setIsTransModalOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTransModalOpen}
        onClose={() => {
          setIsTransModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        budget={{
          month: selectedPeriod.month,
          year: selectedPeriod.year,
          amount: summary.budgetAmount,
        }}
        initialMonth={selectedPeriod.month}
        initialYear={selectedPeriod.year}
      />
    </div>
  );
};

export default Dashboard;
