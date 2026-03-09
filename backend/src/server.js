import dotenv from "dotenv";
dotenv.config();
import App from "./app.js";
import http from "http";
import { Server } from "socket.io";
import SquidGameSocket from "./config/squidGameSocket.js";
import BattleService from "./services/battle.service.js";
import logger from "./utils/logger.js";
import SocketServer from "./socket/socketServer.js";
import Redis from "ioredis";

class ServerApp {
  static io = null;

  static createServer(app) {
    return http.createServer(app);
  }

  static createIo(server) {
    return SocketServer.initialize(server);
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

