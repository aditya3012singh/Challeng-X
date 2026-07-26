// • Add problem
// • Fetch problems
// • Fetch details

import ProblemService from "./problem.service.js";
import DBWrapper from "../../core/config/db.wrapper.js";
import { parsePagination, createPaginationMeta } from "../../core/pagination/pagination.utils.js";

class ProblemController {
    static async createProblem(req, res) {
        const problem = await ProblemService.createProblemService(req.validated.body);
        return res.status(201).json({ message: "Problem created successfully", problem });
    }

    static async getAllProblems(req, res) {
        // Parse pagination parameters
        const pagination = parsePagination(req, { defaultLimit: 20, maxLimit: 100 });
        const { page, limit, offset } = pagination;
        
        // Parse difficulty filter from query params
        const { difficulty } = req.query;
        const whereClause = difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty.toUpperCase())
            ? { difficulty: difficulty.toUpperCase() }
            : {};

        // Get total count with filters applied
        const total = await DBWrapper.execute("problemCountAllFiltered", (db) =>
            db.problem.count({ where: whereClause })
        );

        // Get paginated problems with filters applied
        const problems = await DBWrapper.execute("problemGetManyFiltered", (db) =>
            db.problem.findMany({
                where: whereClause,
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        );

        return res.status(200).json({ 
            message: "Problems fetched successfully", 
            data: problems,
            meta: createPaginationMeta(total, page, limit)
        });
    }

    static async getProblemById(req, res) {
        const { id: problemId } = req.params;
        const userId = req.user?.id;
        const { battleId, teamBattleMatchId } = req.query;

        const problem = await ProblemService.getProblemByIdService(problemId, userId, battleId, teamBattleMatchId);
        if (!problem) {
            const err = new Error("Problem not found");
            err.statusCode = 404;
            throw err;
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
    }

    static async unlockHint(req, res) {
        const { id: problemId } = req.params;
        const { hintIndex, battleId } = req.validated.body;
        const userId = req.user.id;

        const result = await ProblemService.unlockHintService(userId, problemId, hintIndex, battleId);
        return res.status(200).json(result);
    }

    static async getPersonalizedAIHint(req, res) {
        const { id: problemId } = req.params;
        const { currentCode, language } = req.validated.body;
        const userId = req.user.id;

        // 1. Check balance (AI Mentor costs more, e.g., 15)
        const MENTOR_COST = 15;
        const user = await DBWrapper.execute("problemGetAIHintUserCores", (db) =>
            db.user.findUnique({
                where: { id: userId },
                select: { cyberCores: true, username: true }
            })
        );

        if (user.cyberCores < MENTOR_COST) {
            const err = new Error(`Insufficient Cyber-Cores. Need ${MENTOR_COST} Cores for AI Mentor.`);
            err.statusCode = 400;
            throw err;
        }

        // 2. Get problem details
        const problem = await ProblemService.getProblemByIdService(problemId);
        if (!problem) {
            const err = new Error("Problem not found");
            err.statusCode = 404;
            throw err;
        }
        
        // 3. Generate AI Hint
        let hint;
        try {
            const AIService = (await import("../ai/ai.service.js")).default;
            hint = await AIService.generateHint(problem, currentCode, language);
        } catch (aiErr) {
            const err = new Error("AI Mentor connection lost. Try again later.");
            err.statusCode = 502; // Bad Gateway
            throw err;
        }

        // 4. Deduct coins
        await DBWrapper.execute("problemDeductCoresForAIHint", (db) =>
            db.user.update({
                where: { id: userId },
                data: { cyberCores: { decrement: MENTOR_COST } }
            })
        );

        return res.status(200).json({
            message: "AI Mentor has analyzed your code stream.",
            hint,
            remainingCores: user.cyberCores - MENTOR_COST
        });
    }
}

export default ProblemController;