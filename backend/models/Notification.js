const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'budget_warning',
        'budget_critical',
        'budget_exceeded',
        'budget_ending',
        'no_budget',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'danger'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: '/budgets',
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: {
      type: Date,
      default: null,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// 1. Unique compound index: prevents duplicate notification keys per user
notificationSchema.index({ userId: 1, key: 1 }, { unique: true });

// 2. High-performance querying index for active / unread notifications sorted newest first
notificationSchema.index({ userId: 1, dismissedAt: 1, createdAt: -1 });

// 3. Fast unread count index
notificationSchema.index({ userId: 1, dismissedAt: 1, readAt: 1 });

// 4. 90-day TTL cleanup: documents auto-deleted 90 days after creation
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
