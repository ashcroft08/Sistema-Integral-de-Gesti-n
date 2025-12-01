import { NotificationService } from '../services/notification.service.js';

const notificationService = new NotificationService();

export class NotificationController {

    async getUnread(req, res) {
        try {
            const notifications = await notificationService.getUnreadNotifications();
            res.status(200).json({
                success: true,
                notifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async markAsRead(req, res) {
        try {
            const { id } = req.params; // No necesitamos validación compleja aquí
            await notificationService.markAsRead(id);

            res.status(200).json({
                success: true,
                message: 'Notificación marcada como leída.'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async markAllAsRead(req, res) {
        try {
            await notificationService.markAllAsRead();
            res.status(200).json({
                success: true,
                message: 'Todas las notificaciones han sido leídas.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}