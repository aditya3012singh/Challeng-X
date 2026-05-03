import Database from "../../core/config/db.js";
import logger from "../../core/logger/logger.js";

const prisma = Database.client;

class NotificationService {
    static async createNotification(userId, { type, title, message, link }) {
        const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";
        if (!userId || userId === GUEST_USER_ID || userId === 'guest') return null;
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                    link,
                    isRead: false
                }
            });

            // Emit to user private room if online
            // Dynamic import to avoid circular dependency
            import("../../integrations/socket/socket.server.js").then(({ default: SocketServer }) => {
                if (SocketServer?.io) {
                    SocketServer.io.to(`user_${userId}`).emit("new_notification", notification);
                    logger.info(`🔔 Notification emitted to user_${userId}: ${type}`);
                }
            }).catch(err => logger.error(`Socket emission error: ${err.message}`));

            return notification;
        } catch (error) {
            logger.error(`Error creating notification for ${userId}: ${error.message}`);
            return null;
        }
    }

    // Alias for createNotification to prevent breaking changes in other services
    static async sendNotification(userId, data) {
        return this.createNotification(userId, data);
    }

    static async getNotifications(userId, limit = 20, offset = 0) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: Number(limit),
            skip: Number(offset)
        });
    }

    static async markAsRead(notificationId, userId) {
        return prisma.notification.updateMany({
            where: { 
                id: notificationId, 
                userId // Security: Ensure user owns notification
            },
            data: { isRead: true }
        });
    }

    static async markAllAsRead(userId) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }

    static async getUnreadCount(userId) {
        return prisma.notification.count({
            where: { userId, isRead: false }
        });
    }

    static async deleteNotification(notificationId, userId) {
        return prisma.notification.deleteMany({
            where: { id: notificationId, userId }
        });
    }
}

export default NotificationService;
