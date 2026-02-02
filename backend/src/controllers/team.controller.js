// Team controller

import * as teamService from "../services/team.service.js";

export async function createTeamController(req, res) {
  const userId = req.user.id;
  const { teamName, maxTeamSize } = req.body;

  if (!teamName || teamName.trim().length < 3) {
    return res.status(400).json({ message: "Team name must be at least 3 characters" });
  }

  if (![2, 3, 4, 5].includes(maxTeamSize)) {
    return res.status(400).json({ message: "Team size must be 2, 3, 4, or 5" });
  }

  try {
    const team = await teamService.createTeamService(userId, teamName, maxTeamSize);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getTeamController(req, res) {
  const { teamId } = req.params;

  try {
    const team = await teamService.getTeamService(teamId);
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function joinTeamController(req, res) {
  const userId = req.user.id;
  const { teamCode } = req.body;

  if (!teamCode) {
    return res.status(400).json({ message: "Team code required" });
  }

  try {
    const result = await teamService.joinTeamService(teamCode, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function leaveTeamController(req, res) {
  const userId = req.user.id;
  const { teamId } = req.params;

  try {
    const result = await teamService.leaveTeamService(teamId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function disbandTeamController(req, res) {
  const userId = req.user.id;
  const { teamId } = req.params;

  try {
    const result = await teamService.disbandTeamService(teamId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserTeamsController(req, res) {
  const userId = req.user.id;

  try {
    const teams = await teamService.getUserTeamsService(userId);
    res.status(200).json({ teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
