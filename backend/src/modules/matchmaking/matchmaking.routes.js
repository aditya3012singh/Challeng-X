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

		return router;
	}
}

export default MatchmakingRoutes;
