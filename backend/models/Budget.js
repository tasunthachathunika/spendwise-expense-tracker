const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    periodType: {
      type: String,
      enum: ['month', 'custom'],
      default: 'month',
    },
    month: {
      type: Number,
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },
    year: {
      type: Number,
      min: [2000, 'Year must be valid'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Budget amount must be greater than 0'],
      max: [1000000000, 'Budget amount cannot exceed 1,000,000,000'],
    },
  },
  {
    timestamps: true,
  }
);

// Unique calendar-month budget per user (partial filter ensures custom budgets do not collide)
budgetSchema.index(
  { userId: 1, month: 1, year: 1 },
  { unique: true, partialFilterExpression: { periodType: 'month' } }
);

// Compound index for date-range overlap and period queries
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
