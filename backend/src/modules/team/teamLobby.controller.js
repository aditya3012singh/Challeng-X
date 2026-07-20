import TeamLobbyService from "./teamLobby.service.js";

class TeamLobbyController {
  static async createLobby(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { teamSize, difficulty } = req.body;

      const lobby = await TeamLobbyService.createLobbyService(userId, teamSize, difficulty);
      res.status(201).json({ success: true, data: lobby });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getLobby(req, res) {
    try {
      const { roomCode } = req.params;
      const lobby = await TeamLobbyService.getLobbyService(roomCode?.toUpperCase());
      if (!lobby) {
        return res.status(404).json({ success: false, message: "Lobby not found" });
      }
      res.status(200).json({ success: true, data: lobby });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async joinLobby(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { roomCode } = req.body;

      const lobby = await TeamLobbyService.joinLobbyService(userId, roomCode?.toUpperCase());
      res.status(200).json({ success: true, data: lobby });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async switchTeam(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { roomCode, targetTeam } = req.body; // targetTeam = "ALPHA" | "BRAVO"

      const lobby = await TeamLobbyService.switchTeamService(userId, roomCode?.toUpperCase(), targetTeam);
      res.status(200).json({ success: true, data: lobby });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async toggleReady(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { roomCode } = req.body;

      const lobby = await TeamLobbyService.toggleReadyService(userId, roomCode?.toUpperCase());
      res.status(200).json({ success: true, data: lobby });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async leaveLobby(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { roomCode } = req.body;

      const lobby = await TeamLobbyService.leaveLobbyService(userId, roomCode?.toUpperCase());
      res.status(200).json({ success: true, data: lobby });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async startBattle(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { roomCode } = req.body;

      const lobby = await TeamLobbyService.startTeamBattleService(userId, roomCode?.toUpperCase());
      res.status(200).json({ success: true, data: lobby });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default TeamLobbyController;
