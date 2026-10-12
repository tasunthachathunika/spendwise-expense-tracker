import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FinalCta = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 lg:py-28 bg-cream dark:bg-[#0a0e17]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="relative bg-[#1f1b16] text-[#fdf9ef] rounded-3xl p-10 sm:p-14 lg:p-20 overflow-hidden shadow-2xl text-center">
          
          {/* Subtle Decorative Geometric Circles (solid lines, no blur) */}
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full border border-white/10 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-28 -right-28 w-96 h-96 rounded-full border border-[#ea580c]/20 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
              Take control of your money today
            </h2>
            <p className="mt-5 text-neutral-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              Join students, developers, and professionals managing their cash flow with absolute clarity on SpendWise.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-brand/30 hover:-translate-y-0.5 transition duration-200 flex items-center gap-2"
                >
                  <span>Open your dashboard</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-brand/30 hover:-translate-y-0.5 transition duration-200 flex items-center gap-2"
                  >
                    <span>Get started free</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </Link>
                  <Link
                    to="/login"
                    className="border border-white/20 text-white hover:bg-white/10 font-semibold text-base px-8 py-4 rounded-xl transition duration-200"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 text-xs text-neutral-400">
              No credit card required • Instant setup • 100% Free
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FinalCta;
