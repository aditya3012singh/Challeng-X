// • Fetch ranking data

import LeaderboardService from "./leaderboard.service.js";

class LeaderboardController {
    static async fetchLeaderboard(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const filter = req.query.filter || 'GLOBAL';
        const userId = req.user?.id;

        const leaderboard = await LeaderboardService.getLeaderboard(page, limit, filter, userId);
        res.ok(leaderboard, "Leaderboard fetched successfully");
    }
}

export default LeaderboardController;
