// ===== 1v1 Battle Routes =====
// POST /battle/create/random - Create a new 1v1 battle with random question
// POST /battle/create/selected - Create a new 1v1 battle with selected question
// POST /battle/join - Join an existing 1v1 battle
// GET /battle/:id - Get battle details
// POST /battle/:battleId/submit - Submit code solution for 1v1 battle
// GET /battle/history - Get battle history

// Handles direct 1v1 game matches between players

import express from "express";
import BattleController from "../controllers/battle.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create/random", authMiddleware, BattleController.createBattleRandomQuestionController);
router.post("/create/selected", authMiddleware, BattleController.createBattleWithSelectedQuestionController);
router.post("/join", authMiddleware, BattleController.joinBattleController);
router.get("/:battleId", authMiddleware, BattleController.getBattleController);
router.post("/:battleId/submit", authMiddleware, BattleController.submitBattleCodeController);
router.get(
  "/history",
  authMiddleware,
  BattleController.battleHistory
);


export default router;