import AnalyticsService from "../services/analytics.service.js";
import Database from "../config/db.js";

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
}

export default AnalyticsController;
