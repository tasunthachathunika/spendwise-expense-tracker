import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WalletCards, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'budgets', label: 'Budget system' },
  { id: 'security', label: 'Security' },
];

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      // Track active section for highlight
      const sections = navLinks.map((link) => document.getElementById(link.id));
      const scrollPos = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(navLinks[i].id);
          return;
        }
      }
      if (window.scrollY < 200) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 h-16 transition-all duration-200 ${
        scrolled
          ? 'bg-cream/90 dark:bg-[#0a0e17]/90 backdrop-blur-md border-b border-line shadow-sm'
          : 'bg-cream/70 dark:bg-[#0a0e17]/70 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
        {/* Left: SpendWise Logo Mark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-md shadow-brand/25 group-hover:scale-105 transition duration-200">
            <WalletCards className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-ink">
            Spend<span className="text-brand">Wise</span>
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`transition-colors duration-150 py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-md ${
                  isActive
                    ? 'text-brand font-semibold'
                    : 'text-ink-body hover:text-ink'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Auth Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-brand/20 hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <span>Go to dashboard</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-ink-body hover:text-ink transition-colors px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-brand/20 hover:-translate-y-0.5 transition duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-ink hover:text-brand bg-white/70 dark:bg-bg-card/70 border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream dark:bg-[#0a0e17] border-b border-line px-6 py-5 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left py-2 text-sm font-medium text-ink-body hover:text-brand transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-line flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-brand text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Go to dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-line text-sm font-semibold text-ink bg-white/60 dark:bg-bg-card/60 hover:bg-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-brand text-white font-semibold text-sm shadow-md"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
