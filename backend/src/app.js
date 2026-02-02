import express from "express";
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import testcaseRoutes from "./routes/testcase.route.js";
import submissionRoutes from "./routes/submission.route.js";
import battleRoutes from "./routes/battle.route.js";
import leaderboardRoutes from "./routes/leaderboard.route.js";
import matchmakingRoutes from "./routes/matchmaking.route.js";
import teamRoutes from "./routes/team.route.js";
import teamBattleRoutes from "./routes/teamBattle.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173", // frontend
  credentials: true,               // 🔥 REQUIRED for cookies
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);   
app.use("/api/problem", problemRoutes);
app.use("/api/testcase", testcaseRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/battle", battleRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/matchmaking", matchmakingRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/team-battle", teamBattleRoutes);

export default app;
