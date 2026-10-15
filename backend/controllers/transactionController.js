const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { triggerNotificationSync } = require('../services/notificationService');

/**
 * Escapes regex special characters to prevent ReDoS / regex injection.
 */
const escapeRegex = (str = '') => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Shared filter builder for list, export, and summary.
 * Guarantees consistent query scoping to req.user._id and uniform filter semantics.
 */
const buildTransactionFilter = (userId, queryParams = {}) => {
  const query = { userId };
  const { type, category, startDate, endDate, search, minAmount, maxAmount } = queryParams;

  // Type filter: whitelisted enum
  if (type && ['Income', 'Expense'].includes(type)) {
    query.type = type;
  }

  // Category filter: case-insensitive match on escaped string
  if (category && typeof category === 'string' && category.trim()) {
    query.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' };
  }

  // Search filter: escaped regex across description, category, and notes
  if (search && typeof search === 'string' && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    query.$or = [
      { description: { $regex: safeSearch, $options: 'i' } },
      { category: { $regex: safeSearch, $options: 'i' } },
      { notes: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  // Date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        query.date.$gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    if (Object.keys(query.date).length === 0) {
      delete query.date;
    }
  }

  // Min / Max Amount filter
  if (minAmount !== undefined || maxAmount !== undefined) {
    query.amount = {};
    if (minAmount !== undefined && minAmount !== '') {
      const minVal = parseFloat(minAmount);
      if (!isNaN(minVal) && minVal >= 0) query.amount.$gte = minVal;
    }
    if (maxAmount !== undefined && maxAmount !== '') {
      const maxVal = parseFloat(maxAmount);
      if (!isNaN(maxVal) && maxVal >= 0) query.amount.$lte = maxVal;
    }
    if (Object.keys(query.amount).length === 0) {
      delete query.amount;
    }
  }

  return query;
};

// @desc    Get all transactions for user (with validated pagination, sort & filters)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const filter = buildTransactionFilter(req.user._id, req.query);

    // Validate page
    const parsedPage = parseInt(req.query.page, 10);
    const page = !isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

    // Validate limit (10, 25, 50, 100 with default 10; preserve 1 and 500 for backward compatibility)
    const allowedLimits = [10, 25, 50, 100];
    const rawLimit = parseInt(req.query.limit, 10);
    let limit = 10;
    if (allowedLimits.includes(rawLimit)) {
      limit = rawLimit;
    } else if (rawLimit === 1 || rawLimit === 500) {
      limit = rawLimit;
    }

    // Validate sort & order with stable tiebreaker (_id)
    const allowedSorts = ['date', 'amount', 'category', 'createdAt'];
    const sortField = allowedSorts.includes(req.query.sort) ? req.query.sort : 'date';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortOrder, _id: sortOrder };

    const skip = (page - 1) * limit;

    // Execute count, paginated list, and summary aggregation in parallel
    const [total, transactions, summaryAgg] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter).sort(sortObj).skip(skip).limit(limit),
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            income: {
              $sum: { $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0] },
            },
            expense: {
              $sum: { $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0] },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    // If page exceeds totalPages, return empty list with valid pagination metadata (no error)
    const returnList = page > totalPages ? [] : transactions;

    const summaryData = summaryAgg[0] || { income: 0, expense: 0, count: 0 };
    const totalIncome = summaryData.income || 0;
    const totalExpense = summaryData.expense || 0;

    res.json({
      success: true,
      data: returnList,
      transactions: returnList, // Backward-compatible alias
      count: returnList.length,
      total,
      page,
      pages: totalPages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      summary: {
        income: totalIncome,
        expense: totalExpense,
        net: totalIncome - totalExpense,
        count: summaryData.count || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Sanitizes a cell for RFC 4180 CSV compliance and formula injection prevention.
 */
const sanitizeCsvCell = (val) => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  // Neutralize CSV formula injection: prefix =, +, -, @, \t, \r with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Wrap in double quotes if string contains comma, quote, or newline
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// @desc    Export transactions (CSV / JSON) scoped to user with active filters
// @route   GET /api/transactions/export
// @access  Private
const exportTransactions = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    const filter = buildTransactionFilter(req.user._id, req.query);

    // Validate sort & order to match list endpoint
    const allowedSorts = ['date', 'amount', 'category', 'createdAt'];
    const sortField = allowedSorts.includes(req.query.sort) ? req.query.sort : 'date';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortOrder, _id: sortOrder };

    if (format === 'json') {
      // JSON endpoint for client-side PDF generator (capped at 2,000 records)
      const MAX_PDF_ROWS = 2000;
      const [total, transactions] = await Promise.all([
        Transaction.countDocuments(filter),
        Transaction.find(filter).sort(sortObj).limit(MAX_PDF_ROWS),
      ]);

      return res.json({
        success: true,
        count: transactions.length,
        total,
        capped: total > MAX_PDF_ROWS,
        maxRows: MAX_PDF_ROWS,
        transactions,
      });
    }

    // Default: CSV export (server-side stream/build, capped at safe 10,000 records)
    const MAX_CSV_ROWS = 10000;
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter).sort(sortObj).limit(MAX_CSV_ROWS),
    ]);

    // Build CSV with UTF-8 BOM so Microsoft Excel renders Unicode correctly
    let csv = '\uFEFF';
    if (total > MAX_CSV_ROWS) {
      csv += `# Warning: Results capped at ${MAX_CSV_ROWS} records of ${total} total matching transactions.\r\n`;
    }
    // CSV Header row
    csv += 'Date,Title,Type,Category,Payment Method,Amount,Notes\r\n';

    for (const tx of transactions) {
      const dateStr = tx.date ? new Date(tx.date).toISOString().split('T')[0] : '';
      const title = tx.description || '';
      const type = tx.type || '';
      const category = tx.category || '';
      const paymentMethod = tx.paymentMethod || '';
      const amount = Number(tx.amount || 0).toFixed(2);
      const notes = tx.notes || '';

      const row = [
        sanitizeCsvCell(dateStr),
        sanitizeCsvCell(title),
        sanitizeCsvCell(type),
        sanitizeCsvCell(category),
        sanitizeCsvCell(paymentMethod),
        sanitizeCsvCell(amount),
        sanitizeCsvCell(notes),
      ].join(',');

      csv += row + '\r\n';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="spendwise-transactions-${todayStr}.csv"`);
    if (total > MAX_CSV_ROWS) {
      res.setHeader('X-Export-Truncated', 'true');
      res.setHeader('X-Export-Total', total.toString());
    }

    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk delete transactions
// @route   DELETE /api/transactions/bulk
// @access  Private
const bulkDeleteTransactions = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of transaction IDs to delete.' });
    }
    if (ids.length > 100) {
      return res.status(400).json({ success: false, message: 'Cannot bulk delete more than 100 transactions at once.' });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid transaction IDs provided.' });
    }

    // Scoped strictly to authenticated user
    const result = await Transaction.deleteMany({
      _id: { $in: validIds },
      userId: req.user._id,
    });

    triggerNotificationSync(req.user._id);

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} transaction${result.deletedCount === 1 ? '' : 's'}.`,
      deletedCount: result.deletedCount,
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
    const { type, amount, category, description, date, paymentMethod, notes } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ success: false, message: 'Type, amount, category, and date are required.' });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: numAmount,
      category: String(category).trim(),
      description: description ? String(description).trim() : '',
      date,
      paymentMethod: paymentMethod || 'Cash',
      notes: notes ? String(notes).trim().slice(0, 200) : '',
    });

    triggerNotificationSync(req.user._id);

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
    const { type, amount, category, description, date, paymentMethod, notes } = req.body;
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
    if (notes !== undefined) updates.notes = String(notes).trim().slice(0, 200);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    triggerNotificationSync(req.user._id);

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
    triggerNotificationSync(req.user._id);

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

module.exports = {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  exportTransactions,
  bulkDeleteTransactions,
  buildTransactionFilter,
};
