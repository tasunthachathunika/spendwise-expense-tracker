import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationsPanel from './notifications/NotificationsPanel';

const Navbar = ({ onMenuClick, title = "Dashboard", subtitle = "Welcome back" }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [hasRung, setHasRung] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const bellRef = useRef(null);
  const prevCountRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      const diff = unreadCount - prevCountRef.current;
      setLiveAnnouncement(`${diff} new notification${diff > 1 ? 's' : ''}`);
      setHasRung(true);
      const timer = setTimeout(() => setHasRung(false), 700);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

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
          {/* Notifications Bell */}
          <div className="relative">
            <button
              ref={bellRef}
              id="notifications-bell-button"
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              className="w-10 h-10 rounded-xl bg-card border border-line hover:bg-cream-hover text-ink-soft hover:text-ink transition flex items-center justify-center relative cursor-pointer"
            >
              <Bell
                size={18}
                className={hasRung ? 'animate-bell-ring text-brand' : 'text-ink-soft'}
              />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-expense text-white text-[11px] font-semibold flex items-center justify-center leading-none ring-2 ring-card shadow-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Polite live region for screen-reader announcements */}
            <div className="sr-only" aria-live="polite">
              {liveAnnouncement}
            </div>

            <NotificationsPanel
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              anchorRef={bellRef}
            />
          </div>

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
