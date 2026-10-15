const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { notificationRateLimiter } = require('../middleware/security');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  dismissAllRead,
} = require('../controllers/notificationController');

// All notification routes are protected by JWT and rate limited
router.use(protect);
router.use(notificationRateLimiter);

router.route('/')
  .get(getNotifications)
  .delete(dismissAllRead);

router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);

router.route('/:id/read')
  .patch(markAsRead);

router.route('/:id')
  .delete(dismissNotification);

module.exports = router;
