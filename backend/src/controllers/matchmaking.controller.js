// Matchmaking controller

import * as matchmakingService from "../services/matchmaking.service.js";

export async function joinQueueController(req, res) {
    const userId = req.user.id;
    const { difficulty, socketId } = req.body;

    if (!difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
    }

    if (!socketId) {
        return res.status(400).json({ message: "Socket ID required" });
    }

    try {
        const result = await matchmakingService.joinQueue(userId, difficulty, socketId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function leaveQueueController(req, res) {
    const userId = req.user.id;

    try {
        const result = await matchmakingService.leaveQueue(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getQueueStatusController(req, res) {
    const userId = req.user.id;

    try {
        const status = await matchmakingService.getQueueStatus(userId);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
