import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  BellOff,
  CheckCheck,
  X,
  AlertTriangle,
  OctagonAlert,
  CalendarClock,
  Target,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime, formatDate, groupNotificationsByDate } from '../../utils/helpers';

/**
 * Returns icon, severity label, and token styling for a given notification type/severity
 */
const getSeverityConfig = (severity, type) => {
  if (severity === 'danger' || type === 'budget_exceeded' || type === 'budget_critical') {
    return {
      Icon: OctagonAlert,
      iconClass: 'bg-expense/10 text-expense border-expense/25',
      leftBorder: 'border-l-expense',
      label: 'Critical alert',
    };
  }
  if (severity === 'warning' || type === 'budget_warning') {
    return {
      Icon: AlertTriangle,
      iconClass: 'bg-warn/10 text-warn border-warn/25',
      leftBorder: 'border-l-warn',
      label: 'Warning alert',
    };
  }
  if (type === 'budget_ending') {
    return {
      Icon: CalendarClock,
      iconClass: 'bg-info/10 text-info border-info/25',
      leftBorder: 'border-l-info',
      label: 'Notice',
    };
  }
  return {
    Icon: Target,
    iconClass: 'bg-brand-soft text-brand border-brand/25',
    leftBorder: 'border-l-brand',
    label: 'Reminder',
  };
};

