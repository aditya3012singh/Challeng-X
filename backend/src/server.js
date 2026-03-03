import dotenv from "dotenv";
dotenv.config();
import App from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import SquidGameSocket from "./config/squidGameSocket.js";
import BattleService from "./services/battle.service.js";
import logger from "./utils/logger.js";

class ServerApp {
  static io = null;

  static createServer(app) {
    return http.createServer(app);
  }

  static createIo(server) {
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    if (process.env.REDIS_URL) {
      const pubClient = new Redis(process.env.REDIS_URL);
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      logger.info("🔌 Socket.IO Redis Adapter configured successfully");
    } else {
      logger.warn("⚠️ REDIS_URL not found. Socket.IO falling back to in-memory adapter (not scalable).");
    }

    return io;
  }

  static registerBaseSocketHandlers(io) {
    io.on("connection", (socket) => {
      logger.info(`🟢 User connected: ${socket.id}`);

      socket.on("joinBattle", (battleId) => {
        socket.join(battleId);
        logger.info(`User joined room ${battleId}`);
      });

      socket.on("disconnect", () => {
        logger.info("🔴 User disconnected");
      });
    });
  }

  static setupRedisSubscriber(io) {
    if (process.env.REDIS_URL) {
      const subscriber = new Redis(process.env.REDIS_URL);

      subscriber.subscribe("worker_events", (err, count) => {
        if (err) {
          logger.error(`Failed to subscribe to worker_events channel: ${err}`);
        } else {
          logger.info(`✅ Server subscribed to ${count} Redis channels for worker events`);
        }
      });

      subscriber.on("message", (channel, message) => {
        if (channel === "worker_events") {
          try {
            const { event, data } = JSON.parse(message);

            if (data && data.battleId) {
              io.to(data.battleId).emit(event, data);
            } else {
              // Practice mode or non-battle submission
              io.emit(event, data);
            }

          } catch (error) {
            logger.error(`Error parsing worker event message: ${error}`);
          }
        }
      });
    }
  }

  static start() {
    const app = App.createApp();
    const server = this.createServer(app);

    this.io = this.createIo(server);
    this.registerBaseSocketHandlers(this.io);
    this.setupRedisSubscriber(this.io);

    // Initialize Squid Game socket handlers
    SquidGameSocket.initializeSquidGameSocket(this.io);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  }
}

export default ServerApp;

