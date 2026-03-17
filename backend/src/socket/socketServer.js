import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { handleQueue } from "./queueHandlers.js";
import { joinBattleRoom, handleSubmission, joinSpectatorRoom, handleSpectatorCodeSync, handleSpectatorOutputSync, handleAntiCheatFlag } from "./battleHandlers.js";
import { handleDisconnect, handleReconnect } from "./disconnectHandlers.js";

class SocketServer {
    static io = null;

    static initialize(server) {
        const allowedOrigins = [
            env.FRONTEND_URL,
            ...env.ALLOWED_ORIGINS
        ].filter(Boolean);

        this.io = new Server(server, {
            cors: {
                origin: (origin, callback) => {
                    // In development, allow any localhost origin
                    if (process.env.NODE_ENV === 'development' && (!origin || origin.startsWith('http://localhost:'))) {
                        return callback(null, true);
                    }
                    if (!origin || allowedOrigins.includes(origin)) {
                        callback(null, true);
                    } else {
                        callback(new Error(`Origin ${origin} not allowed by CORS`));
                    }
                },
                methods: ["GET", "POST"],
                credentials: true
            },
        });

        if (env.REDIS_URL || env.REDIS_HOST) {
            try {
                const redisConfig = {
                    host: env.REDIS_HOST,
                    port: env.REDIS_PORT,
                    password: env.REDIS_PASSWORD,
                    maxRetriesPerRequest: null,
                };
                
                const pubClient = env.REDIS_URL 
                    ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null }) 
                    : new Redis(redisConfig);
                
                const subClient = pubClient.duplicate();

                pubClient.on('error', (err) => logger.error(`Redis PubClient Error: ${err.message}`));
                subClient.on('error', (err) => logger.error(`Redis SubClient Error: ${err.message}`));

                this.io.adapter(createAdapter(pubClient, subClient));
                logger.info("🔌 Socket.IO Redis Adapter configured successfully");
            } catch (err) {
                logger.warn(`⚠️ Failed to configure Socket.IO Redis Adapter: ${err.message}. Falling back to in-memory adapter.`);
            }
        } else {
            logger.warn("⚠️ Redis configuration not found. Socket.IO falling back to in-memory adapter.");
        }

        this.setupMiddleware();
        this.setupEventHandlers();

        return this.io;
    }

    static setupMiddleware() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth?.token;

            if (!token) {
                logger.warn(`🛑 Connection rejected: No token provided (${socket.id})`);
                return next(new Error("Authentication error: Token required"));
            }

            try {
                const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
                socket.user = decoded;
                socket.userId = decoded.id; // Map for convenience
                logger.info(`🔐 Socket Authenticated: ${decoded.id} (${socket.id})`);
                next();
            } catch (err) {
                logger.warn(`🛑 Connection rejected: Invalid token (${socket.id})`);
                next(new Error("Authentication error: Invalid token"));
            }
        });
    }

    static setupEventHandlers() {
        this.io.on("connection", (socket) => {
            logger.info(`🟢 User connected: ${socket.id} (User: ${socket.userId})`);

            // Always join a private room for user-specific events (e.g., practice results)
            socket.join(`user_${socket.userId}`);

            // 2. Queue Handlers
            socket.on("join_queue", (payload) => handleQueue(this.io, socket, payload));

            // 3. Battle Handlers
            socket.on("join_battle", (payload) => joinBattleRoom(this.io, socket, payload));
            socket.on("submit_code", (payload) => handleSubmission(this.io, socket, payload));

            // 4. Spectator Handlers
            socket.on("join_spectator", (payload) => joinSpectatorRoom(this.io, socket, payload));
            socket.on("spectator_code_sync", (payload) => handleSpectatorCodeSync(this.io, socket, payload));
            socket.on("spectator_output_sync", (payload) => handleSpectatorOutputSync(this.io, socket, payload));
            socket.on("anti_cheat_flag", (payload) => handleAntiCheatFlag(this.io, socket, payload));

            // 5. Reconnect & Disconnect
            socket.on("rejoin_battle", (payload) => handleReconnect(this.io, socket, payload));
            socket.on("disconnect", () => handleDisconnect(this.io, socket));
        });
    }
}

export default SocketServer;
