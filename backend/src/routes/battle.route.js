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
import validateRequest from "../middlewares/validate.middleware.js";
import { createBattleSchema, joinBattleSchema, submitCodeSchema } from "../validation/battle.schema.js";

class BattleRoutes {
  static createRouter() {
    const router = express.Router();

    router.post("/create/random", AuthMiddleware.handle, BattleController.createBattleRandomQuestionController);
    router.post("/create/selected", AuthMiddleware.handle, validateRequest(createBattleSchema), BattleController.createBattleWithSelectedQuestionController);
    router.post("/join", AuthMiddleware.handle, validateRequest(joinBattleSchema), BattleController.joinBattleController);

    // Live Directory (must come before /:battleId to prevent param capture)
    router.get("/live", BattleController.getLiveBattlesController);

    router.get("/:battleId", AuthMiddleware.optional, BattleController.getBattleController);
    router.post("/:battleId/submit", AuthMiddleware.optional, validateRequest(submitCodeSchema), BattleController.submitBattleCodeController);
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