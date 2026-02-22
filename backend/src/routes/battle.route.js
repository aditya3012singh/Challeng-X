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
import AuthMiddleware from "../middlewares/auth.middleware.js";

class BattleRoutes {
  static createRouter() {
    const router = express.Router();

    router.post("/create/random", AuthMiddleware.handle, BattleController.createBattleRandomQuestionController);
    router.post("/create/selected", AuthMiddleware.handle, BattleController.createBattleWithSelectedQuestionController);
    router.post("/join", AuthMiddleware.handle, BattleController.joinBattleController);
    router.get("/:battleId", AuthMiddleware.handle, BattleController.getBattleController);
    router.post("/:battleId/submit", AuthMiddleware.handle, BattleController.submitBattleCodeController);
    router.post("/:battleId/forfeit", AuthMiddleware.handle, BattleController.forfeitBattleController);
    router.get(
      "/history",
      AuthMiddleware.handle,
      BattleController.battleHistory
    );

    return router;
  }
}

export default BattleRoutes;