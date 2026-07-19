import env from "./core/config/env.js";
import App from "./app.js";
import http from "http";
import SquidGameSocket from "./modules/squidGame/squidGame.socket.js";
import logger from "./core/logger/logger.js";
import SocketServer from "./integrations/socket/socket.server.js";
import SocketEmitter from "./core/config/socket.js";
import ContestCronService from "./modules/contest/contest.cron.js";
import Redis from "ioredis";
import UserCache from "./core/cache/userCache.js";
import ProblemCache from "./core/cache/problemCache.js";
import TestcaseCache from "./core/cache/testcaseCache.js";
import { updateQueueDepth } from "./core/metrics/prometheus.js";
import { submissionQueue } from "./core/queue/submission.queue.js";


class ServerApp {
  static io = null;
  static subscriber = null;

  static createServer(app) {
    return http.createServer(app);
  }

  static setupRedisSubscriber(io) {
    const redisUrl = env.REDIS_URL ? env.REDIS_URL.trim() : null;
    const redisConnectOptions = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null,
    };

    if (redisUrl || env.REDIS_HOST) {
      // 🛡️ Assign to static property to prevent GC
      this.subscriber = redisUrl
        ? new Redis(redisUrl, { ...redisConnectOptions, maxRetriesPerRequest: null })
        : new Redis(redisConnectOptions);

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

              const socketIds = sockets ? Array.from(sockets) : [];
              logger.info(`⚔️ [Emit] ${event} -> Battle Room: ${room} (Members: ${count}) [Sockets: ${socketIds.join(', ')}]`);
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
                import("./modules/squidGame/squidGame.service.js").then(m => {
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
                import("./modules/contest/contest.service.js").then(m => {
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

  static async start() {
    const app = App.createApp();
    const server = this.createServer(app);

    // 🛡️ CRITICAL: Initialize via SocketServer to register ALL Battle/Matchmaking handlers
    this.io = SocketServer.initialize(server);
    SocketEmitter.setIo(this.io);
    this.setupRedisSubscriber(this.io);

    // Initialize Squid Game socket handlers
    SquidGameSocket.initializeSquidGameSocket(this.io);

    // Warm up caches on startup
    await this.warmUpCaches();


    // ✅ Start contest cron jobs (auto-start/end contests on schedule)
    ContestCronService.start();

    // ✅ PHASE 1A: Start queue metrics collection
    this.startQueueMetricsCollection();

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

  /**
   * Warm up all caches on server startup
   */
  static async warmUpCaches() {
    try {
      logger.info("🔥 Warming up Redis caches...");
      const t0 = Date.now();

      // 1. Users — paginated, non-blocking errors
      await UserCache.warmUp();

      // 2. Problems — all problems + difficulty sets
      await ProblemCache.warmUp();

      // 3. Testcases — warm S3 testcases for ONGOING battles and active contests
      const activeProblemIds = await this.getActiveProblemIds();
      if (activeProblemIds.length > 0) {
        await TestcaseCache.warmUp(activeProblemIds);
      } else {
        logger.info("[WarmUp] No active battles/contests — skipping testcase warm-up");
      }

      logger.info(`✅ All caches warmed up in ${Date.now() - t0}ms`);
    } catch (error) {
      logger.error("❌ Cache warm-up failed:", error);
      logger.warn("⚠️  Continuing without cache warm-up");
    }
  }

  /**
   * Collect problem IDs from currently ONGOING battles and active contests
   * so we can pre-warm their testcases from S3
   */
  static async getActiveProblemIds() {
    try {
      const { default: Database } = await import("./core/config/db.js");
      const now = new Date();

      const [ongoingBattles, activeContestProblems] = await Promise.all([
        // Battles currently in progress
        Database.client.battle.findMany({
          where: { status: { in: ["ONGOING", "COUNTDOWN"] } },
          select: { problemId: true }
        }),
        // Contest problems whose contest is currently running
        Database.client.contestProblem.findMany({
          where: {
            contest: {
              startTime: { lte: now },
              endTime: { gte: now }
            }
          },
          select: { problemId: true }
        })
      ]);

      const ids = new Set([
        ...ongoingBattles.map(b => b.problemId),
        ...activeContestProblems.map(cp => cp.problemId)
      ]);

      logger.info(`[WarmUp] Found ${ids.size} active problem(s) for testcase pre-warming`);
      return [...ids];
    } catch (error) {
      logger.error("[WarmUp] Failed to collect active problem IDs:", error.message);
      return [];
    }
  }

  /**
   * Periodically collect and update queue metrics
   */
  static startQueueMetricsCollection() {
    setInterval(async () => {
      try {
        const jobCounts = await submissionQueue.getJobCounts();
        if (jobCounts) {
          updateQueueDepth({
            waiting: jobCounts.waiting || 0,
            active: jobCounts.active || 0,
            completed: jobCounts.completed || 0,
            failed: jobCounts.failed || 0
          });
        }
      } catch (error) {
        logger.error('Failed to collect queue metrics:', error);
      }
    }, 30000); // Update every 30 seconds

    // Periodically drain Redis Dead-Letter Queues (DLQ) every 60 seconds
    setInterval(async () => {
      try {
        const { default: BattleService } = await import("./modules/battle/battle.service.js");
        await BattleService.replayFailedPersists();
      } catch (dlqErr) {
        logger.error("[DLQ Replay] Interval error:", dlqErr.message);
      }
    }, 60000);
  }
}

export default ServerApp;
