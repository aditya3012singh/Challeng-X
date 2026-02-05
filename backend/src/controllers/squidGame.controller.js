// 🎮 squidGame.controller.js - Squid Game API Controllers

import * as squidGameService from "../services/squidGame.service.js";

/**
 * Create a new Squid Game tournament
 */
export async function createSquidGameController(req, res) {
  const { name, maxPlayers = 50 } = req.body;
  const userId = req.user.id;

  try {
    if (!name) {
      return res.status(400).json({ message: "Tournament name is required" });
    }

    const tournament = await squidGameService.createSquidGameTournament(
      name,
      maxPlayers
    );

    res.status(201).json({
      message: "Tournament created successfully",
      tournament
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Join a Squid Game tournament
 */
export async function joinSquidGameController(req, res) {
  const { squidGameId } = req.body;
  const userId = req.user.id;

  try {
    if (!squidGameId) {
      return res.status(400).json({ message: "Tournament ID is required" });
    }

    const result = await squidGameService.joinSquidGameTournament(
      squidGameId,
      userId
    );

    res.status(200).json({
      message: "Joined tournament successfully",
      ...result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/**
 * Get tournament status
 */
export async function getSquidGameStatusController(req, res) {
  const { squidGameId } = req.params;

  try {
    const status = await squidGameService.getSquidGameStatus(squidGameId);

    res.status(200).json(status);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

/**
 * Start tournament
 */
export async function startSquidGameController(req, res) {
  const { squidGameId } = req.body;

  try {
    if (!squidGameId) {
      return res.status(400).json({ message: "Tournament ID is required" });
    }

    const tournament = await squidGameService.startSquidGameTournament(
      squidGameId
    );

    res.status(200).json({
      message: "Tournament started",
      tournament
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/**
 * Submit solution for Squid Game round
 */
export async function submitSquidGameSolutionController(req, res) {
  const {
    squidGameId,
    code,
    language,
    status,
    executionTimeMs,
    testCasesPassed,
    totalTestCases
  } = req.body;
  const userId = req.user.id;

  try {
    if (
      !squidGameId ||
      !code ||
      !language ||
      !status ||
      executionTimeMs === undefined ||
      testCasesPassed === undefined ||
      totalTestCases === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const submission = await squidGameService.submitSquidGameSolution(
      squidGameId,
      userId,
      code,
      language,
      status,
      executionTimeMs,
      testCasesPassed,
      totalTestCases
    );

    res.status(201).json({
      message: "Solution submitted",
      submission
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/**
 * End round and eliminate players
 */
export async function endSquidGameRoundController(req, res) {
  const { squidGameId } = req.body;

  try {
    if (!squidGameId) {
      return res.status(400).json({ message: "Tournament ID is required" });
    }

    const result = await squidGameService.endRoundAndEliminate(squidGameId);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/**
 * Get tournament leaderboard
 */
export async function getSquidGameLeaderboardController(req, res) {
  const { squidGameId } = req.params;

  try {
    if (!squidGameId) {
      return res.status(400).json({ message: "Tournament ID is required" });
    }

    const leaderboard = await squidGameService.getSquidGameLeaderboard(
      squidGameId
    );

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

/**
 * Get user's tournament history
 */
export async function getUserSquidGameHistoryController(req, res) {
  const userId = req.user.id;

  try {
    const history = await squidGameService.getUserSquidGameHistory(userId);

    res.status(200).json({
      message: "User tournament history",
      tournaments: history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
