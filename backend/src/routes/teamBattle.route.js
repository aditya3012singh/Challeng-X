import express from "express";
import {
  createTeamBattle,
  getTeamBattle,
  getTeamBattles,
  startTeamBattle,
  submitTeamBattleSolution,
  getTeamBattleSubmissions,
  completeTeamBattle,
  getActiveTeamBattles,
} from "../controllers/teamBattle.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
// import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveTeamBattles);
router.get("/:battleCode", getTeamBattle);
router.get("/:battleCode/submissions", getTeamBattleSubmissions);

// Protected routes
router.post("/", authMiddleware, createTeamBattle);
router.post("/:battleCode/start", authMiddleware, startTeamBattle);
router.post("/:battleCode/submit", authMiddleware, submitTeamBattleSolution);
router.post("/:battleCode/complete", authMiddleware, completeTeamBattle);
router.get("/team/:teamId", authMiddleware, getTeamBattles);
export default router;
