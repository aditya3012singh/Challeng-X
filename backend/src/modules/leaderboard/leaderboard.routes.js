import express from "express";
import LeaderboardController from "./leaderboard.controller.js";
import asyncWrapper from "../../api/middleware/asyncWrapper.middleware.js";

class LeaderboardRoutes {
	static createRouter() {
		const router = express.Router();

		router.get("/", asyncWrapper(LeaderboardController.fetchLeaderboard));

		return router;
	}
}

export default LeaderboardRoutes;
