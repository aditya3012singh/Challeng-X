import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import logger from "../utils/logger.js";
import { handleQueue } from "./queueHandlers.js";
import { joinBattleRoom, handleSubmission, joinSpectatorRoom, handleSpectatorCodeSync, handleSpectatorOutputSync } from "./battleHandlers.js";
import { handleDisconnect, handleReconnect } from "./disconnectHandlers.js";

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

        this.setupEventHandlers();

        return this.io;
    }

    static setupEventHandlers() {
        this.io.on("connection", (socket) => {
            logger.info(`🟢 User connected: ${socket.id}`);

            // 1. Player Connection (Auto-reply based on prompt)
            socket.on("player_connected", (payload) => {
                logger.info(`Player connected event: ${payload?.userId}`);
                socket.userId = payload?.userId;
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

            // 5. Reconnect & Disconnect
            socket.on("rejoin_battle", (payload) => handleReconnect(this.io, socket, payload));
            socket.on("disconnect", () => handleDisconnect(this.io, socket));
        });
    }
}

export default SocketServer;
