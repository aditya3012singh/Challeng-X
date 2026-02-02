// POST /matchmaking/join
// POST /matchmaking/leave
// GET /matchmaking/status

import express from "express";
import * as matchmakingController from "../controllers/matchmaking.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/join", authMiddleware, matchmakingController.joinQueueController);
router.post("/leave", authMiddleware, matchmakingController.leaveQueueController);
router.get("/status", authMiddleware, matchmakingController.getQueueStatusController);

export default router;
