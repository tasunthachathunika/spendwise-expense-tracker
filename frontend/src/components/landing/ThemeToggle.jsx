import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-10 h-10 rounded-xl border border-line bg-card hover:bg-cream-hover text-ink flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <Sun
          className={`w-5 h-5 text-amber-500 absolute transition-all duration-300 transform ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
          strokeWidth={2}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-4.5 h-4.5 text-brand absolute transition-all duration-300 transform ${
            isDark
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100'
          }`}
          strokeWidth={2}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
