const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Current month date range
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Aggregate all-time totals
    const allTimeAgg = await Transaction.aggregate([
      { $match: { userId: userId } },
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

    // Current month totals
    const monthAgg = await Transaction.aggregate([
      { $match: { userId: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
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

    // Budget for current month
    const budget = await Budget.findOne({ userId, month: currentMonth, year: currentYear });
    const budgetAmount = budget ? budget.amount : 0;
    const budgetRemaining = budgetAmount - monthlyExpenses;

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Expense by category for current month
    const expenseByCategory = await Transaction.aggregate([
      { $match: { userId: userId, type: 'Expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await Transaction.aggregate([
      { $match: { userId: userId, date: { $gte: sixMonthsAgo } } },
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
        budgetRemaining,
        budgetUsagePercent: budgetAmount > 0 ? Math.round((monthlyExpenses / budgetAmount) * 100) : 0,
        currentMonth,
        currentYear,
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
