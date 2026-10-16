# SpendWise — Demonstration Video Script (3 to 5 Minutes)

**Target Duration:** 4 minutes 30 seconds  
**Presenter:** Tasuntha Chathunika (Team 405)  
**Resolution:** 1440 × 900 (High-definition, 60fps recommended)  
**Pre-recording Preparation:**
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- Database seeded with realistic LKR sample data via `npm run seed` (`demo@spendwise.lk` / `SpendWise2026!`)
- Browser zoom set to 100%, clean bookmarks bar, DevTools closed (open only during security highlight)

---

## 🎬 Scene 1: Introduction & Architectural Overview (0:00 – 0:45)

**Visual:**
- Start on the SpendWise Landing Page (`http://localhost:5173/landing`).
- Scroll smoothly through the hero section, live metrics badges, and value propositions.

**Spoken Script:**
> *"Hello everyone and welcome to the presentation of **SpendWise**, a full-stack personal expense and budget tracking platform developed for Team 405. SpendWise is engineered to bring financial discipline and clarity to modern life, with native support for Sri Lankan Rupee (`LKR`) cash flows.*
>
> *Under the hood, SpendWise is built on the MERN stack—React and Vite on the client, Express and Node.js on the backend, and MongoDB with Mongoose for persistent data storage. The user interface features a bespoke design system with warm cream light mode and warm obsidian dark mode, typography powered by Fraunces and Inter, and 100% vector SVG icons powered by Lucide with zero emojis.*
>
> *Let's now jump into the system by exploring authentication and our security architecture."*

---

## 🎬 Scene 2: Authentication & Security Architecture (0:45 – 1:30)

**Visual:**
- Click **"Sign In"** in the navigation header to open the split-screen login page (`/login`).
- Type invalid credentials (`wrong@test.com`) and click **"Sign in to account"** → Notice the toast error and button loading state.
- Show code / highlight: mention bcrypt salt rounds (12), JWT Bearer tokens, and in-memory rate limiting against brute force.
- Enter demo credentials (`demo@spendwise.lk` / `SpendWise2026!`) and sign in.

**Spoken Script:**
> *"SpendWise adheres to rigorous security standards. User passwords are encrypted with bcrypt using 12 salt rounds before hitting the database. Authentication uses stateless JSON Web Tokens stored securely in the client and injected into every HTTP request via centralized Axios interceptors.*
>
> *Our API features in-memory rate limiting on authentication routes to stop brute-force attacks, security headers including nosniff and frame protection, and a centralized 401 interceptor that automatically redirects expired sessions.*
>
> *Crucially, all backend database queries strictly enforce user ownership checks with `userId: req.user._id`, completely eliminating Insecure Direct Object Reference (IDOR) vulnerabilities. Let's sign in with our demo account."*

---

## 🎬 Scene 3: Financial Dashboard & Aggregated Metrics (1:30 – 2:30)

**Visual:**
- Land on the Dashboard (`/dashboard`).
- Hover over the 4 Stat Cards: Total Income, Total Expenses, Net Savings, and Monthly Budget Status.
- Point to the LKR currency formatting (`Rs. 250,000`).
- Change the **Month / Year Filter** dropdown to a previous month (e.g., September or August) and watch the numbers, donut chart, and cash flow bar chart re-aggregate dynamically.
- Hover over the **Category Donut Chart** slices and **Cash Flow Bar Chart** bars to show live tooltips.
- Show the **Budget Progress Bar** with percentage and color-coded status.

**Spoken Script:**
> *"Upon logging in, the user is greeted by the central Financial Dashboard. All metrics are aggregated server-side via MongoDB aggregation pipelines for maximum performance.*
>
> *Here in our four summary cards, we see our Total Income, Total Expenses, Net Savings, and Monthly Budget status, all strictly formatted in Sri Lankan Rupees using Intl.NumberFormat.*
>
> *Notice our dynamic Month and Year filter: when I switch from October to September, our backend recalculates the cash flow aggregates in real time. The interactive Donut Chart breaks down our expenses by category, while our Cash Flow bar chart compares monthly income against expenditures. If no transactions exist for a selected month, SpendWise displays authentic, helpful empty states rather than fake mock fallbacks."*

