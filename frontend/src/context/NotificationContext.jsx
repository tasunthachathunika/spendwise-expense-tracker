import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Refs for tracking previous state and active network requests
  const prevUnreadCountRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const seenDangerIdsRef = useRef(new Set());
  const abortControllerRef = useRef(null);

  // 1. Fetch unread count for top bar badge
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data?.success) {
        const count = Number(res.data.unreadCount) || 0;
        setUnreadCount(count);
      }
    } catch (err) {
      // Background count fetch failure shouldn't crash UI
      console.warn('[Notifications] Failed to fetch unread count:', err.message);
    }
  }, [user]);

  // 2. Fetch full list of notifications
  const fetchNotifications = useCallback(
    async (targetPage = 1, status = activeTab, append = false) => {
      if (!user) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const res = await api.get('/notifications', {
          params: {
            status: status === 'unread' ? 'unread' : 'all',
            page: targetPage,
            limit: 20,
          },
          signal: abortControllerRef.current.signal,
        });

        if (res.data?.success) {
          const list = Array.isArray(res.data.data) ? res.data.data : [];
          const count = Number(res.data.unreadCount) || 0;

          setNotifications((prev) => (append ? [...prev, ...list] : list));
          setUnreadCount(count);
          setPage(res.data.pagination?.page || targetPage);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setHasMore(Boolean(res.data.pagination?.hasMore));

          // Check for new danger notifications to alert user
          if (!isInitialMountRef.current && prevUnreadCountRef.current !== null && count > prevUnreadCountRef.current) {
            const newDanger = list.find(
              (n) => n.severity === 'danger' && !n.readAt && !seenDangerIdsRef.current.has(n._id)
            );
            if (newDanger) {
              seenDangerIdsRef.current.add(newDanger._id);
              toast.error('Budget alert: you are over your budget', {
                id: `danger-alert-${newDanger._id}`,
                duration: 5000,
              });
            }
            setAnnouncement(`${count - prevUnreadCountRef.current} new notification${count - prevUnreadCountRef.current > 1 ? 's' : ''}`);
          }

          prevUnreadCountRef.current = count;
          isInitialMountRef.current = false;
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error('[Notifications] Fetch failed:', err);
          setError('Could not load notifications.');
        }
      } finally {
        setLoading(false);
      }
    },
    [user, activeTab]
  );

  // 3. Mark single notification as read (optimistic)
  const markRead = async (id) => {
    if (!id) return;
    const previousNotifications = [...notifications];
    const previousCount = unreadCount;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data?.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('[Notifications] markRead failed:', err);
      // Rollback
      setNotifications(previousNotifications);
      setUnreadCount(previousCount);
      toast.error('Failed to mark notification as read');
    }
  };

  // 4. Mark all as read (optimistic)
  const markAllRead = async () => {
    const previousNotifications = [...notifications];
    const previousCount = unreadCount;

    if (previousCount === 0) return;

    // Optimistic update
    const nowIso = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || nowIso })));
    setUnreadCount(0);

    try {
      await api.patch('/notifications/read-all');
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('[Notifications] markAllRead failed:', err);
      // Rollback
      setNotifications(previousNotifications);
      setUnreadCount(previousCount);
      toast.error('Failed to mark all as read');
    }
  };

  // 5. Dismiss a notification (optimistic)
  const dismiss = async (id) => {
    if (!id) return;
    const target = notifications.find((n) => n._id === id);
    const wasUnread = target && !target.readAt;
    const previousNotifications = [...notifications];
    const previousCount = unreadCount;

    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data?.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('[Notifications] dismiss failed:', err);
      // Rollback
      setNotifications(previousNotifications);
      setUnreadCount(previousCount);
      toast.error('Failed to dismiss notification');
    }
  };

  // 6. Dismiss all read notifications (optimistic)
  const dismissAllRead = async () => {
    const previousNotifications = [...notifications];

    setNotifications((prev) => prev.filter((n) => !n.readAt));

    try {
      await api.delete('/notifications');
      toast.success('Dismissed read notifications');
    } catch (err) {
      console.error('[Notifications] dismissAllRead failed:', err);
      setNotifications(previousNotifications);
      toast.error('Failed to dismiss read notifications');
    }
  };

  // 7. Visibility-aware Polling & Event Listeners
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadCountRef.current = null;
      isInitialMountRef.current = true;
      return;
    }

    // Initial fetch
    fetchUnreadCount();
    fetchNotifications(1, activeTab);

    // 60-second polling ONLY while tab is visible
    let intervalId = null;
    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          fetchUnreadCount();
        }
      }, 60000);
    };

    startPolling();

    // Visibility change handler: pause when hidden, refetch when visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
        startPolling();
      } else {
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Window focus handler
    const handleFocus = () => {
      fetchUnreadCount();
    };

    // "spendwise:data-changed" window event listener (dispatched after budget/transaction changes)
    const handleDataChanged = () => {
      fetchUnreadCount();
      fetchNotifications(1, activeTab);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('spendwise:data-changed', handleDataChanged);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('spendwise:data-changed', handleDataChanged);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, fetchUnreadCount, fetchNotifications, activeTab]);

  const value = {
    unreadCount,
    notifications,
    loading,
    error,
    activeTab,
    setActiveTab: (tab) => {
      setActiveTab(tab);
      fetchNotifications(1, tab);
    },
    page,
    totalPages,
    hasMore,
    announcement,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllRead,
    dismiss,
    dismissAllRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
