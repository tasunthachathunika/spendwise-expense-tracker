require('dotenv').config();
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { syncNotifications } = require('../services/notificationService');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
} = require('../controllers/notificationController');
const { deleteAccount } = require('../controllers/authController');

describe('SpendWise Notifications Suite', { timeout: 240000 }, () => {
  let userA;
  let userB;
  let tokenA;
  let tokenB;
  let budgetA;

  before(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    assert.ok(mongoUri, 'MONGO_URI must be provided in environment variables');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 });
    }

    const emailA = 'notif-test-user-a@spendwise.lk';
    const emailB = 'notif-test-user-b@spendwise.lk';

    await User.deleteMany({ email: { $in: [emailA, emailB] } });

    userA = await User.create({
      name: 'Notif User A',
      email: emailA,
      password: 'NotifPassword123!',
      warnThreshold: 70,
      dangerThreshold: 90,
    });

    userB = await User.create({
      name: 'Notif User B',
      email: emailB,
      password: 'NotifPassword123!',
    });

    tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    // Clean any residual test data
    const userIds = [userA._id, userB._id];
    await Budget.deleteMany({ userId: { $in: userIds } });
    await Transaction.deleteMany({ userId: { $in: userIds } });
    await Notification.deleteMany({ userId: { $in: userIds } });

    // Create current monthly budget for user A of Rs. 100,000
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const startDate = new Date(Date.UTC(curYear, curMonth - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(curYear, curMonth, 0, 0, 0, 0, 0));

    budgetA = await Budget.create({
      userId: userA._id,
      periodType: 'month',
      month: curMonth,
      year: curYear,
      startDate,
      endDate,
      amount: 100000,
    });
  });

  after(async () => {
    if (userA || userB) {
      const ids = [userA?._id, userB?._id].filter(Boolean);
      await Notification.deleteMany({ userId: { $in: ids } });
      await Budget.deleteMany({ userId: { $in: ids } });
      await Transaction.deleteMany({ userId: { $in: ids } });
      await User.deleteMany({ _id: { $in: ids } });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  test('1. At 60% spent (Rs. 60,000), no warning or critical notifications generated', async () => {
    await Transaction.create({
      userId: userA._id,
      amount: 60000,
      type: 'Expense',
      category: 'Shopping',
      date: new Date(),
    });

    const syncResult = await syncNotifications(userA._id, { force: true });
    assert.equal(syncResult.synced, true);

    const notifs = await Notification.find({ userId: userA._id });
    assert.equal(notifs.length, 0, 'No warning should be triggered at 60% with 70% threshold');
  });

  test('2. At 75% spent (Rs. 75,000 total), budget_warning notification generated once', async () => {
    await Transaction.create({
      userId: userA._id,
      amount: 15000,
      type: 'Expense',
      category: 'Dining',
      date: new Date(),
    });

    const syncResult = await syncNotifications(userA._id, { force: true });
    assert.equal(syncResult.synced, true);

    const notifs = await Notification.find({ userId: userA._id, type: 'budget_warning' });
    assert.equal(notifs.length, 1, 'Exactly one budget_warning notification should exist');
    assert.equal(notifs[0].severity, 'warning');
    assert.match(notifs[0].message, /75%/);
    assert.equal(notifs[0].key, `budget:${budgetA._id}:warn`);
  });

  test('3. Idempotency: multiple syncs do not duplicate budget_warning', async () => {
    // Run sync 5 times concurrently
    await Promise.all([
      syncNotifications(userA._id, { force: true }),
      syncNotifications(userA._id, { force: true }),
      syncNotifications(userA._id, { force: true }),
    ]);

    const count = await Notification.countDocuments({ userId: userA._id, key: `budget:${budgetA._id}:warn` });
    assert.equal(count, 1, 'Unique key constraint prevents duplicate notifications');
  });

  test('4. At 95% spent (Rs. 95,000 total), budget_critical notification generated', async () => {
    await Transaction.create({
      userId: userA._id,
      amount: 20000,
      type: 'Expense',
      category: 'Electronics',
      date: new Date(),
    });

    await syncNotifications(userA._id, { force: true });

    const criticalNotifs = await Notification.find({ userId: userA._id, type: 'budget_critical' });
    assert.equal(criticalNotifs.length, 1, 'budget_critical notification generated');
    assert.equal(criticalNotifs[0].severity, 'danger');
    assert.match(criticalNotifs[0].message, /95%/);
    assert.match(criticalNotifs[0].message, /5,000 left/);
  });

  test('5. At 105% spent (Rs. 105,000 total), budget_exceeded notification generated', async () => {
    await Transaction.create({
      userId: userA._id,
      amount: 10000,
      type: 'Expense',
      category: 'Utilities',
      date: new Date(),
    });

    await syncNotifications(userA._id, { force: true });

    const exceededNotifs = await Notification.find({ userId: userA._id, type: 'budget_exceeded' });
    assert.equal(exceededNotifs.length, 1, 'budget_exceeded notification generated');
    assert.equal(exceededNotifs[0].severity, 'danger');
    assert.match(exceededNotifs[0].message, /5,000 over/);
  });

  test('6. Mark as read and read-all update readAt without changing count or deletion', async () => {
    const unread = await Notification.findOne({ userId: userA._id, readAt: null });
    assert.ok(unread, 'Should have an unread notification');

    // Mark single as read
    const req = { params: { id: unread._id.toString() }, user: userA };
    let jsonRes = null;
    const res = { json: (d) => { jsonRes = d; } };
    await markAsRead(req, res);
    assert.equal(jsonRes.success, true);
    assert.ok(jsonRes.data.readAt !== null);

    // Mark all as read
    const reqAll = { user: userA };
    let jsonResAll = null;
    const resAll = { json: (d) => { jsonResAll = d; } };
    await markAllAsRead(reqAll, resAll);
    assert.equal(jsonResAll.success, true);

    const remainingUnread = await Notification.countDocuments({ userId: userA._id, dismissedAt: null, readAt: null });
    assert.equal(remainingUnread, 0);
  });

  test('7. Dismiss notification sets dismissedAt; User B cannot dismiss User A notification', async () => {
    const notif = await Notification.findOne({ userId: userA._id });
    assert.ok(notif);

    // User B attempts to dismiss User A's notification -> 404 (ownership check)
    let bStatus = null;
    let bJson = null;
    const reqB = {
      params: { id: notif._id.toString() },
      user: userB,
    };
    const resB = {
      status(code) { bStatus = code; return this; },
      json(d) { bJson = d; },
    };
    await dismissNotification(reqB, resB);
    assert.equal(bStatus, 404, 'User B cannot dismiss User A notification');

    // User A dismisses their own notification
    let aJson = null;
    const reqA = {
      params: { id: notif._id.toString() },
      user: userA,
    };
    const resA = {
      json(d) { aJson = d; },
    };
    await dismissNotification(reqA, resA);
    assert.equal(aJson.success, true);

    const updated = await Notification.findById(notif._id);
    assert.ok(updated.dismissedAt !== null, 'Dismissed notification has dismissedAt timestamp');
  });

  test('8. Account deletion permanently deletes all user notifications', async () => {
    const countBefore = await Notification.countDocuments({ userId: userA._id });
    assert.ok(countBefore > 0, 'User A should have notifications before deletion');

    const req = {
      user: userA,
      body: { password: 'NotifPassword123!', confirmation: 'DELETE' },
    };
    let jsonResult = null;
    const res = {
      status: () => res,
      json: (d) => { jsonResult = d; },
    };

    await deleteAccount(req, res);
    assert.equal(jsonResult.success, true);

    const countAfter = await Notification.countDocuments({ userId: userA._id });
    assert.equal(countAfter, 0, 'All user notifications must be deleted on account deletion');
  });
});
