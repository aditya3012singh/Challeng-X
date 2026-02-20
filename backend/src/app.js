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
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

class App {
  static createApp() {
    const app = express();

    app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // In development, allow any localhost origin
        if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
          return callback(null, true);
        }
        
        // In production, use specific allowed origins
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:5174',
          process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // 🔥 REQUIRED for cookies
    }));

    app.use(express.json());
    app.use(cookieParser());
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

    return app;
  }
}

export default App;
