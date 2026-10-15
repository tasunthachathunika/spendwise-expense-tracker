import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime, formatDate, groupNotificationsByDate } from '../utils/helpers';

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

const Notifications = () => {
  const navigate = useNavigate();
  const {
    unreadCount,
    notifications,
    loading,
    error,
    activeTab,
    setActiveTab,
    page,
    totalPages,
    markRead,
    markAllRead,
    dismiss,
    dismissAllRead,
    fetchNotifications,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications(1, activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleItemClick = (notif) => {
    if (!notif.readAt) {
      markRead(notif._id);
    }
    navigate(notif.link || '/budgets');
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchNotifications(page - 1, activeTab);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchNotifications(page + 1, activeTab);
    }
  };

  const grouped = groupNotificationsByDate(notifications);
  const hasNotifications = notifications.length > 0;
  const hasReadNotifications = notifications.some((n) => Boolean(n.readAt));

  return (
    <div className="space-y-6">
      {/* Top Card / Container */}
      <div className="bg-card border border-line rounded-2xl shadow-xs overflow-hidden">
        {/* Header toolbar */}
        <div className="p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-xl font-bold text-ink tracking-tight">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-soft text-brand tabular-nums">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-ink-soft mt-1">
              Real-time budget alerts, threshold warnings, and reminders
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-card hover:bg-cream-hover text-xs font-semibold text-ink disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <CheckCheck size={14} className="text-brand" />
              <span>Mark all as read</span>
            </button>

            {hasReadNotifications && (
              <button
                type="button"
                onClick={dismissAllRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-card hover:bg-cream-hover text-xs font-semibold text-ink-soft hover:text-expense transition cursor-pointer"
                title="Dismiss all read notifications"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Clear read</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div
          role="tablist"
          aria-label="Filter notifications"
          className="px-6 py-3 border-b border-line/60 bg-cream-band/30 flex items-center gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
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

        {/* Notifications List Body */}
        <div role="list" className="divide-y divide-line/40 min-h-[280px]">
          {loading && !hasNotifications ? (
            /* Loading Skeleton */
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3.5 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-cream-band flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-cream-band rounded w-1/3" />
                    <div className="h-3.5 bg-cream-band rounded w-4/5" />
                    <div className="h-3 bg-cream-band rounded w-1/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-expense/10 text-expense mx-auto flex items-center justify-center">
                <AlertCircle size={22} />
              </div>
              <h3 className="font-serif text-base font-semibold text-ink">
                We couldn&apos;t load notifications
              </h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                There was a problem retrieving your notification feed. Please try again.
              </p>
              <button
                type="button"
                onClick={() => fetchNotifications(page, activeTab)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-line bg-card hover:bg-cream-hover text-xs font-semibold text-ink transition cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Try again</span>
              </button>
            </div>
          ) : !hasNotifications ? (
            /* Empty State */
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-soft text-brand mx-auto flex items-center justify-center shadow-xs">
                <BellOff size={26} strokeWidth={2.2} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink">
                You are all caught up
              </h3>
              <p className="text-sm text-ink-soft max-w-sm mx-auto leading-relaxed">
                Budget alerts and financial reminders will appear here when thresholds are reached.
              </p>
            </div>
          ) : (
            /* Grouped List */
            ['Today', 'Yesterday', 'Earlier'].map((groupName) => {
              const items = grouped[groupName];
              if (!items || items.length === 0) return null;

              return (
                <div key={groupName}>
                  <div className="sticky top-0 z-10 px-6 py-2 bg-card/95 backdrop-blur-xs border-y border-line/50 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                    {groupName}
                  </div>

                  {items.map((notif) => {
                    const isUnread = !notif.readAt;
                    const config = getSeverityConfig(notif.severity, notif.type);
                    const SeverityIcon = config.Icon;
                    const fullDateStr = formatDate(notif.createdAt, {
                      dateStyle: 'long',
                      timeStyle: 'medium',
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
                        className={`group px-6 py-4 flex items-start gap-4 transition-colors hover:bg-cream-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 relative ${
                          isUnread
                            ? `bg-brand/5 border-l-4 ${config.leftBorder}`
                            : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        {/* Icon tile */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-2xs ${config.iconClass}`}
                        >
                          <SeverityIcon size={20} strokeWidth={2.2} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="sr-only">{config.label}: </span>
                            <span
                              className={`text-sm tracking-tight ${
                                isUnread ? 'font-bold text-ink' : 'font-medium text-ink-body'
                              }`}
                            >
                              {notif.title}
                            </span>
                          </div>

                          <p className="text-sm text-ink-body leading-relaxed mt-1">
                            {notif.message}
                          </p>

                          <time
                            dateTime={notif.createdAt}
                            title={fullDateStr}
                            className="text-xs text-ink-soft mt-2 block tabular-nums"
                          >
                            {formatRelativeTime(notif.createdAt)}
                          </time>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                          {isUnread && (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-brand flex-shrink-0"
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
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-card border border-transparent hover:border-line transition cursor-pointer"
                          >
                            <X size={15} />
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-line bg-card flex items-center justify-between text-xs text-ink-soft">
            <span>
              Page <strong className="text-ink font-semibold">{page}</strong> of{' '}
              <strong className="text-ink font-semibold">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-line bg-card hover:bg-cream-hover text-ink disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-line bg-card hover:bg-cream-hover text-ink disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
