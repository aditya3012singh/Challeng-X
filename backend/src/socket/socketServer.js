import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import logger from "../utils/logger.js";
import { handleQueue } from "./queueHandlers.js";
import { joinBattleRoom, handleSubmission, joinSpectatorRoom, handleSpectatorCodeSync, handleSpectatorOutputSync, handleAntiCheatFlag } from "./battleHandlers.js";
import { handleDisconnect, handleReconnect } from "./disconnectHandlers.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";

class SocketServer {
    static io = null;

    static initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        if (process.env.REDIS_URL) {
            try {
                const pubClient = new Redis(process.env.REDIS_URL);
                const subClient = pubClient.duplicate();

                pubClient.on('error', (err) => logger.error(`Redis PubClient Error: ${err.message}`));
                subClient.on('error', (err) => logger.error(`Redis SubClient Error: ${err.message}`));

                this.io.adapter(createAdapter(pubClient, subClient));
                logger.info("🔌 Socket.IO Redis Adapter configured successfully");
            } catch (err) {
                logger.warn(`⚠️ Failed to configure Socket.IO Redis Adapter: ${err.message}. Falling back to in-memory adapter.`);
            }
        } else {
            logger.warn("⚠️ REDIS_URL not found. Socket.IO falling back to in-memory adapter.");
        }

        // 🛡️ JWT Authentication Middleware
        this.io.use((socket, next) => {
            try {
                const cookies = cookie.parse(socket.handshake.headers.cookie || "");
                const token = cookies.accessToken;

                if (!token) {
                    logger.warn(`🔌 Unauthenticated connection attempt: ${socket.id}`);
                    return next(); // Allow unauthenticated but won't have userId
                }

                const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
                socket.userId = decoded.id;
                socket.userRole = decoded.role;
                
                logger.info(`🔐 User authenticated [${socket.userId}] connected: ${socket.id}`);
                next();
            } catch (err) {
                logger.error(`❌ Socket Auth Error: ${err.message}`);
                next(); // Still let them connect, but without user info
            }
        });

        this.setupEventHandlers();

        return this.io;
    }

    static setupEventHandlers() {
        this.io.on("connection", (socket) => {
            logger.info(`🟢 User connected: ${socket.id}`);

            // 1. Player Connection (Auto-reply based on prompt)
            socket.on("player_connected", (payload) => {
                const userId = socket.userId || payload?.userId;
                logger.info(`Player connected event: ${userId}`);
                if (userId) socket.userId = userId;
                socket.emit("player_ready");
            });

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
