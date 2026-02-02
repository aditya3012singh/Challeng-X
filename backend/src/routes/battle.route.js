// POST /battle/create
// POST /battle/join
// GET /battle/:id
// POST /battle/start

// handles game matches between players

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