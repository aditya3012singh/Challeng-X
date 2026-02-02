import express from "express";
import {
  createTeamBattle,
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
