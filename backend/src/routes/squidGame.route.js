// 🎮 squidGame.route.js - Squid Game Routes

import express from "express";
import SquidGameController from "../controllers/squidGame.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.handle);

/**
 * POST /api/squid-game
 * Create a new Squid Game tournament
 */
router.post("/", SquidGameController.createSquidGameController);

/**
 * POST /api/squid-game/join
 * Join an existing tournament
 */
router.post("/join", SquidGameController.joinSquidGameController);

/**
 * GET /api/squid-game/:squidGameId
 * Get tournament status
 */
router.get("/:squidGameId", SquidGameController.getSquidGameStatusController);

/**
 * POST /api/squid-game/start
 * Start a tournament
 */
router.post("/start", SquidGameController.startSquidGameController);

/**
 * POST /api/squid-game/submit
 * Submit a solution
 */
router.post("/submit", SquidGameController.submitSquidGameSolutionController);

/**
 * POST /api/squid-game/end-round
 * End current round and eliminate players
 */
router.post("/end-round", SquidGameController.endSquidGameRoundController);

/**
 * GET /api/squid-game/:squidGameId/leaderboard
 * Get tournament leaderboard
 */
router.get(
  "/:squidGameId/leaderboard",
  SquidGameController.getSquidGameLeaderboardController
);

/**
 * GET /api/squid-game/history/my
 * Get user's tournament history
 */
router.get("/history/my", SquidGameController.getUserSquidGameHistoryController);

export default router;
