require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB for seeding.');
};

const seed = async () => {
  try {
    await connectDB();

    const DEMO_EMAIL = 'demo@spendwise.lk';
    const DEMO_PASSWORD = 'SpendWise2026!';
    const DEMO_NAME = 'Kasun Perera';

    // 1. Create or retrieve demo user
    let user = await User.findOne({ email: DEMO_EMAIL });
    if (user) {
      console.log(`ℹ️ Existing demo user found (${DEMO_EMAIL}). Refreshing associated records...`);
      // Update password to ensure it matches documented credentials
      user.password = DEMO_PASSWORD;
      user.name = DEMO_NAME;
      await user.save();
    } else {
      user = new User({
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      await user.save();
      console.log(`✅ Created demo user: ${DEMO_EMAIL}`);
    }

    const userId = user._id;

    // 2. Remove existing transactions and budgets for this user to make seed idempotent
    await Transaction.deleteMany({ userId });
    await Budget.deleteMany({ userId });
    console.log('🧹 Cleared previous demo transactions and budgets.');

    // 3. Generate realistic Sri Lankan Rupee (LKR) transactions across the past 6 months
    const now = new Date();
    const transactions = [];
    const budgets = [];

    // Monthly recurring template data
    const monthlyTemplates = [
      // Current month (month offset 0)
      {
        monthOffset: 0,
        budgetAmount: 225000,
        items: [
          { type: 'Income', amount: 350000, category: 'Salary', description: 'Monthly Tech Lead Salary', day: 1, paymentMethod: 'Bank Transfer' },
          { type: 'Income', amount: 65000, category: 'Freelance', description: 'Fintech UI Consulting Contract', day: 12, paymentMethod: 'Online Payment' },
          { type: 'Income', amount: 18500, category: 'Investment', description: 'Unit Trust Dividend Payment', day: 8, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 75000, category: 'Rent', description: 'Colombo 05 Apartment Rent', day: 2, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 24800, category: 'Groceries', description: 'Keells Supermarket - Monthly Provisions', day: 3, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 16500, category: 'Utilities', description: 'CEB Electricity & Water Bill', day: 5, paymentMethod: 'Online Payment' },
          { type: 'Expense', amount: 14200, category: 'Fuel', description: 'Fuel Refill - Ceypetco', day: 6, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 8900, category: 'Food', description: 'Dinner with Colleagues at Park Street Mews', day: 7, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 7200, category: 'Subscriptions', description: 'SLT Fibre Broadband & Cloud Storage', day: 10, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 18400, category: 'Groceries', description: 'Cargills Food City Weekend Restock', day: 11, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 12500, category: 'Health', description: 'Asiri Health Consultation & Prescription', day: 9, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 6800, category: 'Entertainment', description: 'Scope Cinemas Movie Tickets & Snacks', day: 13, paymentMethod: 'Credit Card' },
        ],
      },
      // Month -1
      {
        monthOffset: -1,
        budgetAmount: 210000,
        items: [
          { type: 'Income', amount: 350000, category: 'Salary', description: 'Monthly Tech Lead Salary', day: 1, paymentMethod: 'Bank Transfer' },
          { type: 'Income', amount: 85000, category: 'Freelance', description: 'Full-stack Architecture Review', day: 15, paymentMethod: 'Online Payment' },
          { type: 'Expense', amount: 75000, category: 'Rent', description: 'Colombo 05 Apartment Rent', day: 2, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 31200, category: 'Groceries', description: 'Monthly Groceries & Home Essentials', day: 4, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 15400, category: 'Utilities', description: 'Utility Bills (Power + Water + Gas)', day: 6, paymentMethod: 'Online Payment' },
          { type: 'Expense', amount: 13800, category: 'Fuel', description: 'Fuel Refills', day: 11, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 14500, category: 'Food', description: 'Dining out and weekend takeaway', day: 14, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 11000, category: 'Transport', description: 'PickMe & Uber City Commutes', day: 18, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 7200, category: 'Subscriptions', description: 'Fibre Internet & Entertainment Services', day: 22, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 19500, category: 'Shopping', description: 'Apparel & Workwear at ODEL', day: 25, paymentMethod: 'Credit Card' },
        ],
      },
      // Month -2
      {
        monthOffset: -2,
        budgetAmount: 200000,
        items: [
          { type: 'Income', amount: 350000, category: 'Salary', description: 'Monthly Tech Lead Salary', day: 1, paymentMethod: 'Bank Transfer' },
          { type: 'Income', amount: 50000, category: 'Bonus', description: 'Quarterly Performance Bonus', day: 20, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 75000, category: 'Rent', description: 'Colombo 05 Apartment Rent', day: 2, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 28500, category: 'Groceries', description: 'Keells Supermarket Provisions', day: 5, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 16200, category: 'Utilities', description: 'Electricity & Municipal Utility Bills', day: 8, paymentMethod: 'Online Payment' },
          { type: 'Expense', amount: 12000, category: 'Fuel', description: 'Vehicle Fuel refills', day: 12, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 15000, category: 'Education', description: 'Cloud Certification Exam Voucher', day: 16, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 9500, category: 'Gym', description: 'Fitness First Annual Membership Installment', day: 19, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 7200, category: 'Subscriptions', description: 'High-speed Fibre Connectivity', day: 24, paymentMethod: 'Online Payment' },
        ],
      },
      // Month -3
      {
        monthOffset: -3,
        budgetAmount: 190000,
        items: [
          { type: 'Income', amount: 350000, category: 'Salary', description: 'Monthly Tech Lead Salary', day: 1, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 75000, category: 'Rent', description: 'Colombo 05 Apartment Rent', day: 2, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 26400, category: 'Groceries', description: 'Grocery Restock & Household Goods', day: 7, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 14800, category: 'Utilities', description: 'Electricity & Water Services', day: 9, paymentMethod: 'Online Payment' },
          { type: 'Expense', amount: 11500, category: 'Fuel', description: 'Fuel Fill-ups', day: 14, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 16800, category: 'Food', description: 'Family Dinner & Weekend Cafes', day: 21, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 22000, category: 'Travel', description: 'Southern Expressway Weekend Trip & Stay', day: 27, paymentMethod: 'Debit Card' },
        ],
      },
      // Month -4
      {
        monthOffset: -4,
        budgetAmount: 185000,
        items: [
          { type: 'Income', amount: 350000, category: 'Salary', description: 'Monthly Tech Lead Salary', day: 1, paymentMethod: 'Bank Transfer' },
          { type: 'Income', amount: 45000, category: 'Freelance', description: 'React SaaS Component Library', day: 18, paymentMethod: 'Online Payment' },
          { type: 'Expense', amount: 75000, category: 'Rent', description: 'Colombo 05 Apartment Rent', day: 2, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 25000, category: 'Groceries', description: 'Keells Supermarket Provisions', day: 6, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 13900, category: 'Utilities', description: 'Monthly Utilities', day: 10, paymentMethod: 'Online Payment' },
          { type: 'Expense', amount: 10800, category: 'Fuel', description: 'Fuel', day: 15, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 8400, category: 'Health', description: 'Dental Checkup & Dental Care', day: 22, paymentMethod: 'Cash' },
        ],
      },
      // Month -5
      {
        monthOffset: -5,
        budgetAmount: 180000,
        items: [
          { type: 'Income', amount: 350000, category: 'Salary', description: 'Monthly Tech Lead Salary', day: 1, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 75000, category: 'Rent', description: 'Colombo 05 Apartment Rent', day: 2, paymentMethod: 'Bank Transfer' },
          { type: 'Expense', amount: 24200, category: 'Groceries', description: 'Groceries & Pantry', day: 5, paymentMethod: 'Debit Card' },
          { type: 'Expense', amount: 14100, category: 'Utilities', description: 'Utilities & Water Board', day: 9, paymentMethod: 'Online Payment' },
          { type: 'Expense', amount: 9800, category: 'Fuel', description: 'Fuel Refill', day: 13, paymentMethod: 'Credit Card' },
          { type: 'Expense', amount: 12600, category: 'Shopping', description: 'Home Office Ergonomic Accessories', day: 20, paymentMethod: 'Online Payment' },
        ],
      },
    ];

    for (const tpl of monthlyTemplates) {
      const d = new Date(now.getFullYear(), now.getMonth() + tpl.monthOffset, 1);
      const targetMonth = d.getMonth() + 1;
      const targetYear = d.getFullYear();

      // Add budget for the month
      budgets.push({
        userId,
        month: targetMonth,
        year: targetYear,
        amount: tpl.budgetAmount,
      });

      // Add transactions
      for (const item of tpl.items) {
        // Ensure day is valid for this month
        const maxDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
        const validDay = Math.min(item.day, maxDaysInMonth);
        const txDate = new Date(targetYear, targetMonth - 1, validDay, 11, 30, 0);

        transactions.push({
          userId,
          type: item.type,
          amount: item.amount,
          category: item.category,
          description: item.description,
          paymentMethod: item.paymentMethod,
          date: txDate,
        });
      }
    }

    // Bulk insert
    await Transaction.insertMany(transactions);
    await Budget.insertMany(budgets);

    console.log(`\n🎉 SEED COMPLETE!`);
    console.log(`-----------------------------------------------`);
    console.log(`👤 Demo Account Created / Updated:`);
    console.log(`   Email:    ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log(`   Name:     ${DEMO_NAME}`);
    console.log(`📊 Records Created:`);
    console.log(`   Transactions: ${transactions.length} items (realistic LKR amounts)`);
    console.log(`   Budgets:      ${budgets.length} monthly budgets`);
    console.log(`-----------------------------------------------\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seed();
