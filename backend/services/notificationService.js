const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const {
  normalizeBudgetDates,
  computeBudgetDays,
  formatPeriodLabel,
  aggregateBudgetExpenses,
} = require('../controllers/budgetController');

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format integer amount with commas (e.g. 108000 -> "108,000")
 */
const formatAmount = (num) => {
  const val = Math.round(Number(num) || 0);
  return val.toLocaleString('en-US');
};

// In-memory throttle cache: userId string -> timestamp of last sync
const syncThrottleMap = new Map();
const THROTTLE_WINDOW_MS = 30 * 1000; // 30 seconds

/**
 * Derives and upserts deterministic notifications based on real budget,
 * transaction, and threshold data for a given user.
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {object} [options]
 * @param {boolean} [options.force=false] Bypass 30-second throttle
 * @returns {Promise<{ synced: boolean, newNotificationsCount: number }>}
 */
const syncNotifications = async (userId, options = {}) => {
  if (!userId) return { synced: false, newNotificationsCount: 0 };
  const userIdStr = userId.toString();

  // 1. Throttle check (unless forced after write)
  const nowMs = Date.now();
  const lastSync = syncThrottleMap.get(userIdStr) || 0;
  if (!options.force && nowMs - lastSync < THROTTLE_WINDOW_MS) {
    return { synced: false, throttled: true, newNotificationsCount: 0 };
  }
  syncThrottleMap.set(userIdStr, nowMs);

  try {
    const userObjectId = new mongoose.Types.ObjectId(userIdStr);

    // 2. Fetch user settings for thresholds
    const user = await User.findById(userObjectId).select('warnThreshold dangerThreshold');
    const warnThreshold = typeof user?.warnThreshold === 'number' ? user.warnThreshold : 70;
    const dangerThreshold = typeof user?.dangerThreshold === 'number' ? user.dangerThreshold : 90;

    // 3. Fetch all budgets for user and normalize dates
    const rawBudgets = await Budget.find({ userId: userObjectId });
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

    const validBudgetsWithDates = normalizedBudgets.filter((b) => b.startDate && b.endDate);
    const spentMap = await aggregateBudgetExpenses(userObjectId, validBudgetsWithDates);

    // 4. Evaluate active budgets covering today
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

    const candidateNotifications = [];
    let hasBudgetCoveringToday = false;

    for (const b of normalizedBudgets) {
      if (!b.startDate || !b.endDate) continue;

      const { daysTotal, daysLeft, isCurrent } = computeBudgetDays(b.startDate, b.endDate);
      const spent = spentMap[b._id.toString()] || 0;
      const budgetAmount = Number(b.amount) || 0;
      const percent = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
      const remaining = budgetAmount - spent;
      const periodLabel = formatPeriodLabel(b.startDate, b.endDate, b.periodType, b.month, b.year);

      if (isCurrent) {
        hasBudgetCoveringToday = true;

        // A. budget_warning: percent reaches warnThreshold and is below dangerThreshold
        if (percent >= warnThreshold && percent < dangerThreshold) {
          candidateNotifications.push({
            userId: userObjectId,
            key: `budget:${b._id}:warn`,
            type: 'budget_warning',
            severity: 'warning',
            title: 'Budget warning',
            message: `You have used ${percent}% of your ${periodLabel} budget (Rs. ${formatAmount(spent)} of Rs. ${formatAmount(budgetAmount)}).`,
            link: '/budgets',
            meta: {
              budgetId: b._id,
              percent,
              spent,
              amount: budgetAmount,
              threshold: warnThreshold,
            },
          });
        }

        // B. budget_critical: percent reaches dangerThreshold and is at most 100
        if (percent >= dangerThreshold && percent <= 100) {
          candidateNotifications.push({
            userId: userObjectId,
            key: `budget:${b._id}:critical`,
            type: 'budget_critical',
            severity: 'danger',
            title: 'Budget critical limit',
            message: `You have used ${percent}% of your budget. Only Rs. ${formatAmount(Math.max(0, remaining))} left.`,
            link: '/budgets',
            meta: {
              budgetId: b._id,
              percent,
              spent,
              amount: budgetAmount,
              remaining: Math.max(0, remaining),
              threshold: dangerThreshold,
            },
          });
        }

        // C. budget_exceeded: percent is strictly above 100
        if (percent > 100) {
          const overAmount = Math.max(0, spent - budgetAmount);
          candidateNotifications.push({
            userId: userObjectId,
            key: `budget:${b._id}:exceeded`,
            type: 'budget_exceeded',
            severity: 'danger',
            title: 'Budget exceeded',
            message: `You are Rs. ${formatAmount(overAmount)} over your budget for ${periodLabel}.`,
            link: '/budgets',
            meta: {
              budgetId: b._id,
              percent,
              spent,
              amount: budgetAmount,
              overAmount,
            },
          });
        }

        // D. budget_ending: budget period ends within 3 days (0 to 3) and not exceeded
        if (daysLeft >= 0 && daysLeft <= 3 && percent <= 100) {
          let daysLeftText = `${daysLeft} days`;
          if (daysLeft === 0) daysLeftText = 'today';
          else if (daysLeft === 1) daysLeftText = '1 day';

          const safeRemaining = Math.max(0, remaining);
          let perDaySnippet = '';
          if (daysLeft > 0) {
            const perDay = Math.round(safeRemaining / daysLeft);
            perDaySnippet = ` (about Rs. ${formatAmount(perDay)} per day)`;
          }

          candidateNotifications.push({
            userId: userObjectId,
            key: `budget:${b._id}:ending`,
            type: 'budget_ending',
            severity: 'info',
            title: 'Budget ending soon',
            message: `Your budget ends in ${daysLeftText}. You still have Rs. ${formatAmount(safeRemaining)} left${perDaySnippet}.`,
            link: '/budgets',
            meta: {
              budgetId: b._id,
              daysLeft,
              remaining: safeRemaining,
            },
          });
        }
      }
    }

    // 5. E. no_budget signal:
    // If user has NO budget covering today, AND user has at least 1 transaction in this calendar month
    if (!hasBudgetCoveringToday) {
      const curYear = now.getFullYear();
      const curMonth = now.getMonth() + 1;
      const monthStart = new Date(Date.UTC(curYear, curMonth - 1, 1, 0, 0, 0, 0));
      const monthEnd = new Date(Date.UTC(curYear, curMonth, 0, 23, 59, 59, 999));

      const hasMonthTx = await Transaction.exists({
        userId: userObjectId,
        date: { $gte: monthStart, $lte: monthEnd },
      });

      if (hasMonthTx) {
        const monthYearKey = `${curYear}-${String(curMonth).padStart(2, '0')}`;
        const monthName = MONTH_NAMES_FULL[curMonth - 1];

        candidateNotifications.push({
          userId: userObjectId,
          key: `no-budget:${monthYearKey}`,
          type: 'no_budget',
          severity: 'info',
          title: 'No budget set',
          message: `You have not set a budget for ${monthName} ${curYear}.`,
          link: '/budgets',
          meta: {
            month: curMonth,
            year: curYear,
          },
        });
      }
    }

    // 6. Idempotently upsert missing notifications
    let insertedCount = 0;
    for (const notif of candidateNotifications) {
      try {
        const res = await Notification.updateOne(
          { userId: notif.userId, key: notif.key },
          {
            $setOnInsert: {
              ...notif,
              readAt: null,
              dismissedAt: null,
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );
        if (res.upsertedCount > 0) {
          insertedCount++;
        }
      } catch (err) {
        // Code 11000 duplicate key error is expected and safe on concurrent sync
        if (err.code !== 11000) {
          console.error('[NotificationService] Upsert error:', err.message);
        }
      }
    }

    // 7. Cap at 200 notifications per user (clean up oldest beyond 200)
    const count = await Notification.countDocuments({ userId: userObjectId });
    if (count > 200) {
      const excess = count - 200;
      const oldestDocs = await Notification.find({ userId: userObjectId })
        .sort({ createdAt: 1 })
        .limit(excess)
        .select('_id');
      const idsToDelete = oldestDocs.map((d) => d._id);
      await Notification.deleteMany({ _id: { $in: idsToDelete } });
    }

    // 8. Update user's lastNotificationSyncAt timestamp
    await User.updateOne({ _id: userObjectId }, { $set: { lastNotificationSyncAt: new Date() } });

    return { synced: true, newNotificationsCount: insertedCount };
  } catch (error) {
    // Non-blocking catch: sync failure must NEVER break calling business logic
    console.error('[NotificationService] syncNotifications error:', error);
    return { synced: false, error: error.message, newNotificationsCount: 0 };
  }
};

/**
 * Fire-and-forget helper to trigger sync after writes without awaiting or failing the response
 */
const triggerNotificationSync = (userId) => {
  if (!userId) return;
  setImmediate(() => {
    syncNotifications(userId, { force: true }).catch((err) => {
      console.error('[NotificationService] Background sync failed:', err);
    });
  });
};

module.exports = {
  syncNotifications,
  triggerNotificationSync,
  formatAmount,
};
