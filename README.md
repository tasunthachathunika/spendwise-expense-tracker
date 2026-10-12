# SpendWise - Personal Expense & Budget Tracker

A modern, production-ready full-stack Personal Expense & Budget Tracker built with Node.js, Express, MongoDB, React, Vite, Tailwind CSS, Recharts, and JWT Authentication.

---

## 🚀 Quick Start Guide

### 1. Start MongoDB
Ensure your MongoDB server is running:

**Option A (Windows Service as Admin):**
Open PowerShell as Administrator and run:
```powershell
net start MongoDB
```

**Option B (Direct CLI):**
```powershell
mongod --dbpath="C:\data\db"
```
*(Or specify your MongoDB Atlas URI in `backend/.env` under `MONGO_URI`)*

---

### 2. Start the Backend Server (Port 5000)
Open a terminal in the project root:
```powershell
cd backend
npm run dev
```
> Server runs at `http://localhost:5000`

---

### 3. Start the Frontend Application (Port 5173)
Open a separate terminal:
```powershell
cd frontend
npm run dev
```
> Open your browser at `http://localhost:5173`

---

## 🛠️ Project Architecture

```
/backend
├── controllers/
│   ├── authController.js       # Register, Login, Me endpoints
│   ├── transactionController.js# CRUD, search, category/date filters
│   ├── budgetController.js     # Upsert monthly budget targets
│   └── dashboardController.js  # Summary cards & analytics data
├── middleware/
│   └── authMiddleware.js       # JWT bearer token verification
├── models/
│   ├── User.js                 # User schema with bcrypt hash hook
│   ├── Transaction.js          # Incomes & Expenses with indexes
│   └── Budget.js               # Unique monthly budget targets
├── routes/                     # Express API routers
├── server.js                   # Express app entry & MongoDB connection
└── .env                        # Configuration (Port, JWT Secret, DB URI)

/frontend
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Mobile-responsive drawer navigation
│   │   ├── Navbar.jsx          # Dynamic page titles & profile avatar
│   │   ├── Layout.jsx          # Protected layout shell
│   │   ├── PrivateRoute.jsx    # Authentication route guard
│   │   ├── TransactionModal.jsx# Add/edit transaction with validations
│   │   └── BudgetModal.jsx     # Set monthly budget limits
│   ├── context/
│   │   └── AuthContext.jsx     # Global JWT login/logout state
│   ├── pages/
│   │   ├── LandingPage.jsx     # High-converting Fintech SaaS landing page (/landing)
│   │   ├── Login.jsx           # Sign in (/login)
│   │   ├── Register.jsx        # Account registration (/register)
│   │   ├── Dashboard.jsx       # 4 Stat cards, progress, recent activity
│   │   ├── Transactions.jsx    # Paginated data table & filter bar
│   │   ├── Budgets.jsx         # Budget cards & exceeding warnings
│   │   ├── Analytics.jsx       # Donut chart, Bar chart & Trend lines
│   │   └── Profile.jsx         # Account details & security summary
│   ├── utils/
│   │   ├── api.js              # Axios with JWT interceptors
│   │   └── helpers.js          # Formatters, icons & chart palettes
│   ├── App.jsx                 # Routes & React Hot Toast configuration
│   └── index.css               # Complete dark modern SaaS design tokens
```
