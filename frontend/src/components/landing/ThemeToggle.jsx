import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '', isNavbarVisible = true }) => {
  const { isDark, toggleTheme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);
  const tooltipId = useId();

  const updateTooltipPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setTooltipPos({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateTooltipPosition();
      setShowTooltip(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  const handleFocus = () => {
    updateTooltipPosition();
    setShowTooltip(true);
  };

  const handleBlur = () => {
    hideTooltip();
  };

  // Close tooltip if navbar hides on scroll down
  useEffect(() => {
    if (!isNavbarVisible) {
      hideTooltip();
    }
  }, [isNavbarVisible]);

  // Close on scroll, window resize, or Escape key
  useEffect(() => {
    if (!showTooltip) return;

    const handleScrollOrResize = () => {
      hideTooltip();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        hideTooltip();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleTheme}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
        aria-describedby={showTooltip ? tooltipId : undefined}
        className={`relative w-10 h-10 shrink-0 rounded-xl border border-line bg-card/70 text-ink flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs hover-fine:border-ink-soft/40 hover-fine:bg-cream-hover hover-fine:text-ink active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${className}`}
      >
        <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden pointer-events-none">
          {/* Sun Icon (displayed in dark mode to switch to light) */}
          <Sun
            className={`w-5 h-5 text-ink absolute transition-all duration-300 transform motion-reduce:transition-none motion-reduce:transform-none ${
              isDark
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-90 scale-60 pointer-events-none'
            }`}
            strokeWidth={2}
          />
          {/* Moon Icon (displayed in light mode to switch to dark) */}
          <Moon
            className={`w-4.5 h-4.5 text-ink absolute transition-all duration-300 transform motion-reduce:transition-none motion-reduce:transform-none ${
              isDark
                ? 'opacity-0 rotate-90 scale-60 pointer-events-none'
                : 'opacity-100 rotate-0 scale-100'
            }`}
            strokeWidth={2}
          />
        </div>
      </button>

      {/* Render tooltip in document.body via Portal to prevent any stacking context clipping */}
      {showTooltip && typeof document !== 'undefined' && createPortal(
        <div
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
          className="pointer-events-none select-none whitespace-nowrap bg-ink text-cream text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg animate-in fade-in duration-150 motion-reduce:animate-none flex items-center justify-center"
        >
          {/* 6px upward pointing arrow */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-ink rotate-45 pointer-events-none"
            aria-hidden="true"
          />
          <span className="relative z-10">
            {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          </span>
        </div>,
        document.body
      )}
    </>
  );
};

export default ThemeToggle;
