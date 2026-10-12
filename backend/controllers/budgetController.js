const Budget = require('../models/Budget');

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ year: -1, month: -1 });
    res.json({ success: true, budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get budget for specific month/year
// @route   GET /api/budgets/:year/:month
// @access  Private
const getBudgetByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const budget = await Budget.findOne({
      userId: req.user._id,
      year: parseInt(year),
      month: parseInt(month),
    });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'No budget found for this month.' });
    }
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update a budget
// @route   POST /api/budgets
// @access  Private
const createOrUpdateBudget = async (req, res) => {
  try {
    const { month, year, amount } = req.body;

    if (!month || !year || !amount) {
      return res.status(400).json({ success: false, message: 'Month, year, and amount are required.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Budget amount must be greater than 0.' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month: parseInt(month), year: parseInt(year) },
      { userId: req.user._id, month: parseInt(month), year: parseInt(year), amount },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Budget saved successfully!', budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }
    res.json({ success: true, message: 'Budget deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBudgets, getBudgetByMonth, createOrUpdateBudget, deleteBudget };
