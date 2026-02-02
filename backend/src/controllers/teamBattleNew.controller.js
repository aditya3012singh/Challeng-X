import {
  createTeamBattleService,
  getTeamBattleService,
  getTeamBattlesService,
  startTeamBattleService,
  submitMatchSolutionService,
  determineMatchWinnerService,
  completeTeamBattleService,
  getActiveTeamBattlesService,
} from "../services/teamBattleNew.service.js";
import { logger } from "../utils/logger.js";

// Create a new tournament-style team battle
export const createTeamBattle = async (req, res) => {
  try {
    const { team1Id, team2Id, maxTeamSize } = req.body;

    if (!team1Id || !team2Id || !maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: team1Id, team2Id, maxTeamSize",
      });
    }

    if (![2, 3, 4, 5].includes(maxTeamSize)) {
      return res.status(400).json({
        success: false,
        message: "maxTeamSize must be 2, 3, 4, or 5",
      });
    }

    const teamBattle = await createTeamBattleService(team1Id, team2Id, maxTeamSize);

    res.status(201).json({
      success: true,
      message: "Tournament team battle created successfully",
      data: teamBattle,
    });
  } catch (error) {
    logger.error("Error creating team battle:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to create team battle",
    });
  }
};

// Get team battle by code
export const getTeamBattle = async (req, res) => {
  try {
    const { battleCode } = req.params;

    if (!battleCode) {
      return res.status(400).json({
        success: false,
        message: "Battle code is required",
      });
    }

    const teamBattle = await getTeamBattleService(battleCode);

    res.status(200).json({
      success: true,
      data: teamBattle,
    });
  } catch (error) {
    logger.error("Error fetching team battle:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch team battle",
    });
  }
};

// Get team battles for a team
export const getTeamBattles = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Team ID is required",
      });
    }

    const teamBattles = await getTeamBattlesService(teamId);

    res.status(200).json({
      success: true,
      data: teamBattles,
    });
  } catch (error) {
    logger.error("Error fetching team battles:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch team battles",
    });
  }
};

// Start team battle
export const startTeamBattle = async (req, res) => {
  try {
    const { battleCode } = req.params;

    if (!battleCode) {
      return res.status(400).json({
        success: false,
        message: "Battle code is required",
      });
    }

    const teamBattle = await startTeamBattleService(battleCode);

    res.status(200).json({
      success: true,
      message: "Team battle started - all matches are live",
      data: teamBattle,
    });
  } catch (error) {
    logger.error("Error starting team battle:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to start team battle",
    });
  }
};

// Submit solution for a specific match
export const submitMatchSolution = async (req, res) => {
  try {
    const { battleCode, matchId } = req.params;
    const userId = req.user?.id;
    const { code, language, output } = req.body;

    if (!battleCode || !matchId || !userId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const submission = await submitMatchSolutionService(
      battleCode,
      matchId,
      userId,
      code,
      language,
      output || ""
    );

    res.status(201).json({
      success: true,
      message: "Solution submitted for match",
      data: submission,
    });
  } catch (error) {
    logger.error("Error submitting match solution:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to submit solution",
    });
  }
};

// Determine winner of a specific match
export const determineMatchWinner = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { winnerId } = req.body;

    if (!matchId || !winnerId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: matchId, winnerId",
      });
    }

    const match = await determineMatchWinnerService(matchId, winnerId);

    res.status(200).json({
      success: true,
      message: "Match winner determined",
      data: match,
    });
  } catch (error) {
    logger.error("Error determining match winner:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to determine match winner",
    });
  }
};

// Complete team battle (determine overall winner)
export const completeTeamBattle = async (req, res) => {
  try {
    const { battleCode } = req.params;

    if (!battleCode) {
      return res.status(400).json({
        success: false,
        message: "Battle code is required",
      });
    }

    const teamBattle = await completeTeamBattleService(battleCode);

    res.status(200).json({
      success: true,
      message: "Team battle completed",
      data: teamBattle,
    });
  } catch (error) {
    logger.error("Error completing team battle:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to complete team battle",
    });
  }
};

// Get active team battles
export const getActiveTeamBattles = async (req, res) => {
  try {
    const activeBattles = await getActiveTeamBattlesService();

    res.status(200).json({
      success: true,
      data: activeBattles,
    });
  } catch (error) {
    logger.error("Error fetching active team battles:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch active battles",
    });
  }
};
