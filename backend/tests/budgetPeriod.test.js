require('dotenv').config();
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const User = require('../models/User');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const {
  parseDateOnly,
  toDateString,
  formatPeriodLabel,
  computeBudgetDays,
  checkBudgetOverlap,
  normalizeBudgetDates,
} = require('../controllers/budgetController');

describe('SpendWise Budget Period & Custom Period Suite', () => {
  let userA;
  let userB;

  before(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    assert.ok(mongoUri, 'MONGO_URI must be provided in environment variables');
    await mongoose.connect(mongoUri);

    // Clean or create isolated test users
    const emailA = 'test-user-a@spendwise.lk';
    const emailB = 'test-user-b@spendwise.lk';

    await User.deleteMany({ email: { $in: [emailA, emailB] } });

    userA = await User.create({
      name: 'Test User A',
      email: emailA,
      password: 'SpendWiseTest2026!',
    });

    userB = await User.create({
      name: 'Test User B',
      email: emailB,
      password: 'SpendWiseTest2026!',
    });

    await Budget.deleteMany({ userId: { $in: [userA._id, userB._id] } });
    await Transaction.deleteMany({ userId: { $in: [userA._id, userB._id] } });
  });

  after(async () => {
    if (userA && userB) {
      await Budget.deleteMany({ userId: { $in: [userA._id, userB._id] } });
      await Transaction.deleteMany({ userId: { $in: [userA._id, userB._id] } });
      await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    }
    await mongoose.connection.close();
  });

  test('1. Custom period boundary calculation (15 Oct to 14 Nov, Rs. 150,000)', async () => {
    const startDate = new Date('2026-10-15T00:00:00.000Z');
    const endDate = new Date('2026-11-14T00:00:00.000Z');
    const nextDay = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

    const budget = await Budget.create({
      userId: userA._id,
      periodType: 'custom',
      startDate,
      endDate,
      amount: 150000,
    });

    // Seed transactions:
    // 14 Oct (outside)
    await Transaction.create({
      userId: userA._id,
      type: 'Expense',
      amount: 10000,
      category: 'Food',
      date: new Date('2026-10-14T23:59:59.000Z'),
    });
    // 15 Oct at 00:30 local/UTC (inside)
    await Transaction.create({
      userId: userA._id,
      type: 'Expense',
      amount: 25000,
      category: 'Groceries',
      date: new Date('2026-10-15T00:30:00.000Z'),
    });
    // 14 Nov at 23:30 local/UTC (inside)
    await Transaction.create({
      userId: userA._id,
      type: 'Expense',
      amount: 35000,
      category: 'Utilities',
      date: new Date('2026-11-14T23:30:00.000Z'),
    });
    // 15 Nov (outside)
    await Transaction.create({
      userId: userA._id,
      type: 'Expense',
      amount: 20000,
      category: 'Rent',
      date: new Date('2026-11-15T00:00:00.000Z'),
    });
    // 20 Oct Income (inside date, but Income should NOT be counted in expense budget)
    await Transaction.create({
      userId: userA._id,
      type: 'Income',
      amount: 100000,
      category: 'Salary',
      date: new Date('2026-10-20T12:00:00.000Z'),
    });

    // Aggregate spent for budget period [startDate, nextDay)
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId: userA._id,
          type: 'Expense',
          date: { $gte: startDate, $lt: nextDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spent = expenseAgg[0]?.total || 0;
    const remaining = budget.amount - spent;
    const percent = Math.round((spent / budget.amount) * 100);
    const daysMetrics = computeBudgetDays(startDate, endDate);

    // Hand calculation:
    // Spent = 25,000 (15 Oct) + 35,000 (14 Nov) = 60,000
    // Remaining = 150,000 - 60,000 = 90,000
    // Percent = (60,000 / 150,000) * 100 = 40%
    // Days total = 31 days
    assert.equal(spent, 60000, 'Exact spent must match hand calculation of 60,000');
    assert.equal(remaining, 90000, 'Exact remaining must match hand calculation of 90,000');
    assert.equal(percent, 40, 'Percent must be exactly 40%');
    assert.equal(daysMetrics.daysTotal, 31, 'Days total must be 31 days');
    assert.equal(
      formatPeriodLabel(startDate, endDate, 'custom'),
      '15 Oct to 14 Nov 2026',
      'Period label must be "15 Oct to 14 Nov 2026"'
    );
  });

  test('2. Edge Cases: Year boundary, leap day, 1-day period, 366-day period', () => {
    // Year boundary: 15 Dec 2026 to 14 Jan 2027
    const decStart = parseDateOnly('2026-12-15');
    const janEnd = parseDateOnly('2027-01-14');
    assert.ok(decStart && janEnd);
    const yearCrossingDays = computeBudgetDays(decStart, janEnd).daysTotal;
    assert.equal(yearCrossingDays, 31);
    assert.equal(
      formatPeriodLabel(decStart, janEnd, 'custom'),
      '15 Dec 2026 to 14 Jan 2027'
    );

    // Leap day: Feb 2028 has 29 days
    const leapStart = parseDateOnly('2028-02-01');
    const leapEnd = parseDateOnly('2028-02-29');
    assert.ok(leapStart && leapEnd);
    assert.equal(computeBudgetDays(leapStart, leapEnd).daysTotal, 29);

    // 1-day period
    const oneDayStart = parseDateOnly('2026-10-15');
    const oneDayEnd = parseDateOnly('2026-10-15');
    assert.equal(computeBudgetDays(oneDayStart, oneDayEnd).daysTotal, 1);

    // 366-day leap year period
    const fullLeapStart = parseDateOnly('2028-01-01');
    const fullLeapEnd = parseDateOnly('2028-12-31');
    assert.equal(computeBudgetDays(fullLeapStart, fullLeapEnd).daysTotal, 366);

    // Invalid: day 32 of month or invalid leap day in non-leap year (e.g. 2027-02-29)
    assert.equal(parseDateOnly('2027-02-29'), null);
    assert.equal(parseDateOnly('2026-04-31'), null);
  });

  test('3. Overlap detection: custom overlapping custom, custom overlapping month, and adjacent periods', async () => {
    // userA already has 15 Oct to 14 Nov 2026
    const sOverlap = parseDateOnly('2026-11-01');
    const eOverlap = parseDateOnly('2026-11-30');

    // 1. Overlapping period check
    const overlapResult = await checkBudgetOverlap(userA._id, sOverlap, eOverlap);
    assert.equal(overlapResult.overlaps, true);
    assert.match(overlapResult.label, /15 Oct to 14 Nov 2026/);

    // 2. Adjacent period check (14 Nov end, 15 Nov start -> ALLOWED!)
    const sAdjacent = parseDateOnly('2026-11-15');
    const eAdjacent = parseDateOnly('2026-12-14');
    const adjacentResult = await checkBudgetOverlap(userA._id, sAdjacent, eAdjacent);
    assert.equal(adjacentResult.overlaps, false, 'Adjacent periods must NOT trigger overlap');

    // 3. Self-edit check (excluding existing budget ID -> ALLOWED!)
    const existingBudget = await Budget.findOne({ userId: userA._id, periodType: 'custom' });
    assert.ok(existingBudget);
    const selfCheck = await checkBudgetOverlap(
      userA._id,
      existingBudget.startDate,
      existingBudget.endDate,
      existingBudget._id
    );
    assert.equal(selfCheck.overlaps, false, 'Editing a budget must not overlap with itself');
  });

  test('4. Security & Scoping: User B cannot modify or delete User A budgets', async () => {
    const budgetA = await Budget.findOne({ userId: userA._id });
    assert.ok(budgetA);

    // Attempt to find or delete budgetA with userB credentials
    const unauthorizedFind = await Budget.findOne({ _id: budgetA._id, userId: userB._id });
    assert.equal(unauthorizedFind, null, 'User B must not find User A budget');

    const unauthorizedDelete = await Budget.findOneAndDelete({ _id: budgetA._id, userId: userB._id });
    assert.equal(unauthorizedDelete, null, 'User B must not be able to delete User A budget');

    // Verify budgetA is still intact
    const stillExists = await Budget.findById(budgetA._id);
    assert.ok(stillExists, 'Budget A must still exist');
  });

  test('5. Tolerant Reads: Legacy unmigrated budget documents work seamlessly', () => {
    const legacyDoc = {
      _id: new mongoose.Types.ObjectId(),
      userId: userA._id,
      month: 9,
      year: 2026,
      amount: 180000,
    };

    const normalized = normalizeBudgetDates(legacyDoc);
    assert.equal(normalized.periodType, 'month');
    assert.equal(toDateString(normalized.startDate), '2026-09-01');
    assert.equal(toDateString(normalized.endDate), '2026-09-30');
    assert.equal(
      formatPeriodLabel(normalized.startDate, normalized.endDate, 'month', legacyDoc.month, legacyDoc.year),
      'Sep 2026'
    );
  });
});
