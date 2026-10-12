import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  WalletCards,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  PieChart,
  Target,
  Sparkles,
  Lock,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  CreditCard,
  ChevronRight,
  Zap,
  BarChart3,
  Star,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-ink selection:bg-brand selection:text-brand-dark flex flex-col font-sans overflow-x-hidden">
      
      {/* ─── Glassmorphic Navigation Bar ────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-line/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center shadow-lg shadow-brand/25 group-hover:shadow-brand/40 transition-all duration-300">
              <WalletCards className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-ink flex items-center">
                Spend<span className="text-brand">Wise</span>
              </span>
              <span className="text-[10px] text-ink-muted block uppercase tracking-wider font-semibold -mt-1">
                Emerald Wealth
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-ink transition cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-ink transition cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('budget-system')}
              className="hover:text-ink transition cursor-pointer"
            >
              Budget System
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="hover:text-ink transition cursor-pointer"
            >
              Security
            </button>
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-bg-card border border-line hover:border-line-light text-ink-soft hover:text-ink transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title={isDark ? "Switch to Warm Cream Light" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <>
                  <Sun size={15} className="text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-brand" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-4 py-2 rounded-xl transition shadow-sm hover:shadow flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-ink-soft hover:text-ink transition px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-4 py-2 rounded-xl transition shadow-sm hover:shadow flex items-center gap-1.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-ink-soft hover:text-ink bg-bg-card border border-line"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-bg-secondary border-b border-line px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-medium text-ink-soft">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 hover:text-ink"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 hover:text-ink"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('budget-system')}
                className="text-left py-2 hover:text-ink"
              >
                Budget System
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="text-left py-2 hover:text-ink"
              >
                Security
              </button>
            </div>
            <div className="pt-4 border-t border-line flex flex-col gap-2.5">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-line bg-bg-card text-xs font-semibold text-ink"
              >
                {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-brand" />}
                <span>Switch to {isDark ? 'Warm Cream Light' : 'Dark Mode'}</span>
              </button>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-bg-hover"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-sm"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── 3. Hero Section ───────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Professional Ambient Hero Background Image */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
          <img
            src="/hero_lifestyle_desk.jpg"
            alt="SpendWise Personal Finance Lifestyle"
            className={`w-full h-full object-cover object-right md:object-right transition-all duration-700 ${
              isDark 
                ? 'opacity-30 brightness-90 contrast-125' 
                : 'opacity-90 contrast-[1.03] saturate-[1.08]'
            }`}
          />
          {/* Directional gradient overlays to ensure seamless blend with page background & 100% text readability */}
          <div 
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'linear-gradient(to right, #0a0e17 0%, rgba(10, 14, 23, 0.96) 42%, rgba(10, 14, 23, 0.65) 70%, rgba(10, 14, 23, 0.85) 100%), linear-gradient(to bottom, transparent 60%, #0a0e17 100%)'
                : 'linear-gradient(to right, #fdf9ef 0%, rgba(253, 249, 239, 0.96) 45%, rgba(253, 249, 239, 0.35) 75%, rgba(253, 249, 239, 0.6) 100%), linear-gradient(to bottom, transparent 65%, #fdf9ef 100%)',
            }}
          />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-info/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Left-Aligned Headline & CTA Area for Editorial Lifestyle Layout */}
          <div className="text-center lg:text-left lg:max-w-2xl py-6 lg:py-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping"></span>
              <span>💎 Personal Finance & Wealth Clarity</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-ink tracking-tight leading-[1.12]">
              Your Home Base for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-light to-info">
                Financial Clarity
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-ink-soft leading-relaxed max-w-xl mx-auto lg:mx-0">
              SpendWise brings all your expenses, income streams, and monthly budgets into one unified, distraction-free dashboard. Know where every rupee goes.
            </p>

            {/* Hero CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <span>Go to Your Dashboard</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white font-semibold text-base px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <span>Start Tracking Free</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </Link>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto bg-bg-card hover:bg-bg-hover text-ink border border-line hover:border-line-light font-bold text-base px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-brand" />
                    <span>Sign In to Dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Social Proof Strip */}
            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-ink-muted">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-ink">4.9/5 Rating</span>
                <span>by modern developers & students</span>
              </div>
              <span className="hidden sm:inline text-line">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span>Zero-knowledge data isolation</span>
              </div>
              <span className="hidden sm:inline text-line">•</span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-info" />
                <span>Real-time LKR (Rs.) Tracking</span>
              </div>
            </div>
          </div>

          {/* ─── 4. Interactive Dashboard Hero Preview (App Mockup) ───────── */}
          <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
            {/* Ambient card back-glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-brand/30 via-info/20 to-brand/30 rounded-3xl blur-xl opacity-75"></div>

            {/* Mockup Frame */}
            <div className="relative bg-bg-card border border-line rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-left">
              
              {/* Window Title Bar */}
              <div className="bg-bg-secondary/90 px-4 py-3 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-expense/80"></div>
                  <div className="w-3 h-3 rounded-full bg-warn/80"></div>
                  <div className="w-3 h-3 rounded-full bg-brand/80"></div>
                  <span className="text-xs text-ink-muted font-mono ml-2 hidden sm:inline">
                    spendwise.app/dashboard • Emerald Wealth
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="w-2 h-2 rounded-full bg-brand"></span>
                  <span className="font-mono text-[11px]">OCTOBER 2026</span>
                </div>
              </div>

              {/* Mockup Body Content */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-b from-bg-card to-bg-primary/95">
                
                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Income */}
                  <div className="bg-bg-primary/90 border border-line rounded-xl p-4">
                    <div className="flex justify-between items-center text-xs text-ink-muted uppercase">
                      <span>Total Income</span>
                      <span className="p-1 rounded bg-income/10 text-income"><TrendingUp className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-2 text-xl font-bold font-mono text-income">+Rs. 250,000</div>
                    <div className="text-[10px] text-income mt-1 font-medium">+14.2% this month</div>
                  </div>

                  {/* Expenses */}
                  <div className="bg-bg-primary/90 border border-line rounded-xl p-4">
                    <div className="flex justify-between items-center text-xs text-ink-muted uppercase">
                      <span>Total Expenses</span>
                      <span className="p-1 rounded bg-expense/10 text-expense"><TrendingDown className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-2 text-xl font-bold font-mono text-expense">-Rs. 145,000</div>
                    <div className="text-[10px] text-ink-muted mt-1 font-medium">Across 4 categories</div>
                  </div>

                  {/* Net Balance */}
                  <div className="bg-bg-primary/90 border border-line rounded-xl p-4">
                    <div className="flex justify-between items-center text-xs text-ink-muted uppercase">
                      <span>Net Balance</span>
                      <span className="p-1 rounded bg-info/10 text-info"><WalletCards className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-2 text-xl font-bold font-mono text-ink">Rs. 105,000</div>
                    <div className="text-[10px] text-info mt-1 font-medium">42% saved surplus</div>
                  </div>

                  {/* Budget */}
                  <div className="bg-bg-primary/90 border border-line rounded-xl p-4">
                    <div className="flex justify-between items-center text-xs text-ink-muted uppercase">
                      <span>Monthly Budget</span>
                      <span className="p-1 rounded bg-warn/10 text-warn"><Target className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="mt-2 text-xl font-bold font-mono text-ink">Rs. 180,000</div>
                    <div className="text-[10px] text-brand mt-1 font-medium">Rs. 35,000 Remaining</div>
                  </div>
                </div>

                {/* Mini Budget Usage Bar */}
                <div className="bg-bg-primary/70 border border-line rounded-xl p-4">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold text-ink">Budget Consumption (80.5% Used)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warn/10 text-warn border border-warn/30">
                      ● Amber Warning: Near Limit
                    </span>
                  </div>
                  <div className="w-full bg-bg-card h-2.5 rounded-full overflow-hidden p-0.5 border border-line">
                    <div className="bg-warn h-full rounded-full" style={{ width: '80.5%' }}></div>
                  </div>
                </div>

                {/* Mini Transactions Chips */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-bg-primary/80 border border-line text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="p-1.5 rounded-lg bg-income/10 text-income font-bold">💼</span>
                      <div className="truncate">
                        <p className="font-semibold text-ink truncate">Client UI Project</p>
                        <p className="text-[10px] text-ink-muted">Bank Transfer</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-income flex-shrink-0">+Rs. 45,000</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-bg-primary/80 border border-line text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="p-1.5 rounded-lg bg-expense/10 text-expense font-bold">🍔</span>
                      <div className="truncate">
                        <p className="font-semibold text-ink truncate">Supermarket Groceries</p>
                        <p className="text-[10px] text-ink-muted">Debit Card</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-expense flex-shrink-0">-Rs. 12,450</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-bg-primary/80 border border-line text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="p-1.5 rounded-lg bg-expense/10 text-expense font-bold">💡</span>
                      <div className="truncate">
                        <p className="font-semibold text-ink truncate">Internet & Electricity</p>
                        <p className="text-[10px] text-ink-muted">Online Payment</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-expense flex-shrink-0">-Rs. 8,900</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 5. Bento Grid / Core Features ─────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 border-t border-line/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand block mb-2">
              POWERFUL ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
              Everything You Need to Master Your Money
            </h2>
            <p className="mt-4 text-ink-soft text-base sm:text-lg">
              Engineered with clean separation of concerns, reactive charts, and foolproof validation.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Real-time Transactions */}
            <div className="bg-bg-card border border-line hover:border-line-light rounded-2xl p-7 transition shadow-sm hover:shadow-lg lg:col-span-2 group">
              <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-5 group-hover:scale-105 transition">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">
                Real-Time Expense & Income Tracking
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-6">
                Log income streams and purchases with instant categorization (Food, Transport, Bills, Salary). Filter by type, date range, or search descriptions on the fly.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-3 py-1 rounded-lg bg-bg-primary border border-line text-income">
                  + Bank Transfer
                </span>
                <span className="px-3 py-1 rounded-lg bg-bg-primary border border-line text-expense">
                  - Debit Card
                </span>
                <span className="px-3 py-1 rounded-lg bg-bg-primary border border-line text-ink-soft">
                  Cash & Online
                </span>
              </div>
            </div>

            {/* Feature 2: 3-Tier Budget Threshold */}
            <div id="budget-system" className="bg-bg-card border border-line hover:border-line-light rounded-2xl p-7 transition shadow-sm hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-warn/10 border border-warn/20 flex items-center justify-center text-warn mb-5 group-hover:scale-105 transition">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">
                3-Tier Budget System
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-4">
                Dynamic threshold alerts ensure you never overspend without realizing:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-bg-primary border border-line">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>
                  <span className="font-semibold text-brand">0 – 70%:</span>
                  <span className="text-ink-soft">Safe Emerald (On Track)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-bg-primary border border-line">
                  <span className="w-2.5 h-2.5 rounded-full bg-warn"></span>
                  <span className="font-semibold text-warn">70 – 90%:</span>
                  <span className="text-ink-soft">Amber Warning (Near Limit)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-bg-primary border border-line">
                  <span className="w-2.5 h-2.5 rounded-full bg-expense"></span>
                  <span className="font-semibold text-expense">90%+:</span>
                  <span className="text-ink-soft">Rose Alert (Over Budget)</span>
                </div>
              </div>
            </div>

            {/* Feature 3: Interactive Recharts Analytics */}
            <div className="bg-bg-card border border-line hover:border-line-light rounded-2xl p-7 transition shadow-sm hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center text-info mb-5 group-hover:scale-105 transition">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">
                Interactive Visual Analytics
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-4">
                Evaluate cashflow dynamics with responsive Recharts graphs: Category Doughnut breakdowns and 6-month Income vs Expense bars.
              </p>
              <div className="p-3 bg-bg-primary rounded-xl border border-line text-xs font-mono text-ink-muted">
                Doughnut Breakdown • Cash Flow Bars • Savings Trend
              </div>
            </div>

            {/* Feature 4: Bank-Grade Security */}
            <div id="security" className="bg-bg-card border border-line hover:border-line-light rounded-2xl p-7 transition shadow-sm hover:shadow-lg lg:col-span-2 group">
              <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-5 group-hover:scale-105 transition">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">
                Bank-Grade Security & Isolation
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-4">
                Your financial records are strictly isolated to your verified account. Passwords are salted with bcrypt, and all REST endpoints require verified JSON Web Tokens (JWT).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-bg-primary border border-line text-ink-soft flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand" />
                  <span>Bcrypt Salting</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-primary border border-line text-ink-soft flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand" />
                  <span>JWT Auth Middleware</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-primary border border-line text-ink-soft flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand" />
                  <span>User-Scoped Queries</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. How SpendWise Works (3-Step Roadmap) ──────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-bg-secondary/40 border-t border-line/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand block mb-2">
              SEAMLESS WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              Up and Running in 3 Steps
            </h2>
            <p className="mt-3 text-ink-soft text-base">
              No bloated setup or complex spreadsheets. Get total financial visibility in under 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-bg-card border border-line rounded-2xl p-8 relative">
              <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/30 text-brand font-mono font-bold flex items-center justify-center text-sm mb-6">
                01
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">Create Your Secure Vault</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Register with your email and password. Your personal data is immediately protected with JWT security.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-bg-card border border-line rounded-2xl p-8 relative">
              <div className="w-10 h-10 rounded-full bg-info/10 border border-info/30 text-info font-mono font-bold flex items-center justify-center text-sm mb-6">
                02
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">Log Income & Expenses</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Add transactions in seconds with amount, category tags, payment methods, and optional descriptions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-bg-card border border-line rounded-2xl p-8 relative">
              <div className="w-10 h-10 rounded-full bg-warn/10 border border-warn/30 text-warn font-mono font-bold flex items-center justify-center text-sm mb-6">
                03
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">Set Limits & Grow Wealth</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Establish monthly target budgets. Track your usage percentage and get timely warnings before overspending.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 7. High-Converting CTA Section ───────────────────────────── */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden bg-gradient-to-tr from-bg-secondary via-bg-card to-bg-secondary border border-line shadow-2xl text-center">
            
            {/* Ambient emerald backlight */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-info/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                GET STARTED IN SECONDS
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
                Ready to Stop Guessing and Start Saving?
              </h2>

              <p className="mt-4 text-base sm:text-lg text-ink-soft">
                Join thousands of students and developers tracking every rupee with the precision of SpendWise.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl text-ink-soft hover:text-ink text-sm font-semibold transition"
                >
                  Already have an account? Sign in &rarr;
                </Link>
              </div>

              <p className="mt-6 text-xs text-ink-muted">
                No credit card required • Instant setup • 100% Free
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 8. Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-line bg-bg-secondary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center text-brand-dark font-bold text-sm">
              <WalletCards className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-ink flex items-center">
                Spend<span className="text-brand">Wise</span>
              </span>
              <span className="text-[10px] text-ink-muted block uppercase tracking-wider">
                Emerald Wealth Edition
              </span>
            </div>
          </div>

          <p className="text-xs text-ink-muted text-center md:text-left">
            Master your personal cash flow. Built with React, Tailwind CSS & Node/Express.
          </p>

          <div className="flex items-center gap-6 text-xs text-ink-soft">
            <Link to="/login" className="hover:text-ink transition">Sign In</Link>
            <Link to="/register" className="hover:text-ink transition">Register</Link>
            <span className="text-ink-muted">© 2026 SpendWise.</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
