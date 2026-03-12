// Matchmaking controller

import MatchmakingService from "../services/matchmaking.service.js";

class MatchmakingController {
    static async joinQueueController(req, res) {
    const userId = req.user.id;
    const { difficulty } = req.body;

    if (!difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
    }

    try {
        const result = await MatchmakingService.joinQueue(userId, difficulty, socketId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

    static async leaveQueueController(req, res) {
    const userId = req.user.id;

    try {
        const result = await MatchmakingService.leaveQueue(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
}

export default MatchmakingController;
