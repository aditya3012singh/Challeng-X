// GET /leaderboard

// Shows rankings.

import express from "express";
import LeaderboardController from "../controllers/leaderboard.controller.js";

class LeaderboardRoutes {
	static createRouter() {
		const router = express.Router();

		router.get("/", LeaderboardController.fetchLeaderboard);

		return router;
	}
}

export default LeaderboardRoutes;
