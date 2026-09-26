'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { HanaNotification, HanaNotificationCounts } from './repository';

interface NotificationContextType {
  notifications: HanaNotification[];
  counts: HanaNotificationCounts;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const defaultCounts: HanaNotificationCounts = {
  monitorDetect: 0,
  analyzeSimulate: 0,
  decideApprove: 0,
  executeLearn: 0,
  totalUnread: 0,
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  counts: defaultCounts,
  isLoading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<HanaNotification[]>([]);
  const [counts, setCounts] = useState<HanaNotificationCounts>(defaultCounts);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/hana/notifications?limit=25', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data || []);
          if (json.counts) {
            setCounts(json.counts);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch notifications from SAP HANA Cloud:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Lightweight polling every 45 seconds to keep unread badges synced without hammering HANA
    const interval = setInterval(fetchNotifications, 45000);

    // Revalidate on custom window event
    const handleRevalidate = () => {
      fetchNotifications();
    };
    window.addEventListener('resilinet:notifications-refresh', handleRevalidate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resilinet:notifications-refresh', handleRevalidate);
    };
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.NOTIFICATION_ID === notificationId ? { ...n, IS_READ: 1 } : n))
    );

    try {
      const res = await fetch('/api/hana/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.counts) {
          setCounts(json.counts);
        }
      }
    } catch (err) {
      console.warn('Failed to mark notification read in HANA:', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, IS_READ: 1 })));
    setCounts(defaultCounts);

    try {
      const res = await fetch('/api/hana/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.counts) {
          setCounts(json.counts);
        }
      }
    } catch (err) {
      console.warn('Failed to mark all notifications read in HANA:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        counts,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
