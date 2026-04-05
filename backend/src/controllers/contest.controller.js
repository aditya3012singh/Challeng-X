import ContestService from "../services/contest.service.js";

class ContestController {
  static async createContest(req, res) {
    try {
      if (req.user.role !== "ADMIN") return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
      
      const contest = await ContestService.createContest(req.user.id, req.body);
      res.status(201).json({ success: true, contest });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || "Error creating contest" });
    }
  }

  static async getAllContests(req, res) {
    try {
      const contests = await ContestService.getAllContests();
      res.status(200).json({ success: true, contests });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching contests" });
    }
  }

  static async getContestById(req, res) {
    try {
      const contest = await ContestService.getContestById(req.params.id);
      res.status(200).json({ success: true, contest });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message || "Error fetching contest details" });
    }
  }

  static async registerForContest(req, res) {
    try {
      const participant = await ContestService.registerForContest(req.params.id, req.user.id);
      res.status(200).json({ success: true, message: "Registered successfully", participant });
    } catch (error) {
      if (error.code === 'P2002') return res.status(400).json({ success: false, message: "Already registered" });
      res.status(error.status || 500).json({ success: false, message: error.message || "Registration failed" });
    }
  }

  static async getContestProblems(req, res) {
    try {
      const problems = await ContestService.getContestProblems(req.params.id, req.user);
      res.status(200).json({ success: true, problems });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message || "Error fetching problems" });
    }
  }

  static async getContestLeaderboard(req, res) {
    try {
      const leaderboard = await ContestService.getContestLeaderboard(req.params.id);
      res.status(200).json({ success: true, leaderboard });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching leaderboard" });
    }
  }

  static async recordTabSwitch(req, res) {
    try {
      const { isVisible } = req.body;
      await ContestService.recordTabSwitch(req.params.id, req.user.id, isVisible);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error recording tab switch" });
    }
  }

  static async getContestParticipants(req, res) {
    try {
      if (req.user.role !== "ADMIN") return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
      
      const participants = await ContestService.getContestParticipants(req.params.id);
      res.status(200).json({ success: true, participants });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching participants" });
    }
  }

  static async disqualifyParticipant(req, res) {
    try {
      if (req.user.role !== "ADMIN") return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
      
      await ContestService.disqualifyParticipant(req.params.id, req.params.userId);
      res.status(200).json({ success: true, message: "Participant disqualified" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || "Error disqualifying participant" });
    }
  }
}

export default ContestController;
