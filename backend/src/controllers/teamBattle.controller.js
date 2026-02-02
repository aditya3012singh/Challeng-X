import {
  createTeamBattleService,
  getTeamBattleService,
  getTeamBattlesService,
  startTeamBattleService,
  submitTeamBattleSolutionService,
  getTeamBattleSubmissionsService,
  completeTeamBattleService,
  getActiveTeamBattlesService,
} from "../services/teamBattle.service.js";
import { logger } from "../utils/logger.js";

// Create a new team battle
export const createTeamBattle = async (req, res) => {
  try {
    const { team1Id, team2Id, problemId, maxTeamSize } = req.body;

    if (!team1Id || !team2Id || !problemId || !maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const teamBattle = await createTeamBattleService(
      team1Id,
      team2Id,
      problemId,
      maxTeamSize
    );

    res.status(201).json({
      success: true,
      message: "Team battle created successfully",
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
      message: "Team battle started",
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

// Submit team battle solution
export const submitTeamBattleSolution = async (req, res) => {
  try {
    const { battleCode } = req.params;
    const userId = req.user?.id;
    const { code, language, output } = req.body;

    if (!battleCode || !userId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const submission = await submitTeamBattleSolutionService(
      battleCode,
      userId,
      code,
      language,
      output || ""
    );

    res.status(201).json({
      success: true,
      message: "Submission recorded",
      data: submission,
    });
  } catch (error) {
    logger.error("Error submitting team battle solution:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to submit solution",
    });
  }
};

// Get team battle submissions
export const getTeamBattleSubmissions = async (req, res) => {
  try {
    const { battleCode } = req.params;

    if (!battleCode) {
      return res.status(400).json({
        success: false,
        message: "Battle code is required",
      });
    }

    const submissions = await getTeamBattleSubmissionsService(battleCode);

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error("Error fetching submissions:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch submissions",
    });
  }
};

// Complete team battle
export const completeTeamBattle = async (req, res) => {
  try {
    const { battleCode } = req.params;
    const { winnerTeamId } = req.body;

    if (!battleCode || !winnerTeamId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const teamBattle = await completeTeamBattleService(battleCode, winnerTeamId);

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