const NotificationsPanel = ({ isOpen, onClose, anchorRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef(null);

  const {
    unreadCount,
    notifications,
    loading,
    error,
    activeTab,
    setActiveTab,
    markRead,
    markAllRead,
    dismiss,
    fetchNotifications,
  } = useNotifications();

  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, isFlipped: false });
  const [isMobile, setIsMobile] = useState(false);

  // 1. Detect screen size and viewport positioning
  useEffect(() => {
    const updatePosition = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);

      if (mobile || !anchorRef?.current) return;

      const rect = anchorRef.current.getBoundingClientRect();
      const panelWidth = 380;
      const margin = 12;

      // Calculate right-aligned coordinate
      let right = window.innerWidth - rect.right;
      if (right < margin) right = margin;

      // Vertical position (flip upward if close to bottom of viewport)
      const spaceBelow = window.innerHeight - rect.bottom;
      const isFlipped = spaceBelow < 400 && rect.top > 400;

      const top = isFlipped ? undefined : rect.bottom + 8;
      const bottom = isFlipped ? window.innerHeight - rect.top + 8 : undefined;

      setCoords({ top, bottom, right, isFlipped });
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorRef]);

  // 2. Lock body scroll on mobile bottom sheet
  useEffect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMobile]);

  // 3. Keyboard handlers (Escape closes and returns focus to bell)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        anchorRef?.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, anchorRef]);

  // 4. Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // 5. Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!isOpen) return null;

  const grouped = groupNotificationsByDate(notifications);
  const hasNotifications = notifications.length > 0;

  const handleItemClick = (notif) => {
    if (!notif.readAt) {
      markRead(notif._id);
    }
    onClose();
    navigate(notif.link || '/budgets');
  };

  const panelContent = (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-[9998] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Panel / Bottom Sheet */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        aria-modal={isMobile ? 'true' : 'false'}
        tabIndex={-1}
        style={
          isMobile
            ? undefined
            : {
                position: 'fixed',
                top: coords.top !== undefined ? `${coords.top}px` : undefined,
                bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                right: `${coords.right}px`,
                width: '380px',
                zIndex: 9999,
              }
        }
        className={
          isMobile
            ? 'fixed bottom-0 inset-x-0 w-full rounded-t-2xl max-h-[85dvh] bg-card border-t border-line shadow-2xl z-[9999] flex flex-col animate-slide-up'
            : 'max-h-[min(560px,80dvh)] bg-card border border-line rounded-2xl shadow-xl flex flex-col overflow-hidden animate-dash-fade'
        }
      >
        {/* Mobile Drag Indicator Bar */}
        {isMobile && (
          <div className="w-full flex justify-center pt-2.5 pb-1">
            <div className="w-10 h-1 rounded-full bg-line" />
          </div>
        )}

        {/* Panel Header */}
        <div className="p-4 border-b border-line flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-semibold text-ink tracking-tight">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-soft text-brand tabular-nums">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-brand hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>

            {isMobile && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notifications"
                className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-hover transition cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs: All vs Unread */}
        <div
          role="tablist"
          aria-label="Filter notifications"
          className="px-4 py-2 border-b border-line/60 bg-cream-band/40 flex items-center gap-2 flex-shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-card text-ink shadow-xs border border-line'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'unread'}
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'bg-card text-ink shadow-xs border border-line'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
            )}
          </button>
        </div>

        {/* Notification Items List Container */}
        <div
          role="list"
          className="flex-1 overflow-y-auto divide-y divide-line/40 app-scroll min-h-[200px]"
        >
          {loading && !hasNotifications ? (
            /* Loading Skeleton Rows */
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-cream-band flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-cream-band rounded w-1/2" />
                    <div className="h-3 bg-cream-band rounded w-5/6" />
                    <div className="h-2.5 bg-cream-band rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-expense/10 text-expense mx-auto flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <p className="text-sm font-semibold text-ink">We couldn&apos;t load notifications</p>
              <button
                type="button"
                onClick={() => fetchNotifications(1, activeTab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-card hover:bg-cream-hover text-xs font-semibold text-ink transition cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Try again</span>
              </button>
            </div>
          ) : !hasNotifications ? (
            /* Empty State */
            <div className="p-8 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand mx-auto flex items-center justify-center shadow-2xs">
                <BellOff size={22} strokeWidth={2.2} />
              </div>
              <h3 className="font-serif text-base font-semibold text-ink">
                You are all caught up
              </h3>
              <p className="text-xs text-ink-soft max-w-[240px] mx-auto leading-relaxed">
                Budget alerts and financial reminders will appear here when thresholds are crossed.
              </p>
            </div>
          ) : (
            /* Grouped Notifications List */
            ['Today', 'Yesterday', 'Earlier'].map((groupName) => {
              const items = grouped[groupName];
              if (!items || items.length === 0) return null;

              return (
                <div key={groupName}>
                  <div className="sticky top-0 z-10 px-4 py-1 bg-card/95 backdrop-blur-xs border-y border-line/50 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                    {groupName}
                  </div>

                  {items.map((notif) => {
                    const isUnread = !notif.readAt;
                    const config = getSeverityConfig(notif.severity, notif.type);
                    const SeverityIcon = config.Icon;
                    const fullDateStr = formatDate(notif.createdAt, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });

                    return (
                      <div
                        key={notif._id}
                        role="listitem"
                        tabIndex={0}
                        onClick={() => handleItemClick(notif)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleItemClick(notif);
                          }
                        }}
                        className={`group min-h-[72px] px-4 py-3 flex items-start gap-3 transition-colors hover:bg-cream-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 relative ${
                          isUnread
                            ? `bg-brand/5 border-l-[3px] ${config.leftBorder}`
                            : 'border-l-[3px] border-l-transparent'
                        }`}
                      >
                        {/* Severity Icon Tile */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-2xs ${config.iconClass}`}
                        >
                          <SeverityIcon size={18} strokeWidth={2.2} />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5">
                            <span className="sr-only">{config.label}: </span>
                            <span
                              className={`text-sm tracking-tight truncate ${
                                isUnread ? 'font-bold text-ink' : 'font-medium text-ink-body'
                              }`}
                            >
                              {notif.title}
                            </span>
                          </div>

                          <p className="text-xs text-ink-body leading-snug mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>

                          <time
                            dateTime={notif.createdAt}
                            title={fullDateStr}
                            className="text-[11px] text-ink-soft mt-1.5 block tabular-nums"
                          >
                            {formatRelativeTime(notif.createdAt)}
                          </time>
                        </div>

                        {/* Right Actions: Unread dot & Dismiss button */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full bg-brand flex-shrink-0"
                              aria-label="Unread"
                            />
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismiss(notif._id);
                            }}
                            aria-label="Dismiss notification"
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-1 rounded-md text-ink-soft hover:text-ink hover:bg-card border border-transparent hover:border-line transition cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="border-t border-line bg-card flex-shrink-0">
          <Link
            to="/notifications"
            onClick={onClose}
            className="block w-full py-2.5 text-center text-xs font-semibold text-ink-soft hover:text-brand hover:bg-cream-hover transition"
          >
            View all notifications &rarr;
          </Link>
        </div>
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
};

export default NotificationsPanel;
