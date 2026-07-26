// Matchmaking controller

import MatchmakingService from "./matchmaking.service.js";

class MatchmakingController {
    static async joinQueueController(req, res) {
        const userId = req.user.id;
        const { difficulty, socketId, lobbyId } = req.validated.body;

        const result = await MatchmakingService.joinQueue(userId, difficulty, socketId, lobbyId);
        res.status(200).json(result);
    }

    static async leaveQueueController(req, res) {
        const userId = req.user.id;
        try {
            const result = await MatchmakingService.leaveQueue(userId);
            return res.status(200).json(result);
        } catch (error) {
            // If user is already not in the queue, return success
            if (error.message === "Not in queue") {
                return res.status(200).json({
                    message: "User already not in queue"
                });
            }
            throw error;
        }
    }

    static async getQueueStatusController(req, res) {
        const userId = req.user.id;
        const status = await MatchmakingService.getQueueStatus(userId);
        res.status(200).json(status);
    }

    static async acceptMatchController(req, res) {
        const userId = req.user.id;
        const { proposalId } = req.validated.body;

        const result = await MatchmakingService.acceptMatch(userId, proposalId);
        res.status(200).json(result);
    }

    static async declineMatchController(req, res) {
        const userId = req.user.id;
        const { proposalId } = req.validated.body;

        const result = await MatchmakingService.declineMatch(userId, proposalId);
        res.status(200).json(result);
    }

    static async getActivityFeedController(req, res) {
        const feed = await MatchmakingService.getGlobalActivityFeed();
        res.status(200).json(feed);
    }
}

export default MatchmakingController;
