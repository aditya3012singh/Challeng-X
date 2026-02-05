// ===== 1v1 Battle Routes =====
// POST /battle/create/random - Create a new 1v1 battle with random question
// POST /battle/create/selected - Create a new 1v1 battle with selected question
// POST /battle/join - Join an existing 1v1 battle
// GET /battle/:id - Get battle details
// POST /battle/:battleId/submit - Submit code solution for 1v1 battle
// GET /battle/history - Get battle history

// Handles direct 1v1 game matches between players

import express from "express";
import * as battleController from "../controllers/battle.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create/random", authMiddleware, battleController.createBattleRandomQuestionController);
router.post("/create/selected", authMiddleware, battleController.createBattleWithSelectedQuestionController);
router.post("/join", authMiddleware, battleController.joinBattleController);
router.get("/:battleId", authMiddleware, battleController.getBattleController);
router.post("/:battleId/submit", authMiddleware, battleController.submitBattleCodeController);
router.get(
  "/history",
  authMiddleware,
  battleController.battleHistory
);


export default router;