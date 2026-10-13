import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-cream flex items-center"
    >
      {/* ─── Hero Background Photo ────────────────────────────────────── */}
      <img
        src="/hero.webp"
        alt="Woman reviewing financial budgets on modern smartphone"
        fetchpriority="high"
        decoding="async"
        width="2560"
        height="1440"
        className="absolute inset-0 w-full h-full object-cover object-[65%_center] md:object-[70%_center] lg:object-[80%_center] pointer-events-none select-none z-0 dark:brightness-90 transition-all duration-300"
      />

      {/* ─── Gradient Overlays: Ensure Right Side (Face & Phone) Stays Crisp ─── */}
      {/* Desktop Left-to-Right Cream Gradient */}
      <div
        className="hidden lg:block absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-cream via-cream/85 via-35% to-transparent to-62%"
        aria-hidden="true"
      />

      {/* Mobile/Tablet Vertical Gradient Overlay */}
      <div
        className="lg:hidden absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-cream via-cream/90 via-45% to-cream/10"
        aria-hidden="true"
      />

      {/* ─── Hero Content Column ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full py-20 lg:py-28 relative z-20">
        <div className="max-w-2xl text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* 1. Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card/85 border border-line shadow-xs text-sm font-medium text-brand mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
            </span>
            <span>Personal finance and wealth clarity</span>
          </div>

          {/* 2. Headline H1 */}
          <h1
            id="hero-title"
            className="font-serif font-bold tracking-tight leading-[1.05] text-balance text-5xl md:text-6xl xl:text-7xl"
          >
            <span className="block text-ink">Your Home Base for</span>
            <span className="block bg-gradient-to-r from-brand via-amber-600 to-sky-600 bg-clip-text text-transparent">
              Financial Clarity
            </span>
          </h1>

          {/* 3. Value Proposition Paragraph */}
          <p className="mt-6 text-lg xl:text-xl text-ink-body max-w-xl leading-relaxed">
            SpendWise brings all your expenses, income streams, and monthly budgets into one unified, distraction-free dashboard. Know where every rupee goes.
          </p>

          {/* 4. Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <span>Start Tracking Free</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </Link>

                <Link
                  to="/login"
                  className="bg-card hover:bg-cream-hover border border-line text-ink font-semibold text-base px-8 py-4 rounded-xl shadow-xs hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span>Sign In to Dashboard</span>
                </Link>
              </>
            )}
          </div>

          {/* 5. Trust Row (ONE honest row on desktop with thin dividers, wrapping cleanly on mobile) */}
          <div className="mt-10 pt-4 flex flex-wrap md:flex-nowrap items-center gap-x-6 gap-y-3 text-sm text-ink-soft">
            <div className="flex items-center gap-2 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <span>Secure JWT authentication</span>
            </div>

            <span className="hidden md:inline-block text-line" aria-hidden="true">
              |
            </span>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Lock className="w-4 h-4 text-brand" />
              <span>Passwords hashed with bcrypt</span>
            </div>

            <span className="hidden md:inline-block text-line" aria-hidden="true">
              |
            </span>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Zap className="w-4 h-4 text-brand" />
              <span>Real-time LKR (Rs.) tracking</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tiny Animated Down Chevron Linking to #how-it-works */}
      <a
        href="#how-it-works"
        aria-label="Scroll to how it works section"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 p-2 text-ink-soft hover:text-brand transition-colors animate-bounce"
      >
        <ChevronDown className="w-5 h-5" />
      </a>
    </section>
  );
};

export default Hero;
