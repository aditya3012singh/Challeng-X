import NotificationService from "./notification.service.js";

class NotificationController {
    static async getNotifications(req, res) {
        const { limit, offset } = req.query;
        const userId = req.user.id;
        
        const notifications = await NotificationService.getNotifications(userId, limit, offset);
        const unreadCount = await NotificationService.getUnreadCount(userId);
        
        res.ok({
            notifications,
            unreadCount
        }, "Notifications fetched successfully");
    }

    static async markAsRead(req, res) {
        const { id } = req.params;
        const userId = req.user.id;
        
        await NotificationService.markAsRead(id, userId);
        res.ok({}, "Notification marked as read");
    }

    static async markAllAsRead(req, res) {
        const userId = req.user.id;
        await NotificationService.markAllAsRead(userId);
        res.ok({}, "All notifications marked as read");
    }

    static async deleteNotification(req, res) {
        const { id } = req.params;
        const userId = req.user.id;
        
        await NotificationService.deleteNotification(id, userId);
        res.ok({}, "Notification deleted");
    }
}

export default NotificationController;
