const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const {
  normalizeBudgetDates,
  computeBudgetDays,
  formatPeriodLabel,
} = require('./budgetController');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    const targetMonth = req.query.month ? parseInt(req.query.month, 10) : (now.getMonth() + 1);
    const targetYear = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    // Selected month date range (calendar month UTC-safe boundaries)
    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
    const nextMonthStart = new Date(Date.UTC(targetYear, targetMonth, 1, 0, 0, 0, 0));

    // Aggregate all-time totals
    const allTimeAgg = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    allTimeAgg.forEach((item) => {
      if (item._id === 'Income') totalIncome = item.total;
      if (item._id === 'Expense') totalExpenses = item.total;
    });

    // Selected month totals (strictly calendar-month based KPI)
    const monthAgg = await Transaction.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startOfMonth, $lt: nextMonthStart } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    monthAgg.forEach((item) => {
      if (item._id === 'Income') monthlyIncome = item.total;
      if (item._id === 'Expense') monthlyExpenses = item.total;
    });

    // ─── BUDGET CARD RESOLUTION ──────────────────────────────────────────────
    // For CURRENT view (selected period equals today's calendar month):
    // Use active budget covering today (custom or month).
    // For past/future month:
    // Use calendar-month budget of that month if one exists, else any budget overlapping that month.
    const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    const isCurrentView = targetMonth === (now.getMonth() + 1) && targetYear === now.getFullYear();

    let selectedBudget = null;
    let budgetNote = null;

    if (isCurrentView) {
      const allBudgets = await Budget.find({ userId });
      for (const b of allBudgets) {
        const { startDate: bStart, endDate: bEnd } = normalizeBudgetDates(b);
        if (bStart && bEnd && todayUtc >= bStart && todayUtc <= bEnd) {
          selectedBudget = b;
          break;
        }
      }
    } else {
      // 1. Calendar-month budget for selected month
      selectedBudget = await Budget.findOne({
        userId,
        month: targetMonth,
        year: targetYear,
        periodType: 'month',
      });

      // 2. If none exists, check for any custom or overlapping budget in that month
      if (!selectedBudget) {
        const mStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
        const mEnd = new Date(Date.UTC(targetYear, targetMonth, 0, 0, 0, 0, 0));
        const allBudgets = await Budget.find({ userId });
        for (const b of allBudgets) {
          const { startDate: bStart, endDate: bEnd, periodType: bPeriod } = normalizeBudgetDates(b);
          if (bStart && bEnd && bStart <= mEnd && bEnd >= mStart) {
            selectedBudget = b;
            const bLabel = formatPeriodLabel(bStart, bEnd, bPeriod, b.month, b.year);
            budgetNote = `Custom period ${bLabel}`;
            break;
          }
        }
      }
    }

    let budgetAmount = 0;
    let budgetSpent = 0;
    let budgetRemaining = 0;
    let budgetUsagePercent = 0;
    let budgetDaysRemaining = 0;
    let budgetPeriodLabel = null;
    let budgetPeriodType = null;

    if (selectedBudget) {
      const { startDate: bStart, endDate: bEnd, periodType: bPeriod } = normalizeBudgetDates(selectedBudget);
      budgetAmount = selectedBudget.amount;
      budgetPeriodType = bPeriod;
      budgetPeriodLabel = formatPeriodLabel(bStart, bEnd, bPeriod, selectedBudget.month, selectedBudget.year);

      if (bStart && bEnd) {
        const nextDay = new Date(bEnd.getTime() + 24 * 60 * 60 * 1000);
        const expenseAgg = await Transaction.aggregate([
          {
            $match: {
              userId: userObjectId,
              type: 'Expense',
              date: { $gte: bStart, $lt: nextDay },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]);
        budgetSpent = expenseAgg[0]?.total || 0;
        const daysMetrics = computeBudgetDays(bStart, bEnd);
        budgetDaysRemaining = daysMetrics.daysLeft;
      }

      budgetRemaining = budgetAmount - budgetSpent;
      budgetUsagePercent = budgetAmount > 0 ? Math.round((budgetSpent / budgetAmount) * 100) : 0;
    }

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Expense by category for selected month
    const expenseByCategory = await Transaction.aggregate([
      { $match: { userId: userObjectId, type: 'Expense', date: { $gte: startOfMonth, $lt: nextMonthStart } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0));

    const monthlyTrend = await Transaction.aggregate([
      { $match: { userId: userObjectId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses,
        budgetAmount,
        budgetSpent,
        budgetRemaining,
        budgetUsagePercent,
        budgetDaysRemaining,
        budgetPeriodLabel,
        budgetPeriodType,
        budgetNote,
        budgetId: selectedBudget?._id || null,
        currentMonth: targetMonth,
        currentYear: targetYear,
      },
      recentTransactions,
      expenseByCategory,
      monthlyTrend,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get analytics data
// @route   GET /api/dashboard/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;
    const selectedYear = parseInt(year, 10) || new Date().getFullYear();

    // Expense by category (all time)
    const expenseByCategory = await Transaction.aggregate([
      { $match: { userId: userId, type: 'Expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Monthly income vs expense for selected year (UTC boundaries)
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(selectedYear + 1, 0, 1, 0, 0, 0, 0));

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: yearStart, $lt: yearEnd },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Build 12-month array
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(Date.UTC(selectedYear, i, 1)).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      income: 0,
      expense: 0,
    }));

    monthlyData.forEach(({ _id, total }) => {
      const monthIdx = _id.month - 1;
      if (_id.type === 'Income') months[monthIdx].income = total;
      if (_id.type === 'Expense') months[monthIdx].expense = total;
    });

    res.json({ success: true, expenseByCategory, monthlyData: months, selectedYear });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSummary, getAnalytics };
