import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FinalCtaSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-10 md:py-14 bg-cream border-t border-[#e9e1ca] dark:border-[#352d23]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Card Container */}
        <div className="relative max-w-4xl mx-auto rounded-3xl p-6 md:p-10 overflow-hidden transition-all duration-300 bg-gradient-to-br from-white via-[#fdf9ef] to-[#ffedd5]/50 border border-[#e9e1ca] shadow-xl shadow-[#ea580c]/10 dark:bg-gradient-to-br dark:from-[#211c16] dark:via-[#1b1712] dark:to-[#14110d] dark:border dark:border-[#ea580c]/30 dark:shadow-2xl dark:shadow-[#ea580c]/20 text-center">
          
          {/* Ambient Colorful Lights (Blurred orbs) */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#ea580c]/10 dark:bg-[#ea580c]/20 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#15803d]/10 dark:bg-[#4ade80]/15 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Card Content with tight vertical spacing */}
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-3 md:space-y-4">
            
            {/* Top Badge (Compact Pill) */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase transition-colors bg-[#ffedd5] text-[#ea580c] border border-[#ea580c]/30 dark:bg-[#ea580c]/15 dark:text-[#fb923c] dark:border-[#ea580c]/40">
              <Sparkles className="w-3.5 h-3.5" />
              START TODAY
            </span>

            {/* Main Heading */}
            <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-center tracking-tight text-[#1f1b16] dark:text-[#f7f1e6]">
              Take control of your money today
            </h2>

            {/* Subtitle */}
            <p className="font-sans text-sm md:text-base text-[#4a443a] dark:text-[#d6cdbd] max-w-xl mx-auto text-center leading-relaxed">
              Join individuals bringing calm, clarity, and intentionality to their everyday personal finances with SpendWise.
            </p>

            {/* Dual Action Buttons (Inline Row) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-sm md:text-base px-6 py-3 rounded-xl shadow-lg shadow-[#ea580c]/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]/50"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
                </button>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-sm md:text-base px-6 py-3 rounded-xl shadow-lg shadow-[#ea580c]/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]/50"
                  >
                    <span>Get started free</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
                  </Link>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto bg-white border border-[#e9e1ca] text-[#1f1b16] hover:bg-[#faf5e6] dark:bg-[#26211a] dark:border-[#352d23] dark:text-[#f7f1e6] dark:hover:bg-[#352d23] rounded-xl px-6 py-3 font-semibold text-sm md:text-base transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]/50"
                  >
                    <span>Sign in</span>
                  </Link>
                </>
              )}
            </div>

            {/* Bottom Trust Footer Note */}
            <p className="text-xs text-[#7a7263] dark:text-[#a39a88] text-center pt-1">
              100% Free • No credit card required • Instant setup
            </p>

          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
