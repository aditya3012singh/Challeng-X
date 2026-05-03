// Team controller

import TeamService from "./team.service.js";

class TeamController {
  static async createTeamController(req, res) {
  const userId = req.user.id;
  const { teamName, maxTeamSize } = req.body;

  if (!teamName || teamName.trim().length < 3) {
    return res.status(400).json({ message: "Team name must be at least 3 characters" });
  }

  if (![2, 3, 4, 5].includes(maxTeamSize)) {
    return res.status(400).json({ message: "Team size must be 2, 3, 4, or 5" });
  }

  try {
    const team = await TeamService.createTeamService(userId, teamName, maxTeamSize);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }

  static async getTeamController(req, res) {
  const { teamId } = req.params;

  try {
    const team = await TeamService.getTeamService(teamId);
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }

  static async joinTeamController(req, res) {
  const userId = req.user.id;
  const { teamCode } = req.body;

  if (!teamCode) {
    return res.status(400).json({ message: "Team code required" });
  }

  try {
    const result = await TeamService.joinTeamService(teamCode, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }

  static async leaveTeamController(req, res) {
  const userId = req.user.id;
  const { teamId } = req.params;

  try {
    const result = await TeamService.leaveTeamService(teamId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }

  static async disbandTeamController(req, res) {
  const userId = req.user.id;
  const { teamId } = req.params;

  try {
    const result = await TeamService.disbandTeamService(teamId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }

  static async getUserTeamsController(req, res) {
  const userId = req.user.id;
  console.log("you hit the getUserTeamsController");
  console.log("Controller: Fetching teams for user:", userId);

  try {
    const teams = await TeamService.getUserTeamsService(userId);
    res.status(200).json({ teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }
}

export default TeamController;
