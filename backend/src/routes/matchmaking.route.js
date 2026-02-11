// POST /matchmaking/join
// POST /matchmaking/leave
// GET /matchmaking/status

import express from "express";
import MatchmakingController from "../controllers/matchmaking.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/join", AuthMiddleware.handle, MatchmakingController.joinQueueController);
router.post("/leave", AuthMiddleware.handle, MatchmakingController.leaveQueueController);
router.get("/status", AuthMiddleware.handle, MatchmakingController.getQueueStatusController);

export default router;
