import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Modular Dashboard Subcomponents
import StatCard from '../components/dashboard/StatCard';
import CashFlowAreaChart from '../components/dashboard/CashFlowAreaChart';
import CategoryDonutChart from '../components/dashboard/CategoryDonutChart';
import BudgetVsSpentChart from '../components/dashboard/BudgetVsSpentChart';
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable';
import QuickActionsCard from '../components/dashboard/QuickActionsCard';
import InsightsCard from '../components/dashboard/InsightsCard';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '../components/common/SkeletonLoader';

// Modals
import TransactionModal from '../components/TransactionModal';
import BudgetModal from '../components/BudgetModal';

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      shortLabel: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    });
  }
  return options;
};

const MONTH_OPTIONS = generateMonthOptions();

const Dashboard = () => {
  useDocumentTitle('Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(MONTH_OPTIONS[0]);

  // Dashboard authentic state
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
    previousMonthIncome: 0,
    previousMonthExpenses: 0,
    previousMonthBalance: 0,
    hasPreviousMonthData: false,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [trendNormalized, setTrendNormalized] = useState([]);

  // Modals state
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
            previousMonthIncome: Number(d.summary.previousMonthIncome) || 0,
            previousMonthExpenses: Number(d.summary.previousMonthExpenses) || 0,
            previousMonthBalance: Number(d.summary.previousMonthBalance) || 0,
            hasPreviousMonthData: Boolean(d.summary.hasPreviousMonthData),
          });
        }

        setRecentTransactions(d.recentTransactions || []);

        setCategoryData(
          (d.expenseByCategory || []).map((cat) => ({
            name: cat._id,
            value: Number(cat.total) || 0,
          }))
        );

        if (d.monthlyTrendNormalized && d.monthlyTrendNormalized.length > 0) {
          setTrendNormalized(d.monthlyTrendNormalized);
          setCashFlowData(d.monthlyTrendNormalized);
        } else if (d.monthlyTrend && d.monthlyTrend.length > 0) {
          const monthMap = {};
          d.monthlyTrend.forEach((item) => {
            const key = `${item._id.month}/${item._id.year}`;
            const mName = new Date(item._id.year, item._id.month - 1, 1).toLocaleString('default', {
              month: 'short',
            });
            if (!monthMap[key]) {
              monthMap[key] = { month: mName, income: 0, expense: 0, net: 0 };
            }
            if (item._id.type === 'Income') monthMap[key].income = item.total;
            if (item._id.type === 'Expense') monthMap[key].expense = item.total;
            monthMap[key].net = monthMap[key].income - monthMap[key].expense;
          });
          const list = Object.values(monthMap).slice(-6);
          setCashFlowData(list);
          setTrendNormalized(list);
        } else {
          setCashFlowData([]);
          setTrendNormalized([]);
        }
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Unable to load live dashboard metrics. Please check your connection.');
      toast.error('Unable to fetch live dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  // Sparkline data series
  const incomeSparkline = trendNormalized.map((t) => t.income || 0);
  const expenseSparkline = trendNormalized.map((t) => t.expense || 0);
  const netSparkline = trendNormalized.map((t) => (t.income || 0) - (t.expense || 0));

  return (
    <div className="space-y-6 lg:space-y-8 dashboard-glow-bg max-w-[1600px] mx-auto">
      {/* Page Header Row (Section B) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-line/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-ink tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Your financial overview for {selectedPeriod.label}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Month Selector Pill */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              value={`${selectedPeriod.month}-${selectedPeriod.year}`}
              onChange={(e) => {
                const [m, y] = e.target.value.split('-').map(Number);
                const opt = MONTH_OPTIONS.find((o) => o.month === m && o.year === y) || {
                  label: `${m}/${y}`,
                  shortLabel: `${m}/${y}`,
                  month: m,
                  year: y,
                };
                setSelectedPeriod(opt);
              }}
              className="w-full sm:w-auto bg-card border border-line hover:border-line-light text-ink text-xs sm:text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer shadow-sm transition appearance-none"
              aria-label="Select month"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft text-xs">
              ▾
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchDashboardData}
            title="Refresh metrics"
            className="p-2.5 bg-card border border-line hover:border-line-light rounded-xl text-ink-soft hover:text-ink transition shadow-sm cursor-pointer"
            aria-label="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>

          {/* Primary Add Transaction CTA Button */}
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsTransModalOpen(true);
            }}
            className="bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-brand/20 flex items-center gap-2 flex-shrink-0 cursor-pointer active:scale-95"
            id="dash-add-trans-btn"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Try Again */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-expense/10 border border-expense/30 flex items-center justify-between gap-3 text-sm text-expense">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-expense text-white rounded-lg text-xs font-semibold hover:bg-expense/90 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Row 1: Four KPI Cards (Section C) */}
      <section aria-labelledby="kpi-metrics-heading">
        <h2 id="kpi-metrics-heading" className="sr-only">
          Key Performance Indicators
        </h2>
        {loading && !summary.totalIncome && !summary.monthlyIncome ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Total Income */}
            <StatCard
              type="income"
              label="Total Income"
              amount={summary.monthlyIncome}
              previousAmount={summary.previousMonthIncome}
              hasPriorData={summary.hasPreviousMonthData}
              sparklineData={incomeSparkline}
              staggerIndex={0}
            />

            {/* Total Expenses */}
            <StatCard
              type="expense"
              label="Total Expenses"
              amount={summary.monthlyExpenses}
              previousAmount={summary.previousMonthExpenses}
              hasPriorData={summary.hasPreviousMonthData}
              sparklineData={expenseSparkline}
              staggerIndex={1}
            />

            {/* Net Balance */}
            <StatCard
              type="balance"
              label="Net Balance"
              amount={summary.monthlyIncome - summary.monthlyExpenses}
              previousAmount={summary.previousMonthBalance}
              hasPriorData={summary.hasPreviousMonthData}
              sparklineData={netSparkline}
              staggerIndex={2}
            />

            {/* Monthly Budget (The Highlighted Card) */}
            <StatCard
              type="budget"
              label="Monthly Budget"
              amount={summary.monthlyExpenses}
              budgetTotal={summary.budgetAmount}
              staggerIndex={3}
              onSetBudget={() => setIsBudgetModalOpen(true)}
            />
          </div>
        )}
      </section>

      {/* Row 2: Three Charts Section (Section D) */}
      <section aria-labelledby="analytics-charts-heading">
        <h2 id="analytics-charts-heading" className="sr-only">
          Financial Analytics Charts
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* 1. Cash Flow Trend (Area Chart) */}
          <div className="lg:col-span-12 xl:col-span-5">
            {loading && cashFlowData.length === 0 ? (
              <ChartSkeleton height="h-[280px] sm:h-[320px] lg:h-[340px]" />
            ) : (
              <CashFlowAreaChart data={cashFlowData} />
            )}
          </div>

          {/* 2. Spending by Category (Donut) */}
          <div className="lg:col-span-6 xl:col-span-3">
            {loading && categoryData.length === 0 ? (
              <ChartSkeleton height="h-[280px] sm:h-[320px] lg:h-[340px]" />
            ) : (
              <CategoryDonutChart
                data={categoryData}
                monthName={selectedPeriod.shortLabel}
              />
            )}
          </div>

          {/* 3. Budget vs Spent / Top Categories */}
          <div className="lg:col-span-6 xl:col-span-4">
            {loading && trendNormalized.length === 0 ? (
              <ChartSkeleton height="h-[280px] sm:h-[320px] lg:h-[340px]" />
            ) : (
              <BudgetVsSpentChart
                trendData={trendNormalized}
                categoryData={categoryData}
                selectedMonth={selectedPeriod.month}
                selectedYear={selectedPeriod.year}
              />
            )}
          </div>
        </div>
      </section>

      {/* Row 3: Recent Transactions & Right Column (Section E) */}
      <section aria-labelledby="ledger-actions-heading">
        <h2 id="ledger-actions-heading" className="sr-only">
          Recent Activity & Actions
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
          {/* Recent Transactions Table (xl:col-span-8) */}
          <div className="xl:col-span-8">
            {loading && recentTransactions.length === 0 ? (
              <TableSkeleton />
            ) : (
              <RecentTransactionsTable
                transactions={recentTransactions}
                monthlyExpenses={summary.monthlyExpenses}
                onEdit={handleEditClick}
                onDelete={handleDeleteTransaction}
                onAddNew={() => {
                  setEditingTransaction(null);
                  setIsTransModalOpen(true);
                }}
              />
            )}
          </div>

          {/* Right Column Stack (xl:col-span-4): Quick Actions & Insights */}
          <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-5">
            <QuickActionsCard
              onAddNew={() => {
                setEditingTransaction(null);
                setIsTransModalOpen(true);
              }}
            />

            <InsightsCard
              expenseByCategory={categoryData.map((c) => ({ _id: c.name, total: c.value }))}
              monthlyExpenses={summary.monthlyExpenses}
              previousMonthExpenses={summary.previousMonthExpenses}
              hasPreviousMonthData={summary.hasPreviousMonthData}
              budgetAmount={summary.budgetAmount}
            />
          </div>
        </div>
      </section>

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
