import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification.service';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        // No ponemos loading global para no parpadear la UI en el polling
        const response = await notificationService.getUnread();
        if (response.success && response.notifications) {
            setNotifications(response.notifications);
            setUnreadCount(response.notifications.length);
        }
    }, []);

    // Cargar al inicio y cada 60 segundos
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markRead = async (id) => {
        // Optimistic UI update (lo quitamos de la lista visualmente inmediato)
        setNotifications(prev => prev.filter(n => n.id_notificacion !== id));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Llamada al back
        await notificationService.markAsRead(id);
    };

    const markAllRead = async () => {
        setNotifications([]);
        setUnreadCount(0);
        await notificationService.markAllAsRead();
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