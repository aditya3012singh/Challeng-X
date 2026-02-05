// 🎮 squidGame.route.js - Squid Game Routes

import express from "express";
import * as squidGameController from "../controllers/squidGame.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/squid-game
 * Create a new Squid Game tournament
 */
router.post("/", squidGameController.createSquidGameController);

/**
 * POST /api/squid-game/join
 * Join an existing tournament
 */
router.post("/join", squidGameController.joinSquidGameController);

/**
 * GET /api/squid-game/:squidGameId
 * Get tournament status
 */
router.get("/:squidGameId", squidGameController.getSquidGameStatusController);

/**
 * POST /api/squid-game/start
 * Start a tournament
 */
router.post("/start", squidGameController.startSquidGameController);

/**
 * POST /api/squid-game/submit
 * Submit a solution
 */
router.post("/submit", squidGameController.submitSquidGameSolutionController);

/**
 * POST /api/squid-game/end-round
 * End current round and eliminate players
 */
router.post("/end-round", squidGameController.endSquidGameRoundController);

/**
 * GET /api/squid-game/:squidGameId/leaderboard
 * Get tournament leaderboard
 */
router.get(
  "/:squidGameId/leaderboard",
  squidGameController.getSquidGameLeaderboardController
);

/**
 * GET /api/squid-game/history/my
 * Get user's tournament history
 */
router.get("/history/my", squidGameController.getUserSquidGameHistoryController);

export default router;
