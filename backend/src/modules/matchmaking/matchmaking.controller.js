// Matchmaking controller

import MatchmakingService from "./matchmaking.service.js";

class MatchmakingController {
    static async joinQueueController(req, res) {
    const userId = req.user.id;
    const { difficulty, socketId, lobbyId } = req.body;

    if (!difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
    }

    if (!socketId) {
        console.warn(`[Matchmaking] Join failed for user ${userId}: No socket ID provided`);
        return res.status(400).json({ message: "Socket ID required" });
    }

    console.log(`[Matchmaking] User ${userId} joining queue for ${difficulty} with socket ${socketId}${lobbyId ? ` in lobby ${lobbyId}` : ""}`);

    try {
        const result = await MatchmakingService.joinQueue(userId, difficulty, socketId, lobbyId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

static async leaveQueueController(req, res) {
    const userId = req.user.id;

    try {
        const result = await MatchmakingService.leaveQueue(userId);

        return res.status(200).json(result);

    } catch (error) {

        // user already not in queue
        if (error.message === "Not in queue") {
            return res.status(200).json({
                message: "User already not in queue"
            });
        }

        console.error("Leave queue error:", error);

        return res.status(500).json({
            message: "Failed to leave matchmaking queue"
        });
    }
}

    static async getQueueStatusController(req, res) {
    const userId = req.user.id;

    try {
        const status = await MatchmakingService.getQueueStatus(userId);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

    static async acceptMatchController(req, res) {
        const userId = req.user.id;
        const { proposalId } = req.body;

        if (!proposalId) {
            return res.status(400).json({ message: "Proposal ID is required" });
        }

        try {
            const result = await MatchmakingService.acceptMatch(userId, proposalId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async declineMatchController(req, res) {
        const userId = req.user.id;
        const { proposalId } = req.body;

        if (!proposalId) {
            return res.status(400).json({ message: "Proposal ID is required" });
        }

        try {
            const result = await MatchmakingService.declineMatch(userId, proposalId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getActivityFeedController(req, res) {
        try {
            const feed = await MatchmakingService.getGlobalActivityFeed();
            res.status(200).json(feed);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default MatchmakingController;
