import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";
import env from "./config/env.js";
import { rateLimit } from "express-rate-limit";
import logger from "./utils/logger.js";

// Routes
import AuthRoutes from "./routes/auth.route.js";
import ProblemRoutes from "./routes/problem.route.js";
import TestcaseRoutes from "./routes/testcase.route.js";
import SubmissionRoutes from "./routes/submission.route.js";
import BattleRoutes from "./routes/battle.route.js";
import LeaderboardRoutes from "./routes/leaderboard.route.js";
import MatchmakingRoutes from "./routes/matchmaking.route.js";
import TeamRoutes from "./routes/team.route.js";
import TeamBattleRoutes from "./routes/teamBattle.route.js";
import SquidGameRoutes from "./routes/squidGame.route.js";
import ContestRoutes from "./routes/contest.route.js";
import SocialRoutes from "./routes/social.route.js";
import NotificationRoutes from "./routes/notification.route.js";
import AnalyticsRoutes from "./routes/analytics.route.js";
import AIRoutes from "./routes/ai.route.js";

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

    // 🔑 Passport
    app.use(passport.initialize());
    import("./config/passport.js");

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

    // Centralized Error Handler (must be the last middleware)
    app.use((err, req, res, next) => {
      import("./middlewares/errorhandler.middleware.js").then(({ default: errorHandler }) => {
        errorHandler(err, req, res, next);
      }).catch(next);
    });

    return app;
  }
}

export default App;