---

## 🎬 Scene 4: Transaction Ledger & Multi-filtering (2:30 – 3:30)

**Visual:**
- Navigate to **"Transactions"** via the sidebar (`/transactions`).
- Show the transactions table: Type badges, Lucide category badges, dates, amounts, and payment methods.
- Demonstrate the **Filter Bar**:
  - Filter by Type: Select "Expense"
  - Filter by Category: Select "Groceries"
  - Type in the Search Bar: "Keells"
  - Clear filters.
- Click **"Add Transaction"**:
  - Notice the modal auto-focuses directly on the Amount input.
  - Fill: Type = Expense, Amount = 6500, Category = Food, Description = "Team Lunch at Java Lounge", Payment Method = Debit Card.
  - Click Save → toast notification appears, table updates with new transaction immediately.
- Click the **Delete (trash)** icon on any transaction:
  - Accessible `ConfirmDialog` modal opens (`role="alertdialog"`).
  - Click "Delete Transaction" → item is deleted safely.

**Spoken Script:**
> *"Next is the Transactions ledger. Every transaction is displayed in a clean, high-density ledger with clear type badges, date timestamps, and accessible Lucide category icons.*
>
> *Our filter engine allows instant multi-dimensional filtering. Users can filter by transaction type, narrow down to specific categories like Groceries or Rent, and use live search to find specific payees or notes.*
>
> *When we add a new transaction, notice how the modal automatically focuses on the Amount field for rapid keyboard entry, and includes double-submit protection to prevent duplicate charges. We'll add an expense of Rs. 6,500 for Team Lunch. Saving provides an immediate toast notification and updates our ledger.*
>
> *Furthermore, destructive actions like deleting a transaction or budget are guarded by accessible custom alert dialogs with focus trapping, eliminating invasive native browser confirms."*

---

## 🎬 Scene 5: Monthly Budget Tracking & Proactive Alerts (3:30 – 4:15)

**Visual:**
- Navigate to **"Budgets"** (`/budgets`).
- Show existing budget cards for current and past months.
- Point to the visual status badges:
  - Show "Safe" status badge (< 75%)
  - Show "Approaching Limit" (75% - 99%)
  - Show "Over Budget" alert (>= 100%)
- Click **"Set Budget"**:
  - Update current month's budget to `Rs. 250,000`.
  - Save → card updates with progress bar and remaining balance in LKR.

**Spoken Script:**
> *"The Budgets module enforces financial discipline. SpendWise calculates spending against user-defined monthly limits and provides clear, three-tier proactive visual warnings:*
> - *Green when spending is under 75% of the target,*
> - *Amber when approaching the threshold,*
> - *And a prominent Red warning badge when expenditures exceed the monthly limit.*
>
> *Users can easily establish or adjust their monthly budget thresholds at any time with full upsert protection in the backend."*

---

## 🎬 Scene 6: Analytics, Profile & Theme Switching (4:15 – 5:00)

**Visual:**
- Navigate to **"Analytics"** (`/analytics`).
  - Show the 6-month historical area trend and category distribution.
- Navigate to **"Profile"** (`/profile`).
  - Show user statistics: Account created date, active budget, total transaction count.
  - Demonstrate profile name update or password modification interface.
- Toggle Theme: Click the **Theme Toggle** in the top navigation bar.
  - Show instant transition between Warm Cream Light Mode and Warm Obsidian Dark Mode.
  - Show how all cards, charts, sidebars, and fonts maintain perfect contrast without flicker.

**Spoken Script:**
> *"In Analytics, users can review 6-month historical trends to evaluate whether their savings rate is growing over time.*
>
> *Under Profile settings, users can inspect their account statistics, update their display name, and securely change their password.*
>
> *Finally, SpendWise features a comprehensive dual-theme system. With one click, we toggle from our Warm Cream light mode to our Warm Obsidian dark mode. All design tokens, SVG icons, chart palettes, and contrast ratios adapt smoothly and persist across browser reloads.*
>
> *In summary, SpendWise meets every requirement of Team 405 with security, elegance, and reliability. Thank you for watching!"*

---
