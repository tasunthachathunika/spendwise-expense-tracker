require('dotenv').config();
const mongoose = require('mongoose');
const Budget = require('../models/Budget');

const runMigration = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for budget migration.');

    const coll = mongoose.connection.db.collection('budgets');

    // 1. Check and safely upgrade indexes if legacy non-partial unique index is present
    try {
      const existingIndexes = await coll.indexes();
      const legacyIdx = existingIndexes.find((idx) => idx.name === 'userId_1_month_1_year_1');
      if (legacyIdx && !legacyIdx.partialFilterExpression) {
        console.log('🔄 Upgrading legacy unique index to partial unique index...');
        await coll.dropIndex('userId_1_month_1_year_1');
        console.log('✅ Dropped legacy index userId_1_month_1_year_1.');
      }
    } catch (idxErr) {
      console.warn('⚠️ Note on index inspection:', idxErr.message);
    }

    // Sync defined schema indexes
    await Budget.syncIndexes();
    console.log('✅ Synchronized Budget model indexes (partial unique + date range).');

    // 2. Query documents needing backfill
    const query = {
      $or: [
        { periodType: { $exists: false } },
        { startDate: { $exists: false } },
        { endDate: { $exists: false } },
        { startDate: null },
        { endDate: null },
      ],
    };

    const unmigratedBudgets = await Budget.find(query);
    console.log(`🔍 Found ${unmigratedBudgets.length} budget document(s) requiring migration.`);

    if (unmigratedBudgets.length === 0) {
      console.log('✨ Database is already up to date. Idempotent check passed: 0 changes needed.');
      await mongoose.connection.close();
      process.exit(0);
    }

    let updatedCount = 0;
    for (const b of unmigratedBudgets) {
      const month = b.month;
      const year = b.year;

      if (month && year) {
        b.startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        b.endDate = new Date(Date.UTC(year, month, 0, 0, 0, 0, 0));
        b.periodType = 'month';
        await b.save();
        updatedCount++;
      }
    }

    console.log(`🎉 Successfully backfilled ${updatedCount} budget(s) with periodType, startDate, and endDate.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

runMigration();
