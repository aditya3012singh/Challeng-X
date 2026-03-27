import express from "express";
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
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import env from "./config/env.js";
import logger from "./utils/logger.js";

class App {
  static createApp() {
    const app = express();
    
    // Enable trust proxy for secure cookies behind Nginx
    app.set('trust proxy', 1);

    app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://code-arena-survival-wars.vercel.app",
  "https://luminous-banoffee-e60548.netlify.app",
"https://codearena-survivalwars.netlify.app"
];

app.use(cors({
	origin:true,
	credentials:true
}));
    app.use(express.json());

    // Connect Morgan to Winston: logs HTTP requests to our file-based logger instead of standard console out
    app.use(morgan("combined", { stream: logger.stream }));

    app.use(cookieParser());

    // Apply global API rate limiting to all /api routes
    // app.use("/api", apiLimiter);

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

    app.get("/", (req, res) => {
      res.status(200).json({ status: "your are live", timestamp: new Date().toISOString() });
    });// Health Check for production Monitoring
    app.get("/api/health", (req, res) => {
      res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
    });
	    // 404 Handler for undefined routes
    app.use((req, res, next) => {
      res.status(404).json({ message: `Route ${req.originalUrl} not found` });
    });
    // Centralized Error Handler (must be the last middleware)
    app.use((err, req, res, next) => {
      import("./middlewares/errorHandler.middleware.js").then(({ default: errorHandler }) => {
        errorHandler(err, req, res, next);
      }).catch(next);
    });

    return app;
  }
}

export default App;
