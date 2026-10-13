import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import SpendWiseLogo from './SpendWiseLogo';

const NAV_ITEMS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'budgets', label: 'Budget System' },
  { id: 'security', label: 'Security' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle scroll detection for sticky border & active section highlight
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);

      // Determine active section based on current scroll position
      const scrollPosition = scrollY + 120;
      let current = '';

      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = item.id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full h-16 bg-cream/80 backdrop-blur-md transition-colors duration-200 ${
        scrolled ? 'border-b border-line shadow-xs' : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link
          to="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-xl p-1 hover:opacity-90 transition-opacity duration-200"
          aria-label="SpendWise home"
        >
          <SpendWiseLogo size="sm" showTagline={true} />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`transition-colors cursor-pointer py-1 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-md ${
                  isActive
                    ? 'text-brand font-semibold'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-full transition-all" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand/20 hover:shadow-brand/35 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-ink-body hover:text-ink transition-colors px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand/20 hover:shadow-brand/35 hover:-translate-y-0.5 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-ink bg-card border border-line hover:bg-cream-hover transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream-band border-b border-line px-5 py-6 space-y-5 animate-in fade-in slide-in-from-top-4 duration-200 shadow-xl">
          <nav className="flex flex-col space-y-3 text-base font-medium" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`text-left py-2 px-3 rounded-xl transition cursor-pointer ${
                  activeSection === item.id
                    ? 'bg-card text-brand font-semibold shadow-xs'
                    : 'text-ink-body hover:text-ink hover:bg-card/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-line flex flex-col gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full py-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-bold shadow-md shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl border border-line bg-card text-sm font-semibold text-ink hover:bg-cream-hover transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-bold shadow-md shadow-brand/20 flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
