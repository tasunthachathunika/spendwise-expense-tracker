const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Validates a YYYY-MM-DD string and returns a Date at 00:00:00.000 UTC
 */
const parseDateOnly = (dateStr) => {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Check valid day for this specific month/year
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > maxDay) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

/**
 * Formats a Date object to YYYY-MM-DD using UTC parts
 */
const toDateString = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Formats period label (e.g. "Oct 2026" or "15 Oct to 14 Nov 2026")
 */
const formatPeriodLabel = (startDate, endDate, periodType = 'month', month, year) => {
  if (periodType === 'month' && month && year) {
    return `${MONTH_NAMES_SHORT[month - 1]} ${year}`;
  }
  if (!startDate || !endDate) {
    if (month && year) return `${MONTH_NAMES_SHORT[month - 1]} ${year}`;
    return 'Custom Period';
  }

  if (periodType === 'month') {
    return `${MONTH_NAMES_SHORT[startDate.getUTCMonth()]} ${startDate.getUTCFullYear()}`;
  }

  const sDay = startDate.getUTCDate();
  const sMonth = MONTH_NAMES_SHORT[startDate.getUTCMonth()];
  const sYear = startDate.getUTCFullYear();

  const eDay = endDate.getUTCDate();
  const eMonth = MONTH_NAMES_SHORT[endDate.getUTCMonth()];
  const eYear = endDate.getUTCFullYear();

  if (sYear === eYear) {
    return `${sDay} ${sMonth} to ${eDay} ${eMonth} ${eYear}`;
  }
  return `${sDay} ${sMonth} ${sYear} to ${eDay} ${eMonth} ${eYear}`;
};

/**
 * Tolerant date resolution for existing documents lacking periodType/startDate/endDate
 */
