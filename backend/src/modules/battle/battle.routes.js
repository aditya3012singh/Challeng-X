import express from "express";
import BattleController from "./battle.controller.js";
import AuthMiddleware from "./auth.middleware.js";
import asyncWrapper from "../../api/middleware/asyncWrapper.middleware.js";
import validateRequest from "../../api/middleware/validateRequest.middleware.js";
import { createBattleSchema, joinBattleSchema, submitCodeSchema } from "./battle.schema.js";

class BattleRoutes {
  static createRouter() {
    const router = express.Router();

    router.post("/create/random", AuthMiddleware.handle, asyncWrapper(BattleController.createBattleRandomQuestionController));
    router.post("/create/selected", AuthMiddleware.handle, validateRequest(createBattleSchema), asyncWrapper(BattleController.createBattleWithSelectedQuestionController));
    router.post("/join", AuthMiddleware.handle, validateRequest(joinBattleSchema), asyncWrapper(BattleController.joinBattleController));

    // Live Directory
    router.get("/live", asyncWrapper(BattleController.getLiveBattlesController));

    router.get("/:battleId", AuthMiddleware.optional, asyncWrapper(BattleController.getBattleController));
    router.post("/:battleId/submit", AuthMiddleware.optional, validateRequest(submitCodeSchema), asyncWrapper(BattleController.submitBattleCodeController));
    router.post("/:battleId/forfeit", AuthMiddleware.handle, asyncWrapper(BattleController.forfeitBattleController));
    router.get(
      "/history",
      AuthMiddleware.handle,
      asyncWrapper(BattleController.battleHistory)
    );

    return router;
  }
}

export default BattleRoutes;