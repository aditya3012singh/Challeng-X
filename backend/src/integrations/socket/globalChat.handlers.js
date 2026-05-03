import logger from "../../core/logger/logger.js";
import Redis from "ioredis";
import env from "../../core/config/env.js";

const redis = env.REDIS_URL 
    ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
    : new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
    });

const GLOBAL_CHAT_KEY = "global_chat_messages";
const MAX_MESSAGES = 50;

/**
 * Handle real-time global communication
 */
export const handleGlobalMessage = async (io, socket, payload) => {
    const { text, username, profilePic } = payload;
    
    if (!text) return;

    const messagePayload = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sender: username || "Player",
        userId: socket.userId,
        profilePic: profilePic || null,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: new Date().toISOString(),
        type: "user"
    };

    try {
        // 1. Persist to Redis
        await redis.rpush(GLOBAL_CHAT_KEY, JSON.stringify(messagePayload));
        await redis.ltrim(GLOBAL_CHAT_KEY, -MAX_MESSAGES, -1);

        // 2. Broadcast to all connected sockets
        io.emit("new_global_message", messagePayload);
        
        logger.info(`🌐 Global Chat: [${username}] ${text}`);
    } catch (err) {
        logger.error(`❌ Global Chat Error: ${err.message}`);
    }
};

/**
 * Send message history to a newly connected/joined user
 */
export const syncGlobalHistory = async (socket) => {
    try {
        const history = await redis.lrange(GLOBAL_CHAT_KEY, 0, -1);
        const parsedHistory = history.map(msg => JSON.parse(msg));
        
        socket.emit("global_chat_history", parsedHistory);
        logger.info(`📜 Synced ${parsedHistory.length} messages to user ${socket.userId}`);
    } catch (err) {
        logger.error(`❌ Global History Sync Error: ${err.message}`);
    }
};
