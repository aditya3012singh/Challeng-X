// • Add problem
// • Fetch problems
// • Fetch details

import ProblemService from "../services/problem.service.js";
import TestcaseService from "../services/testcase.service.js";
import ProblemSchema from "../validation/createProblem.schema.js";
import Database from "../config/db.js";

class ProblemController {
    static async createProblem(req, res) {
        const validation = ProblemSchema.createProblemSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.error.errors });
        }
        try {
            const problem = await ProblemService.createProblemService(validation.data);
            return res.status(201).json({ message: "Problem created successfully", problem: problem });
        } catch (error) {
            console.error("Error creating problem:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAllProblems(req, res) {
        try {
            const problems = await ProblemService.getAllProblemsService();
            return res.status(200).json({ message: "Problems fetched successfully", problems: problems });
        } catch (error) {
            console.error("Error fetching problems:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getProblemById(req, res) {
        const { id: problemId } = req.params;
        const userId = req.user?.id;
        const { battleId, teamBattleMatchId } = req.query;
        try {
            const problem = await ProblemService.getProblemByIdService(problemId, userId, battleId, teamBattleMatchId);
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }

            // Hide hints that are not unlocked
            const unlockedIndexes = (problem.userHints || []).map(uh => uh.hintIndex);
            const securedHints = problem.hints.map((hint, index) => {
                return unlockedIndexes.includes(index) ? hint : null;
            });

            const { hints, userHints, ...securedProblem } = problem;

            return res.status(200).json({ 
                message: "Problem fetched successfully", 
                problem: {
                    ...securedProblem,
                    hints: securedHints,
                    totalHints: hints.length
                } 
            });
        } catch (error) {
            console.error("Error fetching problem:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async unlockHint(req, res) {
        const { id: problemId } = req.params;
        const { hintIndex, battleId } = req.body;
        const userId = req.user.id;

        if (hintIndex === undefined || hintIndex < 0 || hintIndex > 2) {
            return res.status(400).json({ message: "Invalid hint index. Must be 0, 1, or 2." });
        }

        try {
            const result = await ProblemService.unlockHintService(userId, problemId, hintIndex, battleId);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Error unlocking hint:", error);
            return res.status(400).json({ message: error.message || "Failed to unlock hint" });
        }
    }

    static async getPersonalizedAIHint(req, res) {
        const { id: problemId } = req.params;
        const { currentCode, language } = req.body;
        const userId = req.user.id;

        try {
            // 1. Check balance (AI Mentor costs more, e.g., 15)
            const MENTOR_COST = 15;
            const user = await Database.client.user.findUnique({
                where: { id: userId },
                select: { cyberCores: true, username: true }
            });

            if (user.cyberCores < MENTOR_COST) {
                return res.status(400).json({ message: `Insufficient Cyber-Cores. Need ${MENTOR_COST} Cores for AI Mentor.` });
            }

            // 2. Get problem details
            const problem = await ProblemService.getProblemByIdService(problemId);
            
            // 3. Generate AI Hint
            const AIService = (await import("../services/ai.service.js")).default;
            const hint = await AIService.generateHint(problem, currentCode, language);

            // 4. Deduct coins
            await Database.client.user.update({
                where: { id: userId },
                data: { cyberCores: { decrement: MENTOR_COST } }
            });

            return res.status(200).json({
                message: "AI Mentor has analyzed your code stream.",
                hint,
                remainingCores: user.cyberCores - MENTOR_COST
            });
        } catch (error) {
            console.error("AI Mentor error:", error);
            return res.status(500).json({ message: "AI Mentor connection lost. Try again later." });
        }
    }
}

export default ProblemController;