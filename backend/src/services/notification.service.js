import { NotificacionesStock, Producto } from '../models/index.js';

export class NotificationService {

    /**
     * Obtener todas las notificaciones no leídas
     * Se ordenan de la más reciente a la más antigua
     */
    async getUnreadNotifications() {
        try {
            const notifications = await NotificacionesStock.findAll({
                where: { leido: false },
                include: [{
                    model: Producto,
                    attributes: ['id_producto', 'nombre', 'codigo_producto', 'stock_actual']
                }],
                order: [['fecha_creacion', 'DESC']]
            });
            return notifications;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Marcar una notificación específica como leída
     */
    async markAsRead(notificationId) {
        try {
            const notification = await NotificacionesStock.findByPk(notificationId);
            if (!notification) throw new Error('Notificación no encontrada.');

            await notification.update({ leido: true });
            return notification;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Marcar TODAS como leídas (Botón "Marcar todo como leído")
     */
    async markAllAsRead() {
        try {
            await NotificacionesStock.update(
                { leido: true },
                { where: { leido: false } } // Solo actualiza las que faltan
            );
            return { message: 'Todas las notificaciones marcadas como leídas.' };
        } catch (error) {
            throw error;
        }
    }
}