import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Star,
  Shield,
  Zap,
  Moon,
  Sun,
  Menu,
  X,
  WalletCards
} from 'lucide-react';

const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Synchronize with documentElement dark class
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
      try {
        localStorage.setItem('spendwise-theme', 'light');
      } catch (e) {
        // localStorage fallback
      }
    } else {
      root.classList.add('dark');
      setIsDark(true);
      try {
        localStorage.setItem('spendwise-theme', 'dark');
      } catch (e) {
        // localStorage fallback
      }
    }
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Budget System', href: '#budget-system' },
    { label: 'Security', href: '#security' },
  ];

  const scrollToSection = (href) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-cream dark:bg-[#0b0f19] text-ink min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* ─── 1. TOP NAVBAR ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-cream/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-line/70 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo with icon badge and subtitle */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="SpendWise Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-brand to-emerald-500 flex items-center justify-center shadow-md shadow-brand/25 group-hover:scale-105 group-hover:shadow-brand/40 transition-all duration-300">
              <WalletCards className="w-5 h-5 text-white" strokeWidth={2.3} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-ink flex items-center leading-tight">
                Spend<span className="text-brand">Wise</span>
              </span>
              <span className="text-[10px] text-ink-soft dark:text-ink-soft/90 block uppercase tracking-wider font-semibold">
                EMERALD WEALTH
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="hover:text-ink transition-colors duration-200 cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-card dark:bg-[#151c2d] border border-line dark:border-white/10 hover:border-brand/40 text-ink-soft hover:text-ink transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs hover:shadow-sm cursor-pointer"
              aria-label="Toggle Dark Mode"
              title={isDark ? "Switch to Light Mode" : "Dark mode"}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-brand" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Sign In Link */}
            <Link
              to="/login"
              className="text-sm font-semibold text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              Sign In
            </Link>

            {/* Get Started Free Button */}
            <Link
              to="/register"
              className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl transition duration-200 shadow-md shadow-brand/25 hover:shadow-brand/35 hover:-translate-y-0.5 flex items-center gap-2 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-ink-soft hover:text-ink bg-card dark:bg-[#151c2d] border border-line dark:border-white/10"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-cream dark:bg-[#0b0f19] border-b border-line dark:border-white/10 px-5 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col space-y-2.5 text-sm font-medium text-ink-soft">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="py-2 hover:text-ink transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-line dark:border-white/10 flex flex-col gap-3">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-line dark:border-white/10 bg-card dark:bg-[#151c2d] text-xs font-semibold text-ink"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-line dark:border-white/10 text-sm font-semibold text-ink hover:bg-card dark:hover:bg-[#151c2d]"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-bold shadow-md shadow-brand/25 flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── 2. HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative flex-1 flex items-center py-12 md:py-20 lg:py-24 overflow-hidden">
        
        {/* Subtle Ambient Glow Layers */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand/10 dark:bg-brand/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* ─── LEFT SIDE CONTENT (lg:col-span-7) ─── */}
            <div className="lg:col-span-7 text-left space-y-6 sm:space-y-7">
              
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card/85 dark:bg-[#151c2d]/90 border border-line dark:border-white/15 shadow-xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span className="text-xs sm:text-sm font-semibold text-brand tracking-wide">
                  Personal Finance & Wealth Clarity
                </span>
              </div>

              {/* Main Heading (H1) */}
              <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] tracking-tight leading-[1.08] text-ink text-balance">
                Your Home Base for{' '}
                <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-brand via-amber-500 to-emerald-600 dark:from-brand-light dark:via-amber-400 dark:to-emerald-400">
                  Financial Clarity
                </span>
              </h1>

              {/* Sub-text */}
              <p className="text-base sm:text-lg lg:text-xl text-ink-body max-w-xl leading-relaxed">
                SpendWise brings all your expenses, income streams, and monthly budgets into one unified, distraction-free dashboard. Know where every rupee goes.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="bg-brand hover:bg-brand-dark text-white font-semibold text-base px-7 py-3.5 rounded-xl shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2.5 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <span>Start Tracking Free</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="bg-card dark:bg-[#151c2d] hover:bg-cream-hover dark:hover:bg-[#1c2438] border border-line dark:border-white/15 text-ink font-semibold text-base px-6 py-3.5 rounded-xl shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span>Sign In to Dashboard</span>
                </Link>
              </div>

              {/* Trust & Social Proof Badges */}
              <div className="pt-4 border-t border-line/60 dark:border-white/10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-ink-soft">
                {/* 5 Stars Rating */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="flex text-amber-400" aria-label="5 stars rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-ink">4.9/5 Rating</span>
                  <span>by modern developers & students</span>
                </div>

                <span className="hidden xl:inline text-line dark:text-white/20" aria-hidden="true">|</span>

                {/* Zero-knowledge data isolation */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Shield className="w-4 h-4 text-brand" />
                  <span>Zero-knowledge data isolation</span>
                </div>

                <span className="hidden xl:inline text-line dark:text-white/20" aria-hidden="true">|</span>

                {/* Real-time LKR (Rs.) tracking */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Real-time LKR (Rs.) tracking</span>
                </div>
              </div>

            </div>

            {/* ─── RIGHT SIDE VISUAL (lg:col-span-5) ─── */}
            <div className="lg:col-span-5 flex justify-center items-center relative mt-6 lg:mt-0">
              
              {/* Backlight Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 via-emerald-500/20 to-teal-400/20 rounded-full blur-3xl transform scale-90 -z-10" />

              {/* Mobile Screen Mockup Container */}
              <div className="w-full max-w-[340px] sm:max-w-[360px] bg-card dark:bg-[#121827] rounded-[2.8rem] p-3.5 sm:p-4 border-[3px] border-line/80 dark:border-white/15 shadow-2xl shadow-brand/10 transition-transform duration-500 hover:scale-[1.02]">
                
                {/* Mobile Device Inner Frame */}
                <div className="rounded-[2.2rem] bg-cream/70 dark:bg-[#0b0f19] border border-line/60 dark:border-white/10 p-4 sm:p-5 relative overflow-hidden flex flex-col space-y-4">
                  
                  {/* Phone Speaker & Camera Notch */}
                  <div className="flex justify-between items-center px-1 pb-1">
                    <span className="text-[11px] font-semibold text-ink-soft">9:41</span>
                    <div className="w-16 h-4 bg-ink/10 dark:bg-white/10 rounded-full mx-auto" />
                    <div className="flex items-center gap-1 text-ink-soft text-[10px]">
                      <span className="font-mono">5G</span>
                      <div className="w-4 h-2 rounded-xs border border-current flex items-center p-0.5">
                        <div className="w-full h-full bg-current rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* App Mini Header inside Phone */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand/15 dark:bg-brand/25 text-brand flex items-center justify-center font-bold text-xs">
                        SW
                      </div>
                      <div>
                        <p className="text-[10px] text-ink-soft font-semibold uppercase tracking-wider">Emerald Wealth</p>
                        <p className="text-xs font-bold text-ink leading-tight">My Portfolio</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      LIVE
                    </span>
                  </div>

                  {/* Visual Balance Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-brand via-brand-dark to-amber-700 text-white shadow-lg shadow-brand/30">
                    <p className="text-[11px] text-white/80 font-medium">Net Available Balance</p>
                    <div className="text-2xl font-bold font-mono tracking-tight mt-1">
                      Rs. 105,000
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/20 text-[11px]">
                      <span className="text-white/90 font-medium">Monthly Surplus</span>
                      <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">
                        +42% Saved
                      </span>
                    </div>
                  </div>

                  {/* Analytics Mini Bar Chart Display */}
                  <div className="p-3.5 rounded-xl bg-card dark:bg-[#151c2d] border border-line/70 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">Weekly Cash Flow</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+14.2%</span>
                    </div>
                    {/* Simulated Mini Chart Bars */}
                    <div className="h-16 flex items-end justify-between gap-1.5 pt-2 px-1">
                      {[
                        { day: 'M', h: '45%', color: 'bg-emerald-500/80' },
                        { day: 'T', h: '65%', color: 'bg-emerald-500/80' },
                        { day: 'W', h: '35%', color: 'bg-amber-500/80' },
                        { day: 'T', h: '85%', color: 'bg-brand' },
                        { day: 'F', h: '55%', color: 'bg-emerald-500/80' },
                        { day: 'S', h: '70%', color: 'bg-emerald-500/80' },
                        { day: 'S', h: '95%', color: 'bg-emerald-600' },
                      ].map((bar, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full rounded-t-sm ${bar.color} transition-all duration-300 hover:opacity-90`}
                            style={{ height: bar.h }}
                          />
                          <span className="text-[9px] text-ink-soft">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini Recent Activity Row */}
                  <div className="space-y-2 pt-0.5">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-card dark:bg-[#151c2d] border border-line/60 dark:border-white/10 text-[11px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          +
                        </span>
                        <span className="font-medium text-ink truncate">Client UI Project</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        +Rs. 45,000
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-card dark:bg-[#151c2d] border border-line/60 dark:border-white/10 text-[11px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-md bg-red-500/15 text-red-500 flex items-center justify-center font-bold text-[10px]">
                          -
                        </span>
                        <span className="font-medium text-ink truncate">Supermarket Groceries</span>
                      </div>
                      <span className="font-mono font-bold text-red-500 shrink-0">
                        -Rs. 12,450
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating Overlay Badge (Over phone corner on desktop) */}
              <div className="hidden sm:block absolute -bottom-4 -left-4 z-20 bg-card/90 dark:bg-[#151c2d]/90 backdrop-blur-md border border-line dark:border-white/15 rounded-2xl p-3 shadow-xl max-w-[210px] animate-float">
                <div className="flex items-center justify-between text-[11px] font-semibold text-ink mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Monthly Budget
                  </span>
                  <span className="text-amber-500 font-bold">68% used</span>
                </div>
                <div className="w-full bg-cream-band dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full w-[68%]" />
                </div>
                <div className="flex justify-between items-center text-[9px] text-ink-soft mt-1.5">
                  <span>Rs. 68,000 spent</span>
                  <span>Rs. 100,000 limit</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default HeroSection;
