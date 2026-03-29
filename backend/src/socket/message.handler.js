import logger from "../utils/logger.js";
import Database from "../config/db.js";

export const handlePrivateMessages = (io, socket) => {
    
    // 1. Send private message
    socket.on("send_private_message", async (payload) => {
        const { receiverId, text } = payload;
        
        if (!receiverId || !text?.trim()) return;

        try {
            // Check if they are friends (optional but recommended)
            // For now, let's just allow it if they exist
            
            const message = await Database.client.privateMessage.create({
                data: {
                    senderId: socket.userId,
                    receiverId,
                    text: text.trim()
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            profilePic: true
                        }
                    }
                }
            });

            // Emit to recipient's private room
            io.to(`user_${receiverId}`).emit("new_private_message", message);
            
            // Emit back to sender for confirmation/sync
            socket.emit("message_sent_success", message);

            logger.info(`PM sent from ${socket.userId} to ${receiverId}`);
        } catch (err) {
            logger.error(`Error sending private message: ${err.message}`);
            socket.emit("pm_error", { message: "Failed to send message" });
        }
    });

    // 2. Typing indicator
    socket.on("typing_pm", (payload) => {
        const { receiverId, isTyping } = payload;
        io.to(`user_${receiverId}`).emit("friend_typing", {
            friendId: socket.userId,
            isTyping
        });
    });

    // 3. Mark as read
    socket.on("mark_messages_read", async (payload) => {
        const { friendId } = payload;
        try {
            await Database.client.privateMessage.updateMany({
                where: {
                    senderId: friendId,
                    receiverId: socket.userId,
                    isRead: false
                },
                data: { isRead: true }
            });
        } catch (err) {
            logger.error(`Error marking PMs as read: ${err.message}`);
        }
    });
};
