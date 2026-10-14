const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    const targetMonth = req.query.month ? parseInt(req.query.month) : (now.getMonth() + 1);
    const targetYear = req.query.year ? parseInt(req.query.year) : now.getFullYear();

    // Selected month date range
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

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

    // Selected month totals
    const monthAgg = await Transaction.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
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

    // Previous month totals (for authentic delta calculations)
    const prevMonthNum = targetMonth === 1 ? 12 : targetMonth - 1;
    const prevYearNum = targetMonth === 1 ? targetYear - 1 : targetYear;
    const startOfPrevMonth = new Date(prevYearNum, prevMonthNum - 1, 1);
    const endOfPrevMonth = new Date(prevYearNum, prevMonthNum, 0, 23, 59, 59, 999);

    const prevMonthAgg = await Transaction.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let previousMonthIncome = 0;
    let previousMonthExpenses = 0;
    let hasPreviousMonthData = false;
    if (prevMonthAgg.length > 0) {
      hasPreviousMonthData = true;
      prevMonthAgg.forEach((item) => {
        if (item._id === 'Income') previousMonthIncome = item.total;
        if (item._id === 'Expense') previousMonthExpenses = item.total;
      });
    }

    // Budget for selected month
    const budget = await Budget.findOne({ userId, month: targetMonth, year: targetYear });
    const budgetAmount = budget ? budget.amount : 0;
    const budgetRemaining = budgetAmount - monthlyExpenses;

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Expense by category for selected month
    const expenseByCategory = await Transaction.aggregate([
      { $match: { userId: userObjectId, type: 'Expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly trend for the 6 months ending at targetMonth/targetYear
    const monthsInWindow = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetYear, targetMonth - 1 - i, 1);
      monthsInWindow.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        monthName: d.toLocaleString('en-US', { month: 'short' }),
      });
    }

    const startOfWindow = new Date(monthsInWindow[0].year, monthsInWindow[0].month - 1, 1, 0, 0, 0, 0);
    const endOfWindow = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const monthlyTrendAgg = await Transaction.aggregate([
      { $match: { userId: userObjectId, date: { $gte: startOfWindow, $lte: endOfWindow } } },
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

    // Fetch budgets in the 6-month window to support real 6-month stacked budget chart
    const budgetsInWindow = await Budget.find({
      userId: userObjectId,
      $or: monthsInWindow.map((m) => ({ month: m.month, year: m.year })),
    });

    const budgetMap = {};
    budgetsInWindow.forEach((b) => {
      budgetMap[`${b.month}/${b.year}`] = b.amount;
    });

    // Build continuous 6-month trend array
    const normalizedTrend = monthsInWindow.map((m) => {
      let income = 0;
      let expense = 0;
      monthlyTrendAgg.forEach((item) => {
        if (item._id.year === m.year && item._id.month === m.month) {
          if (item._id.type === 'Income') income = item.total;
          if (item._id.type === 'Expense') expense = item.total;
        }
      });
      const budgetForMonth = budgetMap[`${m.month}/${m.year}`] || 0;
      return {
        month: m.monthName,
        monthNum: m.month,
        year: m.year,
        income,
        expense,
        net: income - expense,
        budget: budgetForMonth,
      };
    });

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses,
        budgetAmount,
        budgetRemaining,
        budgetUsagePercent: budgetAmount > 0 ? Math.round((monthlyExpenses / budgetAmount) * 100) : 0,
        currentMonth: targetMonth,
        currentYear: targetYear,
        previousMonthIncome,
        previousMonthExpenses,
        previousMonthBalance: previousMonthIncome - previousMonthExpenses,
        hasPreviousMonthData,
      },
      recentTransactions,
      expenseByCategory,
      monthlyTrend: monthlyTrendAgg,
      monthlyTrendNormalized: normalizedTrend,
      budgetsHistory: budgetsInWindow,
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
    const selectedYear = parseInt(year) || new Date().getFullYear();

    // Expense by category (all time)
    const expenseByCategory = await Transaction.aggregate([
      { $match: { userId: userId, type: 'Expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Monthly income vs expense for selected year
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: new Date(selectedYear, 0, 1), $lte: new Date(selectedYear, 11, 31, 23, 59, 59) },
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
      monthName: new Date(selectedYear, i, 1).toLocaleString('default', { month: 'short' }),
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
