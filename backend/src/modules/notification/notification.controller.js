import NotificationService from "./notification.service.js";

class NotificationController {
    static async getNotifications(req, res) {
        try {
            const { limit, offset } = req.query;
            const userId = req.user.id;
            
            const notifications = await NotificationService.getNotifications(userId, limit, offset);
            const unreadCount = await NotificationService.getUnreadCount(userId);
            
            res.json({
                message: "Notifications fetched successfully",
                notifications,
                unreadCount
            });
        } catch (error) {
            console.error("Get notifications error:", error);
            res.status(500).json({ message: "Failed to fetch notifications" });
        }
    }

    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            await NotificationService.markAsRead(id, userId);
            res.json({ message: "Notification marked as read" });
        } catch (error) {
            console.error("Mark notification error:", error);
            res.status(500).json({ message: "Failed to update notification" });
        }
    }

    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            await NotificationService.markAllAsRead(userId);
            res.json({ message: "All notifications marked as read" });
        } catch (error) {
            console.error("Mark all notifications error:", error);
            res.status(500).json({ message: "Failed to update notifications" });
        }
    }

    static async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            await NotificationService.deleteNotification(id, userId);
            res.json({ message: "Notification deleted" });
        } catch (error) {
            console.error("Delete notification error:", error);
            res.status(500).json({ message: "Failed to delete notification" });
        }
    }
}

export default NotificationController;
