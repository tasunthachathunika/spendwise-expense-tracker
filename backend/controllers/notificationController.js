const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { syncNotifications } = require('../services/notificationService');

/**
 * Validates if a string is a 24-character hexadecimal ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get user notifications (status=all|unread, paginated)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Run throttled sync first so user sees fresh state
    await syncNotifications(userId);

    const status = req.query.status === 'unread' ? 'unread' : 'all';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {
      userId,
      dismissedAt: null,
    };

    if (status === 'unread') {
      query.readAt = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, dismissedAt: null, readAt: null }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('[NotificationController] getNotifications error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving notifications.' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    await syncNotifications(userId);

    const unreadCount = await Notification.countDocuments({
      userId,
      dismissedAt: null,
      readAt: null,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('[NotificationController] getUnreadCount error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving unread count.' });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID format.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id, dismissedAt: null },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      dismissedAt: null,
      readAt: null,
    });

    res.json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
      unreadCount,
    });
  } catch (error) {
    console.error('[NotificationController] markAsRead error:', error);
    res.status(500).json({ success: false, message: 'Error marking notification as read.' });
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, dismissedAt: null, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.',
      modifiedCount: result.modifiedCount || 0,
      unreadCount: 0,
    });
  } catch (error) {
    console.error('[NotificationController] markAllAsRead error:', error);
    res.status(500).json({ success: false, message: 'Error marking all as read.' });
  }
};

// @desc    Dismiss a single notification (soft delete to keep unique key)
// @route   DELETE /api/notifications/:id
// @access  Private
const dismissNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID format.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { dismissedAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      dismissedAt: null,
      readAt: null,
    });

    res.json({
      success: true,
      message: 'Notification dismissed successfully.',
      unreadCount,
    });
  } catch (error) {
    console.error('[NotificationController] dismissNotification error:', error);
    res.status(500).json({ success: false, message: 'Error dismissing notification.' });
  }
};

// @desc    Dismiss all read notifications
// @route   DELETE /api/notifications
// @access  Private
const dismissAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, dismissedAt: null, readAt: { $ne: null } },
      { $set: { dismissedAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'Read notifications dismissed.',
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error('[NotificationController] dismissAllRead error:', error);
    res.status(500).json({ success: false, message: 'Error dismissing read notifications.' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  dismissAllRead,
};
