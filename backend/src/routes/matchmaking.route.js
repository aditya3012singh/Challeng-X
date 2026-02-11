// POST /matchmaking/join
// POST /matchmaking/leave
// GET /matchmaking/status

import express from "express";
import MatchmakingController from "../controllers/matchmaking.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/join", authMiddleware, MatchmakingController.joinQueueController);
router.post("/leave", authMiddleware, MatchmakingController.leaveQueueController);
router.get("/status", authMiddleware, MatchmakingController.getQueueStatusController);

export default router;
