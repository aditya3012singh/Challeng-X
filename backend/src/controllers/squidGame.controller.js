// 🎮 squidGame.controller.js - Squid Game API Controllers

import SquidGameService from "../services/squidGame.service.js";

/**
 * Create a new Squid Game tournament
 */
class SquidGameController {
  static async createSquidGameController(req, res) {
    const { name, maxPlayers = 50 } = req.body;
    const userId = req.user.id;

    try {
      if (!name) {
        return res.status(400).json({ message: "Tournament name is required" });
      }

      const tournament = await SquidGameService.createSquidGameTournament(
        name,
        userId,
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
  static async joinSquidGameController(req, res) {
    const { squidGameId } = req.body;
    const userId = req.user.id;

    try {
      if (!squidGameId) {
        return res.status(400).json({ message: "Tournament ID is required" });
      }

      const result = await SquidGameService.joinSquidGameTournament(
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
  static async getSquidGameStatusController(req, res) {
    const { squidGameId } = req.params;

    try {
      const status = await SquidGameService.getSquidGameStatus(squidGameId);

      res.status(200).json(status);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * Start tournament (host-only)
   */
  static async startSquidGameController(req, res) {
    const { squidGameId } = req.body;
    const userId = req.user.id;

    try {
      if (!squidGameId) {
        return res.status(400).json({ message: "Tournament ID is required" });
      }

      const tournament = await SquidGameService.startSquidGameTournament(
        squidGameId,
        userId
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
  static async submitSquidGameSolutionController(req, res) {
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

      const submission = await SquidGameService.submitSquidGameSolution(
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
  static async endSquidGameRoundController(req, res) {
    const { squidGameId } = req.body;

    try {
      if (!squidGameId) {
        return res.status(400).json({ message: "Tournament ID is required" });
      }

      const result = await SquidGameService.endRoundAndEliminate(squidGameId);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get tournament leaderboard
   */
  static async getSquidGameLeaderboardController(req, res) {
    const { squidGameId } = req.params;

    try {
      if (!squidGameId) {
        return res.status(400).json({ message: "Tournament ID is required" });
      }

      const leaderboard = await SquidGameService.getSquidGameLeaderboard(
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
  static async getUserSquidGameHistoryController(req, res) {
    const userId = req.user.id;

    try {
      const history = await SquidGameService.getUserSquidGameHistory(userId);

      res.status(200).json({
        message: "User tournament history",
        tournaments: history
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default SquidGameController;
