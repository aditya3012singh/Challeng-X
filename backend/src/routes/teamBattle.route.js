import express from "express";
import {
  createTeamBattle,
  getAvailableBattles,
  joinTeamBattle,
  getTeamBattle,
  getTeamBattles,
  startTeamBattle,
  submitMatchSolution,
  determineMatchWinner,
  completeTeamBattle,
  getActiveTeamBattles,
} from "../controllers/teamBattleNew.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// NEW JOIN-CODE FLOW ROUTES
// POST /team-battle/create - Team1 leader creates battle
router.post("/create", authMiddleware, createTeamBattle);

// GET /team-battle/available - Browse available battles for Team2
router.get("/available", getAvailableBattles);

// POST /team-battle/join - Team2 leader joins battle with code
router.post("/join", authMiddleware, joinTeamBattle);

// ============================================
// EXISTING TOURNAMENT-STYLE ROUTES (LEGACY)
// ============================================

// Public routes
router.get("/active", getActiveTeamBattles);
router.get("/:battleCode", getTeamBattle);

// Protected routes
router.post("/", authMiddleware, createTeamBattle);
router.post("/:battleCode/start", authMiddleware, startTeamBattle);
router.post("/:battleCode/:matchId/submit", authMiddleware, submitMatchSolution);
router.post("/:matchId/winner", authMiddleware, determineMatchWinner);
router.post("/:battleCode/complete", authMiddleware, completeTeamBattle);
router.get("/team/:teamId", authMiddleware, getTeamBattles);

export default router;

