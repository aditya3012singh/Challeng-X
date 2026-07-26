import express from "express";
import MatchmakingController from "./matchmaking.controller.js";
import AuthMiddleware from "./auth.middleware.js";
import asyncWrapper from "../../api/middleware/asyncWrapper.middleware.js";
import validateRequest from "../../api/middleware/validateRequest.middleware.js";
import { joinQueueSchema, matchProposalSchema } from "./matchmaking.schema.js";

class MatchmakingRoutes {
	static createRouter() {
		const router = express.Router();

		router.post("/join", AuthMiddleware.handle, validateRequest(joinQueueSchema), asyncWrapper(MatchmakingController.joinQueueController));
		router.post("/leave", AuthMiddleware.handle, asyncWrapper(MatchmakingController.leaveQueueController));
		router.get("/status", AuthMiddleware.handle, asyncWrapper(MatchmakingController.getQueueStatusController));
		router.post("/accept", AuthMiddleware.handle, validateRequest(matchProposalSchema), asyncWrapper(MatchmakingController.acceptMatchController));
		router.post("/decline", AuthMiddleware.handle, validateRequest(matchProposalSchema), asyncWrapper(MatchmakingController.declineMatchController));
		router.get("/activity-feed", AuthMiddleware.handle, asyncWrapper(MatchmakingController.getActivityFeedController));

		return router;
	}
}

export default MatchmakingRoutes;