const normalizeBudgetDates = (budget) => {
  let periodType = budget.periodType || 'month';
  let startDate = budget.startDate;
  let endDate = budget.endDate;

  if (!startDate || !endDate) {
    if (budget.month && budget.year) {
      startDate = new Date(Date.UTC(budget.year, budget.month - 1, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(budget.year, budget.month, 0, 0, 0, 0, 0));
      periodType = 'month';
    }
  }

  return { startDate, endDate, periodType };
};

/**
 * Computes day counts and current status for a given period
 */
const computeBudgetDays = (startDate, endDate) => {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const daysTotal = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;

  let daysElapsed = 0;
  let daysLeft = 0;

  if (todayUtc < startDate) {
    daysElapsed = 0;
    daysLeft = daysTotal;
  } else if (todayUtc > endDate) {
    daysElapsed = daysTotal;
    daysLeft = 0;
  } else {
    daysElapsed = Math.round((todayUtc.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
    daysLeft = Math.max(0, Math.round((endDate.getTime() - todayUtc.getTime()) / MS_PER_DAY));
  }

  const isCurrent = todayUtc >= startDate && todayUtc <= endDate;
  return { daysTotal, daysElapsed, daysLeft, isCurrent };
};

/**
 * Checks if a proposed [startDate, endDate] overlaps any existing budget for this user
 */
const checkBudgetOverlap = async (userId, startDate, endDate, excludeBudgetId = null) => {
  const query = { userId };
  if (excludeBudgetId) {
    query._id = { $ne: excludeBudgetId };
  }

  const existingBudgets = await Budget.find(query);

  for (const b of existingBudgets) {
    const { startDate: bStart, endDate: bEnd, periodType: bPeriod } = normalizeBudgetDates(b);
    if (!bStart || !bEnd) continue;

    // Overlap condition for inclusive date intervals:
    // startA <= endB && endA >= startB
    if (startDate <= bEnd && endDate >= bStart) {
      const label = formatPeriodLabel(bStart, bEnd, bPeriod, b.month, b.year);
      return { overlaps: true, label, conflictingBudget: b };
    }
  }

  return { overlaps: false };
};

/**
 * Aggregates spent amount for a list of budgets in a single MongoDB query via $facet
 */
const aggregateBudgetExpenses = async (userId, budgetsList) => {
  if (!budgetsList || budgetsList.length === 0) return {};

  const facetStages = {};
  for (const b of budgetsList) {
    const nextDay = new Date(b.endDate.getTime() + 24 * 60 * 60 * 1000);
    facetStages[b._id.toString()] = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'Expense',
          date: { $gte: b.startDate, $lt: nextDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ];
  }

  const [facetResult] = await Transaction.aggregate([{ $facet: facetStages }]);
  const spentMap = {};
  for (const b of budgetsList) {
    spentMap[b._id.toString()] = facetResult?.[b._id.toString()]?.[0]?.total || 0;
  }
  return spentMap;
};

// @desc    Get all budgets for user with server-computed spent, remaining, and days metrics
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const rawBudgets = await Budget.find({ userId: req.user._id });

    // Normalize each budget's dates & metadata
    const normalizedBudgets = rawBudgets.map((doc) => {
      const b = doc.toObject();
      const { startDate, endDate, periodType } = normalizeBudgetDates(b);
      return {
        ...b,
        startDate,
        endDate,
        periodType,
      };
    });

    // Compute spent across all budgets in a single aggregation request
    const validBudgetsWithDates = normalizedBudgets.filter((b) => b.startDate && b.endDate);
    const spentMap = await aggregateBudgetExpenses(req.user._id, validBudgetsWithDates);

    // Enrich and compute days, remaining, and percentages
    const enrichedBudgets = normalizedBudgets.map((b) => {
      const spent = spentMap[b._id.toString()] || 0;
      const remaining = b.amount - spent;
      const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

      let daysTotal = 0;
      let daysElapsed = 0;
      let daysLeft = 0;
      let isCurrent = false;

      if (b.startDate && b.endDate) {
        const daysMetrics = computeBudgetDays(b.startDate, b.endDate);
        daysTotal = daysMetrics.daysTotal;
        daysElapsed = daysMetrics.daysElapsed;
        daysLeft = daysMetrics.daysLeft;
        isCurrent = daysMetrics.isCurrent;
      }

      return {
        ...b,
        periodType: b.periodType || 'month',
        startDate: b.startDate ? toDateString(b.startDate) : '',
        endDate: b.endDate ? toDateString(b.endDate) : '',
        label: formatPeriodLabel(b.startDate, b.endDate, b.periodType, b.month, b.year),
        daysTotal,
        daysElapsed,
        daysLeft,
        isCurrent,
        spent,
        remaining,
        percent,
      };
    });

    // Sort newest first by startDate descending
    enrichedBudgets.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate + 'T00:00:00.000Z') : new Date(0);
      const dateB = b.startDate ? new Date(b.startDate + 'T00:00:00.000Z') : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    res.json({ success: true, budgets: enrichedBudgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get the active budget whose period contains today (custom or month)
// @route   GET /api/budgets/current
// @access  Private
const getCurrentBudget = async (req, res) => {
  try {
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

    const rawBudgets = await Budget.find({ userId: req.user._id });

    let activeBudget = null;
    let activeDates = null;

    for (const doc of rawBudgets) {
      const b = doc.toObject();
      const { startDate, endDate, periodType } = normalizeBudgetDates(b);
      if (startDate && endDate && todayUtc >= startDate && todayUtc <= endDate) {
        activeBudget = { ...b, periodType };
        activeDates = { startDate, endDate, periodType };
        break;
      }
    }

    if (!activeBudget) {
      return res.json({ success: true, budget: null });
    }

    // Compute spent for this active budget
    const spentMap = await aggregateBudgetExpenses(req.user._id, [
      { _id: activeBudget._id, ...activeDates },
    ]);
    const spent = spentMap[activeBudget._id.toString()] || 0;
    const remaining = activeBudget.amount - spent;
    const percent = activeBudget.amount > 0 ? Math.round((spent / activeBudget.amount) * 100) : 0;
    const daysMetrics = computeBudgetDays(activeDates.startDate, activeDates.endDate);

    const enriched = {
      ...activeBudget,
      periodType: activeDates.periodType,
      startDate: toDateString(activeDates.startDate),
      endDate: toDateString(activeDates.endDate),
      label: formatPeriodLabel(activeDates.startDate, activeDates.endDate, activeDates.periodType, activeBudget.month, activeBudget.year),
      daysTotal: daysMetrics.daysTotal,
      daysElapsed: daysMetrics.daysElapsed,
      daysLeft: daysMetrics.daysLeft,
      isCurrent: true,
      spent,
      remaining,
      percent,
    };

    res.json({ success: true, budget: enriched });
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
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);

    const budget = await Budget.findOne({
      userId: req.user._id,
      year: parsedYear,
      month: parsedMonth,
      periodType: 'month',
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'No budget found for this month.' });
    }

    const { startDate, endDate, periodType } = normalizeBudgetDates(budget);
    const spentMap = await aggregateBudgetExpenses(req.user._id, [{ _id: budget._id, startDate, endDate }]);
    const spent = spentMap[budget._id.toString()] || 0;
    const daysMetrics = computeBudgetDays(startDate, endDate);

    const enriched = {
      ...budget.toObject(),
      periodType,
      startDate: toDateString(startDate),
      endDate: toDateString(endDate),
      label: formatPeriodLabel(startDate, endDate, periodType, budget.month, budget.year),
      daysTotal: daysMetrics.daysTotal,
      daysElapsed: daysMetrics.daysElapsed,
      daysLeft: daysMetrics.daysLeft,
      isCurrent: daysMetrics.isCurrent,
      spent,
      remaining: budget.amount - spent,
      percent: budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0,
    };

    res.json({ success: true, budget: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update a budget (supports calendar-month and custom period)
// @route   POST /api/budgets
// @access  Private
const createOrUpdateBudget = async (req, res) => {
  try {
    const { periodType = 'month', month, year, startDate: rawStartDate, endDate: rawEndDate, amount } = req.body;

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Budget amount must be greater than 0.' });
    }
    if (numAmount > 1000000000) {
      return res.status(400).json({ success: false, message: 'Budget amount cannot exceed 1,000,000,000.' });
    }

    // ─── CUSTOM PERIOD MODE ──────────────────────────────────────────────────
    if (periodType === 'custom') {
      if (!rawStartDate || !rawEndDate) {
        return res.status(400).json({ success: false, message: 'Start date and end date are required for custom periods.' });
      }

      const parsedStart = parseDateOnly(rawStartDate);
      const parsedEnd = parseDateOnly(rawEndDate);

      if (!parsedStart) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start date. Must be YYYY-MM-DD between 2000-01-01 and 2100-12-31.',
        });
      }
      if (!parsedEnd) {
        return res.status(400).json({
          success: false,
          message: 'Invalid end date. Must be YYYY-MM-DD between 2000-01-01 and 2100-12-31.',
        });
      }

      if (parsedEnd < parsedStart) {
        return res.status(400).json({ success: false, message: 'End date must be on or after start date.' });
      }

      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      const periodDays = Math.round((parsedEnd.getTime() - parsedStart.getTime()) / MS_PER_DAY) + 1;
      if (periodDays < 1 || periodDays > 366) {
        return res.status(400).json({
          success: false,
          message: 'Custom period length must be between 1 and 366 days.',
        });
      }

      // Check overlap against existing budgets for this user
      const overlapCheck = await checkBudgetOverlap(req.user._id, parsedStart, parsedEnd);
      if (overlapCheck.overlaps) {
        return res.status(409).json({
          success: false,
          message: `This period overlaps your existing budget (${overlapCheck.label}). Edit or delete that budget first.`,
        });
      }

      const budget = await Budget.create({
        userId: req.user._id,
        periodType: 'custom',
        startDate: parsedStart,
        endDate: parsedEnd,
        amount: numAmount,
      });

      return res.status(201).json({
        success: true,
        message: 'Custom budget saved successfully!',
        budget: {
          ...budget.toObject(),
          startDate: toDateString(parsedStart),
          endDate: toDateString(parsedEnd),
          label: formatPeriodLabel(parsedStart, parsedEnd, 'custom'),
        },
      });
    }

    // ─── CALENDAR-MONTH MODE (Default / Backward-compatible) ─────────────────
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required for monthly budgets.' });
    }

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ success: false, message: 'Month must be between 1 and 12.' });
    }
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return res.status(400).json({ success: false, message: 'Year must be between 2000 and 2100.' });
    }

    const startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(parsedYear, parsedMonth, 0, 0, 0, 0, 0));

    // Find if a month budget already exists for this exact month/year (so we exclude it during overlap check for upsert)
    const existingSameMonthBudget = await Budget.findOne({
      userId: req.user._id,
      month: parsedMonth,
      year: parsedYear,
      periodType: 'month',
    });

    const overlapCheck = await checkBudgetOverlap(
      req.user._id,
      startDate,
      endDate,
      existingSameMonthBudget ? existingSameMonthBudget._id : null
    );

    if (overlapCheck.overlaps) {
      return res.status(409).json({
        success: false,
        message: `This period overlaps your existing budget (${overlapCheck.label}). Edit or delete that budget first.`,
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month: parsedMonth, year: parsedYear, periodType: 'month' },
      {
        userId: req.user._id,
        periodType: 'month',
        month: parsedMonth,
        year: parsedYear,
        startDate,
        endDate,
        amount: numAmount,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully!',
      budget: {
        ...budget.toObject(),
        startDate: toDateString(startDate),
        endDate: toDateString(endDate),
        label: formatPeriodLabel(startDate, endDate, 'month', parsedMonth, parsedYear),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing budget by ID
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found.' });
    }

    const { amount, startDate: rawStartDate, endDate: rawEndDate } = req.body;

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Budget amount must be greater than 0.' });
      }
      if (numAmount > 1000000000) {
        return res.status(400).json({ success: false, message: 'Budget amount cannot exceed 1,000,000,000.' });
      }
      budget.amount = numAmount;
    }

    // If updating dates for a custom budget
    if (budget.periodType === 'custom') {
      let newStart = budget.startDate;
      let newEnd = budget.endDate;

      if (rawStartDate !== undefined) {
        newStart = parseDateOnly(rawStartDate);
        if (!newStart) {
          return res.status(400).json({
            success: false,
            message: 'Invalid start date. Must be YYYY-MM-DD between 2000-01-01 and 2100-12-31.',
          });
        }
      }

      if (rawEndDate !== undefined) {
        newEnd = parseDateOnly(rawEndDate);
        if (!newEnd) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end date. Must be YYYY-MM-DD between 2000-01-01 and 2100-12-31.',
          });
        }
      }

      if (newEnd < newStart) {
        return res.status(400).json({ success: false, message: 'End date must be on or after start date.' });
      }

      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      const periodDays = Math.round((newEnd.getTime() - newStart.getTime()) / MS_PER_DAY) + 1;
      if (periodDays < 1 || periodDays > 366) {
        return res.status(400).json({
          success: false,
          message: 'Custom period length must be between 1 and 366 days.',
        });
      }

      // Check overlap excluding this budget
      const overlapCheck = await checkBudgetOverlap(req.user._id, newStart, newEnd, budget._id);
      if (overlapCheck.overlaps) {
        return res.status(409).json({
          success: false,
          message: `This period overlaps your existing budget (${overlapCheck.label}). Edit or delete that budget first.`,
        });
      }

      budget.startDate = newStart;
      budget.endDate = newEnd;
    }

    await budget.save();

    const { startDate, endDate, periodType } = normalizeBudgetDates(budget);
    res.json({
      success: true,
      message: 'Budget updated successfully!',
      budget: {
        ...budget.toObject(),
        startDate: toDateString(startDate),
        endDate: toDateString(endDate),
        label: formatPeriodLabel(startDate, endDate, periodType, budget.month, budget.year),
      },
    });
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

module.exports = {
  getBudgets,
  getCurrentBudget,
  getBudgetByMonth,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
  // Exported helpers for migration and dashboard
  normalizeBudgetDates,
  computeBudgetDays,
  formatPeriodLabel,
  checkBudgetOverlap,
  parseDateOnly,
  toDateString,
};
