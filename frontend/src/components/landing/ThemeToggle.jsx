import React, { useState, useRef, useEffect, useId } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipId = useId();

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  };

  const handleFocus = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 200);
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleTheme}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
        aria-describedby={showTooltip ? tooltipId : undefined}
        className={`relative w-10 h-10 rounded-xl border border-line bg-card/70 text-ink flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs hover-fine:border-brand/40 hover-fine:bg-cream-hover hover-fine:text-brand hover-fine:shadow-sm active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${className}`}
      >
        <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
          {/* Sun Icon (displayed in dark mode to switch to light) */}
          <Sun
            className={`w-5 h-5 text-brand absolute transition-all duration-300 transform motion-reduce:transition-none motion-reduce:transform-none ${
              isDark
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-90 scale-60 pointer-events-none'
            }`}
            strokeWidth={2}
          />
          {/* Moon Icon (displayed in light mode to switch to dark) */}
          <Moon
            className={`w-4.5 h-4.5 text-brand absolute transition-all duration-300 transform motion-reduce:transition-none motion-reduce:transform-none ${
              isDark
                ? 'opacity-0 rotate-90 scale-60 pointer-events-none'
                : 'opacity-100 rotate-0 scale-100'
            }`}
            strokeWidth={2}
          />
        </div>
      </button>

      {/* 200ms delayed tooltip */}
      {showTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none z-50 whitespace-nowrap bg-ink text-cream text-xs px-2 py-1 rounded-md shadow-md animate-in fade-in duration-150 motion-reduce:animate-none"
        >
          {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
