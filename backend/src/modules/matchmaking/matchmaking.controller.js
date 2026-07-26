// Matchmaking controller

import MatchmakingService from "./matchmaking.service.js";

class MatchmakingController {
    static async joinQueueController(req, res) {
        const userId = req.user.id;
        const { difficulty, socketId, lobbyId } = req.validated.body;

        const result = await MatchmakingService.joinQueue(userId, difficulty, socketId, lobbyId);
        res.ok(result, "Joined matchmaking queue successfully");
    }

    static async leaveQueueController(req, res) {
        const userId = req.user.id;
        try {
            const result = await MatchmakingService.leaveQueue(userId);
            return res.ok(result, "Left matchmaking queue successfully");
        } catch (error) {
            // If user is already not in the queue, return success
            if (error.message === "Not in queue") {
                return res.ok({
                    message: "User already not in queue"
                }, "User already not in queue");
            }
            throw error;
        }
    }

    static async getQueueStatusController(req, res) {
        const userId = req.user.id;
        const status = await MatchmakingService.getQueueStatus(userId);
        res.ok(status, "Queue status fetched successfully");
    }

    static async acceptMatchController(req, res) {
        const userId = req.user.id;
        const { proposalId } = req.validated.body;

        const result = await MatchmakingService.acceptMatch(userId, proposalId);
        res.ok(result, "Match accepted");
    }

    static async declineMatchController(req, res) {
        const userId = req.user.id;
        const { proposalId } = req.validated.body;

        const result = await MatchmakingService.declineMatch(userId, proposalId);
        res.ok(result, "Match declined");
    }

    static async getActivityFeedController(req, res) {
        const feed = await MatchmakingService.getGlobalActivityFeed();
        res.ok(feed, "Activity feed fetched successfully");
    }
}

export default MatchmakingController;
