import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Lock, Zap, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-cream dark:bg-[#0a0e17] flex items-center"
    >
      {/* Background Image Layer: Crisp, Unblurred, High-Resolution */}
      <img
        src="/hero.webp"
        alt="Woman checking her finances on her phone in a bright cafe"
        fetchpriority="high"
        decoding="async"
        width="2560"
        height="1440"
        className="absolute inset-0 w-full h-full object-cover object-[78%_center] lg:object-[78%_center] pointer-events-none select-none z-0"
      />

      {/* Desktop Left-Only Gradient Overlay (Right side with face & phone remains 100% crisp) */}
      <div
        className="hidden lg:block absolute inset-0 pointer-events-none z-[1] bg-gradient-to-r from-cream via-cream/90 via-30% to-transparent to-60% dark:from-[#0a0e17] dark:via-[#0a0e17]/90 dark:via-30% dark:to-transparent dark:to-60%"
        aria-hidden="true"
      />

      {/* Mobile/Tablet Vertical Gradient Overlay */}
      <div
        className="lg:hidden absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-cream via-cream/85 via-45% to-transparent dark:from-[#0a0e17] dark:via-[#0a0e17]/85 dark:via-45% dark:to-transparent"
        aria-hidden="true"
      />

      {/* Main Hero Content Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10 py-16 lg:py-24">
        <div className="max-w-2xl text-left">
          
          {/* 1. Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-bg-card/80 backdrop-blur-sm border border-line shadow-sm text-sm font-medium text-brand mb-6">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
            <span>Personal finance and wealth clarity</span>
          </div>

          {/* 2. Main Headline (Large Fraunces Typography) */}
          <h1
            id="hero-title"
            className="font-serif font-bold text-5xl md:text-6xl xl:text-7xl tracking-tight leading-[1.05] text-ink text-balance"
          >
            Your home base for{' '}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand via-[#b9824a] to-info">
              Financial clarity
            </span>
          </h1>

          {/* 3. Subheadline */}
          <p className="mt-6 text-lg xl:text-xl text-ink-body max-w-xl leading-relaxed">
            SpendWise brings your expenses, income and monthly budgets into one unified, distraction-free dashboard. Know where every rupee goes.
          </p>

          {/* 4. Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <span>Go to dashboard</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <span>Start tracking free</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </Link>

                <Link
                  to="/login"
                  className="bg-white/90 dark:bg-bg-card/90 border border-line text-ink font-semibold text-base px-8 py-4 rounded-xl hover:bg-white dark:hover:bg-bg-hover shadow-sm transition duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span>Sign in to dashboard</span>
                </Link>
              </>
            )}
          </div>

          {/* 5. Trust Row (One clean row on desktop >= 1024px with thin dividers, honest claims) */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-soft">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Shield className="w-4 h-4 text-brand stroke-[2.2]" />
              <span>Secure JWT authentication</span>
            </div>
            <span className="hidden xl:inline text-line font-light" aria-hidden="true">|</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Lock className="w-4 h-4 text-brand stroke-[2.2]" />
              <span>Passwords hashed with bcrypt</span>
            </div>
            <span className="hidden xl:inline text-line font-light" aria-hidden="true">|</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Zap className="w-4 h-4 text-info stroke-[2.2]" />
              <span>Real-time LKR (Rs.) tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Glass Chip (Bottom-Right, non-overlapping) */}
      <div className="hidden lg:flex absolute right-10 xl:right-20 bottom-12 xl:bottom-16 z-10 pointer-events-none animate-float">
        <div className="bg-white/85 dark:bg-bg-card/85 backdrop-blur-md rounded-2xl border border-white/80 dark:border-line shadow-xl py-3 px-4 flex items-center gap-2.5 text-xs font-semibold text-ink">
          <CheckCircle2 className="w-4 h-4 text-income stroke-[2.5]" />
          <span>Budget on track</span>
        </div>
      </div>

      {/* Scroll Cue (Animated subtle chevron at bottom center) */}
      <a
        href="#features"
        aria-label="Scroll to features"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-2 text-ink-soft hover:text-brand transition-colors animate-bounce"
      >
        <ChevronDown className="w-5 h-5" />
      </a>
    </section>
  );
};

export default HeroSection;
