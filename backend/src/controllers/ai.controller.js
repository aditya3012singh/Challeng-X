import AIService from "../services/ai.service.js";
import ProblemService from "../services/problem.service.js";
import logger from "../utils/logger.js";

class AIController {
    async getHint(req, res, next) {
        try {
            const { problemId, currentCode, language } = req.body;

            if (!problemId) {
                return res.status(400).json({ message: "Problem ID is required" });
            }

            const problem = await ProblemService.getProblemByIdService(problemId);
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }

            const hint = await AIService.generateHint(problem, currentCode, language);
            
            res.status(200).json({ hint });
        } catch (error) {
            next(error);
        }
    }

    async getReview(req, res, next) {
        try {
            const { problemId, finalCode, language, result } = req.body;

            if (!problemId) {
                return res.status(400).json({ message: "Problem ID is required" });
            }

            const problem = await ProblemService.getProblemByIdService(problemId);
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }

            const report = await AIService.generateReview(problem, finalCode, language, result);
            
            res.status(200).json({ report });
        } catch (error) {
            next(error);
        }
    }

    async spawnGhost(req, res, next) {
        try {
            const { userId, difficulty } = req.body;
            
            if (!userId || !difficulty) {
                return res.status(400).json({ message: "User ID and difficulty are required" });
            }

            const MatchmakingService = (await import("../services/matchmaking.service.js")).default;
            const battle = await MatchmakingService.spawnGhostMatch(userId, difficulty);

            res.status(200).json({ 
                message: "Ghost match spawned",
                battleId: battle.id,
                battleCode: battle.battleCode
            });
        } catch (error) {
            next(error);
        }
    }

    async generateAIProblem(req, res, next) {
        try {
            const { difficulty, tags } = req.body;
            const problemData = await AIService.generateProblem(difficulty || "MEDIUM", tags || []);
            
            res.status(200).json({ 
                message: "AI Problem generated successfully", 
                problem: problemData 
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AIController();
