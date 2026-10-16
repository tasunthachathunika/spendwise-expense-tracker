import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useProximity } from '../../hooks/useProximity';
import ThemeToggle from './ThemeToggle';
import SpendWiseLogo from './SpendWiseLogo';

const NAV_ITEMS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'budgets', label: 'Budget System' },
  { id: 'security', label: 'Security' },
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { isVisible, isScrolled, scrollProgress } = useScrollDirection();

  const headerRef = useRef(null);
  const navRef = useRef(null);
  const ctaRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  const [pillStyle, setPillStyle] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const shouldShow = isVisible || mobileMenuOpen;

  // Subtle cursor proximity effects (spotlight & magnetic pull) on primary CTA
  useProximity(headerRef, ctaRef, { disabled: mobileMenuOpen || !shouldShow });

  // Check if device supports hover with fine pointer
  const isHoverFine = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  };

  const updatePill = (targetEl) => {
    if (!navRef.current || !targetEl) return;
    const navRect = navRef.current.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    setPillStyle({
      x: targetRect.left - navRect.left,
      y: targetRect.top - navRect.top,
      width: targetRect.width,
      height: targetRect.height,
      opacity: 1,
    });
  };

  const hidePill = () => {
    setPillStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleLinkMouseEnter = (targetEl) => {
    if (!isHoverFine()) return;
    updatePill(targetEl);
  };

  const handleLinkFocus = (targetEl) => {
    updatePill(targetEl);
  };

  const handleNavBlur = (e) => {
    if (navRef.current && !navRef.current.contains(e.relatedTarget)) {
      hidePill();
    }
  };

  // Recalculate pill on resize or hide cleanly
  useEffect(() => {
    const handleResize = () => {
      hidePill();
    };
    window.addEventListener('resize', handleResize, { passive: true });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (navRef.current?.contains(document.activeElement)) {
          updatePill(document.activeElement);
        }
      });
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle active section highlight detection
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 120;
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
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle Escape key to close mobile drawer and return focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        if (hamburgerBtnRef.current) {
          hamburgerBtnRef.current.focus();
        }
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
      ref={headerRef}
      className={`sticky top-0 z-50 w-full h-16 border-b transition-[transform,background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out will-change-transform motion-reduce:transition-none focus-within:translate-y-0 ${
        shouldShow
          ? 'translate-y-0'
          : '-translate-y-full pointer-events-none focus-within:pointer-events-auto'
      } ${isScrolled ? 'navbar-glass-scrolled' : 'navbar-glass-top'}`}
    >
      {/* 3-Column Grid: min-w-0 on side columns, center column sized auto so it never shrinks or wraps */}
      <div className="container-page h-full grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center">
        {/* Left Column: Brand Logo (flush with container edge) */}
        <div className="flex items-center justify-start min-w-0">
          <Link
            to="/"
            className="navbar-logo-link inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            aria-label="SpendWise home"
          >
            <SpendWiseLogo size="sm" showTagline={true} />
          </Link>
        </div>

        {/* Center Column: Desktop Nav Links with Sliding Pill (Never wraps) */}
        <div className="hidden lg:flex items-center justify-center">
          <nav
            ref={navRef}
            onMouseLeave={hidePill}
            onBlur={handleNavBlur}
            className="relative flex items-center gap-1 p-1"
            aria-label="Main navigation"
          >
            {/* Sliding Pill Highlight Element */}
            <div
              className="absolute pointer-events-none rounded-lg bg-cream-hover dark:bg-card/60 border border-line/60 transition-[transform,width,height,opacity] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${pillStyle.x}px, ${pillStyle.y}px, 0)`,
                width: `${pillStyle.width}px`,
                height: `${pillStyle.height}px`,
                opacity: pillStyle.opacity,
              }}
              aria-hidden="true"
            />

            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  onMouseEnter={(e) => handleLinkMouseEnter(e.currentTarget)}
                  onFocus={(e) => handleLinkFocus(e.currentTarget)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative z-10 whitespace-nowrap shrink-0 inline-flex items-center justify-center h-10 px-3.5 lg:px-2.5 xl:px-3.5 rounded-lg text-sm font-medium leading-none transition-colors duration-200 cursor-pointer active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                    isActive
                      ? 'text-brand font-semibold'
                      : 'text-ink-body hover-fine:text-ink'
                  }`}
                >
                  <span>{item.label}</span>

                  {/* 2px Rounded Active Indicator Underline */}
                  <span
                    className={`absolute bottom-1 left-3 right-3 h-[2px] bg-brand rounded-full transition-transform duration-250 ease-out origin-center pointer-events-none motion-reduce:transition-none ${
                      isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Column: Desktop Action Buttons (All h-10 matching nav line) */}
        <div className="hidden lg:flex items-center justify-end gap-2 shrink-0 min-w-0">
          <ThemeToggle isNavbarVisible={shouldShow} />

          {isAuthenticated ? (
            <button
              ref={ctaRef}
              onClick={() => navigate('/dashboard')}
              style={{
                transform: 'translate3d(var(--tx, 0), var(--ty, 0), 0)',
                transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1), background-color 200ms ease, box-shadow 200ms ease',
              }}
              className="group/cta relative overflow-hidden isolate h-10 px-5 rounded-xl bg-brand hover-fine:bg-brand-dark text-white font-semibold text-sm shadow-sm shadow-brand/25 hover-fine:shadow-md hover-fine:shadow-brand/30 hover-fine:-translate-y-px active:translate-y-0 active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              {/* Soft cursor-aware spotlight radial highlight */}
              <div
                className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200"
                style={{
                  opacity: 'var(--spotlight-opacity, 0)',
                  background: 'radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.22), transparent 60%)',
                }}
                aria-hidden="true"
              />
              <span className="relative z-10">Go to Dashboard</span>
              <ArrowRight className="relative z-10 w-4 h-4 stroke-[2.5] transition-transform duration-200 hover-fine:group-hover/cta:translate-x-0.5 motion-reduce:transform-none" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="h-10 px-3.5 inline-flex items-center justify-center rounded-lg text-sm font-medium text-ink transition-colors duration-200 cursor-pointer hover-fine:bg-cream-hover dark:hover-fine:bg-card/60 active:scale-[0.97] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Sign In
              </Link>
              <Link
                ref={ctaRef}
                to="/register"
                style={{
                  transform: 'translate3d(var(--tx, 0), var(--ty, 0), 0)',
                  transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1), background-color 200ms ease, box-shadow 200ms ease',
                }}
                className="group/cta relative overflow-hidden isolate h-10 px-5 rounded-xl bg-brand hover-fine:bg-brand-dark text-white font-semibold text-sm shadow-sm shadow-brand/25 hover-fine:shadow-md hover-fine:shadow-brand/30 hover-fine:-translate-y-px active:translate-y-0 active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                {/* Soft cursor-aware spotlight radial highlight */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200"
                  style={{
                    opacity: 'var(--spotlight-opacity, 0)',
                    background: 'radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.22), transparent 60%)',
                  }}
                  aria-hidden="true"
                />
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="relative z-10 w-4 h-4 stroke-[2.5] transition-transform duration-200 hover-fine:group-hover/cta:translate-x-0.5 motion-reduce:transform-none" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right Column: ThemeToggle + Hamburger */}
        <div className="flex lg:hidden items-center justify-end gap-2">
          <ThemeToggle isNavbarVisible={shouldShow} />
          <button
            ref={hamburgerBtnRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 shrink-0 rounded-xl border border-line bg-card/70 text-ink flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden pointer-events-none">
              <Menu
                className={`w-5 h-5 absolute transition-all duration-200 motion-reduce:transition-none transform ${
                  mobileMenuOpen
                    ? 'opacity-0 rotate-90 scale-75 pointer-events-none'
                    : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                className={`w-5 h-5 absolute transition-all duration-200 motion-reduce:transition-none transform ${
                  mobileMenuOpen
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-75 pointer-events-none'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Subtle Hairline Glow Line (faint 1px gradient, visible only when scrolled) */}
      <div
        className={`navbar-hairline-glow ${isScrolled ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />

      {/* 2px Brand Scroll Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-brand transition-[width] duration-150 ease-out motion-reduce:hidden pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Mobile Slide-down Drawer Panel with Dim Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Dim Overlay below the bar that closes on click */}
          <div
            className="fixed inset-0 top-16 bg-ink/30 backdrop-blur-2xs z-40 transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu panel sliding down from under the bar */}
          <div className="mobile-nav-panel absolute top-16 left-0 right-0 z-50 bg-cream/95 dark:bg-card/95 backdrop-blur-xl border-b border-line transform transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2 motion-reduce:transform-none motion-reduce:transition-none">
            <div className="container-page py-6 space-y-5">
              <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      aria-current={isActive ? 'location' : undefined}
                      className={`w-full text-left py-3 px-3.5 rounded-xl text-base font-medium transition-colors cursor-pointer active:scale-[0.99] ${
                        isActive
                          ? 'bg-brand-soft text-brand font-semibold'
                          : 'text-ink-body active:bg-cream-hover'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-line flex flex-col gap-3">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full py-3 rounded-xl bg-brand text-white text-sm font-semibold shadow-sm shadow-brand/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 rounded-xl border border-line bg-card/70 text-sm font-semibold text-ink active:bg-cream-hover active:scale-[0.98] transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 rounded-xl bg-brand text-white text-sm font-semibold shadow-sm shadow-brand/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
