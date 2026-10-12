import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMenuClick, title = "Dashboard", subtitle = "Welcome back" }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="hamburger-btn" 
          onClick={onMenuClick}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="topbar-title font-serif tracking-tight text-ink">{title}</h1>
          <p className="topbar-subtitle text-ink-soft">{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-bg-card border border-line hover:border-line-light text-ink-soft hover:text-ink transition flex items-center gap-1.5 text-xs font-semibold"
            title={isDark ? "Switch to Warm Cream Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <Sun size={16} className="text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-brand" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <div className="user-avatar" title={user?.name}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
