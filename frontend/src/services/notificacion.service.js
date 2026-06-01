import axiosInstance from "./axios";

class NotificationService {
    async getUnread() {
        try {
            const response = await axiosInstance.get('/notifications/unread');
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications", error);
            return { success: false, notifications: [] };
        }
    }

    async markAsRead(id) {
        try {
            await axiosInstance.patch(`/notifications/${id}/read`);
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }

    async markAllAsRead() {
        try {
            await axiosInstance.patch('/notifications/read-all');
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
}

export const notificationService = new NotificationService();