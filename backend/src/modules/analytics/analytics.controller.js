import AnalyticsService from "./analytics.service.js";
import Database from "../../core/config/db.js";

class AnalyticsController {
    static async getProfileAnalytics(req, res) {
        try {
            const { username } = req.params;
            
            let targetUserId;
            if (username && username !== 'undefined') {
                const user = await Database.client.user.findUnique({ where: { username } });
                if (!user) return res.status(404).json({ message: "User not found" });
                targetUserId = user.id;
            } else {
                targetUserId = req.user.id;
            }

            const analytics = await AnalyticsService.getUserAnalytics(targetUserId);
            const history = await AnalyticsService.getMatchHistory(targetUserId);

            res.json({
                message: "Analytics fetched successfully",
                analytics,
                history
            });
        } catch (error) {
            console.error("Get analytics error:", error);
            res.status(500).json({ message: "Failed to fetch analytics" });
        }
    }

    static async getGlobalStats(req, res) {
        try {
            const stats = await AnalyticsService.getGlobalStats();
            res.json(stats);
        } catch (error) {
            console.error("Get global stats error:", error);
            res.status(500).json({ message: "Failed to fetch global stats" });
        }
    }
}

export default AnalyticsController;
