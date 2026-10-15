require('dotenv').config();
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

describe('SpendWise Delete Account & User Isolation Suite', { timeout: 90000 }, () => {
  let victimUser;
  let survivingUser;
  let victimToken;

  before(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    assert.ok(mongoUri, 'MONGO_URI must be provided in environment variables');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 });
    }

    const emailVictim = 'victim-delete-test@spendwise.lk';
    const emailSurvivor = 'survivor-delete-test@spendwise.lk';

    await User.deleteMany({ email: { $in: [emailVictim, emailSurvivor] } });

    victimUser = await User.create({
      name: 'Victim User',
      email: emailVictim,
      password: 'CorrectPassword123!',
    });

    survivingUser = await User.create({
      name: 'Surviving User',
      email: emailSurvivor,
      password: 'SurvivingPassword123!',
    });

    victimToken = jwt.sign({ id: victimUser._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    // Seed transactions and budgets for victim
    await Transaction.create([
      {
        userId: victimUser._id,
        amount: 50000,
        type: 'Income',
        category: 'Salary',
        date: new Date(),
      },
      {
        userId: victimUser._id,
        amount: 15000,
        type: 'Expense',
        category: 'Housing',
        date: new Date(),
      },
    ]);

    await Budget.create({
      userId: victimUser._id,
      category: 'Housing',
      amount: 20000,
      month: 10,
      year: 2026,
    });

    // Seed transaction for surviving user to test isolation
    await Transaction.create({
      userId: survivingUser._id,
      amount: 500,
      type: 'Expense',
      category: 'Food & Dining',
      date: new Date(),
    });
  });

  after(async () => {
    if (victimUser || survivingUser) {
      const ids = [victimUser?._id, survivingUser?._id].filter(Boolean);
      await Budget.deleteMany({ userId: { $in: ids } });
      await Transaction.deleteMany({ userId: { $in: ids } });
      await User.deleteMany({ _id: { $in: ids } });
    }
    await mongoose.connection.close();
  });

  test('1. Rejects account deletion when password is wrong', async () => {
    let statusCode = null;
    let jsonResult = null;

    const req = {
      user: victimUser,
      body: { password: 'WrongPassword456!', confirmation: 'DELETE' },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await deleteAccount(req, res);

    assert.equal(statusCode, 400);
    assert.equal(jsonResult.success, false);
    assert.match(jsonResult.message, /Incorrect password/i);

    // Verify user and data still exist
    const userStillExists = await User.findById(victimUser._id);
    assert.ok(userStillExists, 'User should not be deleted on wrong password');
  });

  test('2. Successfully deletes user, transactions, and budgets with correct password', async () => {
    let statusCode = null;
    let jsonResult = null;

    const req = {
      user: victimUser,
      body: { password: 'CorrectPassword123!', confirmation: 'DELETE' },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await deleteAccount(req, res);

    assert.equal(statusCode, 200);
    assert.equal(jsonResult.success, true);
    assert.match(jsonResult.message, /permanently deleted/i);

    // Verify victim documents are permanently deleted
    const deletedUser = await User.findById(victimUser._id);
    assert.equal(deletedUser, null, 'Victim User should be deleted');

    const victimTxCount = await Transaction.countDocuments({ userId: victimUser._id });
    assert.equal(victimTxCount, 0, 'Victim transactions should be 0');

    const victimBudgetCount = await Budget.countDocuments({ userId: victimUser._id });
    assert.equal(victimBudgetCount, 0, 'Victim budgets should be 0');

    // Verify surviving user data remains completely untouched
    const survivorUser = await User.findById(survivingUser._id);
    assert.ok(survivorUser, 'Surviving user must still exist');

    const survivorTxCount = await Transaction.countDocuments({ userId: survivingUser._id });
    assert.equal(survivorTxCount, 1, 'Surviving user transactions must be intact');
  });

  test('3. Auth middleware rejects token of deleted user with 401', async () => {
    let statusCode = null;
    let jsonResult = null;
    let nextCalled = false;

    const req = {
      headers: {
        authorization: `Bearer ${victimToken}`,
      },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    await protect(req, res, next);

    assert.equal(nextCalled, false, 'Next should not be called for deleted user token');
    assert.equal(statusCode, 401);
    assert.match(jsonResult.message, /User no longer exists/i);
  });
});
