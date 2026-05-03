import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";
import env from "./core/config/env.js";
import { rateLimit } from "express-rate-limit";
import logger from "./core/logger/logger.js";
import { traceIdMiddleware } from "./api/middleware/traceId.middleware.js";
import metricsCollector from "./core/metrics/metricsCollector.js";
import healthCheckService from "./core/health/healthCheck.js";

// Routes
import AuthRoutes from "./modules/auth/auth.routes.js";
import ProblemRoutes from "./modules/problem/problem.routes.js";
import TestcaseRoutes from "./modules/testcase/testcase.routes.js";
import SubmissionRoutes from "./modules/submission/submission.routes.js";
import BattleRoutes from "./modules/battle/battle.routes.js";
import LeaderboardRoutes from "./modules/leaderboard/leaderboard.routes.js";
import MatchmakingRoutes from "./modules/matchmaking/matchmaking.routes.js";
import TeamRoutes from "./modules/team/team.routes.js";
import TeamBattleRoutes from "./modules/team/teamBattle.routes.js";
import SquidGameRoutes from "./modules/squidGame/squidGame.routes.js";
import ContestRoutes from "./modules/contest/contest.routes.js";
import SocialRoutes from "./modules/social/social.routes.js";
import NotificationRoutes from "./modules/notification/notification.routes.js";
import AnalyticsRoutes from "./modules/analytics/analytics.routes.js";
import AIRoutes from "./modules/ai/ai.routes.js";

class App {
  static createApp() {
    const app = express();

    // 🛡️ Middlewares
    app.use(helmet());
    app.use(cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(morgan("dev"));

    // ✅ PHASE 6: Add trace ID middleware for observability
    app.use(traceIdMiddleware);

    // 🔑 Passport
    app.use(passport.initialize());
    import("./core/config/passport.js");

    // 🚀 Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    });
    app.use("/api/", limiter);

    // 📂 Routes
    app.use("/api/auth", AuthRoutes.createRouter());
    app.use("/api/problem", ProblemRoutes.createRouter());
    app.use("/api/testcase", TestcaseRoutes.createRouter());
    app.use("/api/submissions", SubmissionRoutes.createRouter());
    app.use("/api/battle", BattleRoutes.createRouter());
    app.use("/api/leaderboard", LeaderboardRoutes.createRouter());
    app.use("/api/matchmaking", MatchmakingRoutes.createRouter());
    app.use("/api/team", TeamRoutes.createRouter());
    app.use("/api/team-battle", TeamBattleRoutes.createRouter());
    app.use("/api/squid-game", SquidGameRoutes.createRouter());
    app.use("/api/contest", ContestRoutes.createRouter());

    // Social & Notifications use refactored standard router exports
    app.use("/api/social", SocialRoutes);
    app.use("/api/notifications", NotificationRoutes);
    app.use("/api/analytics", AnalyticsRoutes);
    app.use("/api/ai", AIRoutes.createRouter());

    app.get("/", (req, res) => {
      res.status(200).json({ status: "your are live", timestamp: new Date().toISOString() });
    });

    app.get("/api/health", (req, res) => {
      res.status(200).json({ status: "OK", database: "connected", redis: "active" });
    });

    // ✅ PHASE 6: Metrics endpoint for observability
    app.get("/api/metrics", (req, res) => {
      try {
        const metrics = metricsCollector.getMetrics();
        res.status(200).json({
          status: "success",
          timestamp: new Date().toISOString(),
          traceId: req.traceId,
          metrics
        });
      } catch (error) {
        logger.error('Failed to get metrics:', error);
        res.status(500).json({
          status: "error",
          message: "Failed to retrieve metrics",
          traceId: req.traceId
        });
      }
    });

    // ✅ PHASE 6: Health check endpoint for production readiness
    app.get("/api/health-check", async (req, res) => {
      try {
        const health = await healthCheckService.getHealthStatus();
        const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 503 : 500;
        res.status(statusCode).json({
          ...health,
          traceId: req.traceId
        });
      } catch (error) {
        logger.error('Failed to get health status:', error);
        res.status(500).json({
          status: "unhealthy",
          error: error.message,
          timestamp: new Date().toISOString(),
          traceId: req.traceId
        });
      }
    });

    // Centralized Error Handler (must be the last middleware)
    app.use((err, req, res, next) => {
      import("./api/middleware/errorHandler.middleware.js").then(({ default: errorHandler }) => {
        errorHandler(err, req, res, next);
      }).catch(next);
    });

    return app;
  }
}

export default App;
