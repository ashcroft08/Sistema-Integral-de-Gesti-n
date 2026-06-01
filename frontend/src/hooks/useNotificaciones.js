import { useCallback } from 'react';

export const useNotifications = () => {
    const notifications = [];
    const unreadCount = 0;
    const loading = false;

    const fetchNotifications = useCallback(async () => {
        // Mocked out - notifications module is cleaned up
    }, []);

    const markRead = async (id) => {
        // Mocked out
    };

    const markAllRead = async () => {
        // Mocked out
    };

    return {
        notifications,
        unreadCount,
        loading,
        markRead,
        markAllRead,
        refresh: fetchNotifications
    };
};