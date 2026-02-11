// • Fetch ranking data

import { getLeaderboard } from "../services/leaderboard.service.js";

class LeaderboardController {
    static async fetchLeaderboard(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try {
        const leaderboard = await getLeaderboard(page, limit);
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    }
}

export default LeaderboardController;
