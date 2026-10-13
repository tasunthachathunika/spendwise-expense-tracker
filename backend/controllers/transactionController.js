const Transaction = require('../models/Transaction');

// @desc    Get all transactions for user (with filters & search)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, page = 1, limit = 20 } = req.query;

    const query = { userId: req.user._id };

    if (type && ['Income', 'Expense'].includes(type)) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, paymentMethod } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ success: false, message: 'Type, amount, category, and date are required.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount,
      category,
      description,
      date,
      paymentMethod,
    });

    res.status(201).json({ success: true, message: 'Transaction created successfully!', transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, paymentMethod } = req.body;
    const updates = {};

    if (type !== undefined) {
      if (!['Income', 'Expense'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Type must be Income or Expense.' });
      }
      updates.type = type;
    }

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
      }
      updates.amount = numAmount;
    }

    if (category !== undefined) updates.category = String(category).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (date !== undefined) updates.date = date;
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.json({ success: true, message: 'Transaction updated successfully!', transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, message: 'Transaction deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get categories for user
// @route   GET /api/transactions/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Transaction.distinct('category', { userId: req.user._id });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTransactions, createTransaction, getTransaction, updateTransaction, deleteTransaction, getCategories };
