// POST /matchmaking/join
// POST /matchmaking/leave
// GET /matchmaking/status

import express from "express";
import MatchmakingController from "./matchmaking.controller.js";
import AuthMiddleware from "./auth.middleware.js";

class MatchmakingRoutes {
	static createRouter() {
		const router = express.Router();

		router.post("/join", AuthMiddleware.handle, MatchmakingController.joinQueueController);
		router.post("/leave", AuthMiddleware.handle, MatchmakingController.leaveQueueController);
		router.get("/status", AuthMiddleware.handle, MatchmakingController.getQueueStatusController);
		router.post("/accept", AuthMiddleware.handle, MatchmakingController.acceptMatchController);
		router.post("/decline", AuthMiddleware.handle, MatchmakingController.declineMatchController);
		router.get("/activity-feed", AuthMiddleware.handle, MatchmakingController.getActivityFeedController);

		return router;
	}
}

export default MatchmakingRoutes;
