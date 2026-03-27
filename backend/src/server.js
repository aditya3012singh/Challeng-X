import env from "./config/env.js";
import App from "./app.js";
import http from "http";
import SquidGameSocket from "./config/squidGameSocket.js";
import logger from "./utils/logger.js";
import SocketServer from "./socket/socketServer.js";
import SocketEmitter from "./config/socket.js";
import ContestCronService from "./services/contestCron.service.js";
import Redis from "ioredis";

class ServerApp {
  static io = null;
  static subscriber = null;

  static createServer(app) {
    return http.createServer(app);
  }

  static setupRedisSubscriber(io) {
    // 🛡️ Robust Redis Config: Trim potential whitespace from env vars
    const redisUrl = env.REDIS_URL ? env.REDIS_URL.trim() : null;
    const redisConfig = redisUrl || {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null,
    };

    if (redisUrl || env.REDIS_HOST) {
      // 🛡️ Assign to static property to prevent GC
      this.subscriber = redisUrl ? new Redis(redisUrl, redisConfig) : new Redis(redisConfig);

      this.subscriber.on("connect", () => {
        logger.info("📡 [RedisSub] Subscriber connected successfully");
      });

      this.subscriber.on("error", (err) => {
        logger.error(`📡 [RedisSub] Connection error: ${err.message}`);
      });

      this.subscriber.subscribe("worker_events", (err, count) => {
        if (err) {
          logger.error(`❌ [RedisSub] Failed to subscribe: ${err.message}`);
        } else {
          logger.info(`✅ [RedisSub] Subscribed to worker_events (${count} channel)`);
        }
      });

      this.subscriber.on("message", (channel, message) => {
        if (channel === "worker_events") {
          try {
            const parsed = JSON.parse(message);
            const { event, data } = parsed;
            
            logger.info(`📡 [RedisSub] Event: ${event} for ${data?.contestId ? 'Contest' : data?.battleId ? 'Battle' : data?.squidGameId ? 'Squid' : 'User'} ${data?.contestId || data?.battleId || data?.squidGameId || data?.userId}`);

            if (data && data.battleId) {
              const room = data.battleId;
              const sockets = io.sockets.adapter.rooms.get(room);
              const count = sockets ? (sockets.size || sockets.length) : 0;
              logger.info(`⚔️ [Emit] ${event} -> Battle Room: ${room} (Members: ${count})`);
              io.to(room).emit(event, data);
            } 
            
            if (data && data.squidGameId) {
              const sgNamespace = io.of("/squid-game");
              const room = `tournament-${data.squidGameId}`;
              const sockets = sgNamespace.adapter.rooms.get(room);
              const count = sockets ? (sockets.size || sockets.length) : 0;
              logger.info(`🦑 [Emit] ${event} -> Squid Room: ${room} (Members: ${count})`);
              sgNamespace.to(room).emit(event, data);

              if (event === "submission_result" && data.type === "SUBMIT") {
                import("./services/squidGame.service.js").then(m => {
                  m.default.handleSquidGameResult(data).catch(err => logger.error(`Error: ${err.message}`));
                });
              }
            } 
            
            if (data && data.contestId) {
              const namespace = io.of("/"); // Assuming generic namespace
              const room = `contest-${data.contestId}`;
              const sockets = namespace.adapter.rooms.get(room);
              const count = sockets ? (sockets.size || sockets.length) : 0;
              logger.info(`🏆 [Emit] ${event} -> Contest Room: ${room} (Members: ${count})`);
              io.to(room).emit(event, data);

              if (event === "submission_result" && data.type === "SUBMIT") {
                import("./services/contest.service.js").then(m => {
                  m.default.handleContestResult(data).catch(err => logger.error(`Error: ${err.message}`));
                });
              }
            }
            
            if (data && (data.userId || data.user?.id)) {
              const targetId = data.userId || data.user?.id;
              const room = `user_${targetId}`;
              const sockets = io.sockets.adapter.rooms.get(room);
              const count = sockets ? (sockets.size || sockets.length) : 0;
              logger.info(`👤 [Emit] ${event} -> User Room: ${room} (Members: ${count})`);
              io.to(room).emit(event, data);
            }
          } catch (error) {
            logger.error(`❌ [RedisSub] Process error: ${error.message}`);
          }
        }
      });
    }
  }

  static start() {
    const app = App.createApp();
    const server = this.createServer(app);

    // 🛡️ CRITICAL: Initialize via SocketServer to register ALL Battle/Matchmaking handlers
    this.io = SocketServer.initialize(server);
    SocketEmitter.setIo(this.io);
    this.setupRedisSubscriber(this.io);

    // Initialize Squid Game socket handlers
    SquidGameSocket.initializeSquidGameSocket(this.io);

    ContestCronService.start();

    const PORT = env.PORT || 4000;
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} busy.`);
      } else {
        logger.error(`❌ Server crash: ${err.message}`);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      logger.info(`🚀 CodeArena Production Server running on port ${PORT}`);
    });
  }
}

export default ServerApp;
