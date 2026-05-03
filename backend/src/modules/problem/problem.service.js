
// create problems service

import RedisClient from "../../core/cache/redis.client.js";
import Database from "../../core/config/db.js";

class ProblemService {
    static async createProblemService(data) {
        const problem = await Database.client.problem.create({
            data: {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                timeLimitMs: data.timeLimitMs || 2000,
                // memoryLimitMb: data.memoryLimitMb || 256,
            }
        })
        await RedisClient.client.del("problems:all");
        return problem;
    }

    static async getAllProblemsService() {
        const key = "problems:all";

        const cached = await RedisClient.client.get(key);

        if (cached) {
            return JSON.parse(cached);
        }

        const problems = await Database.client.problem.findMany({
            select: {
                id: true,
                title: true,
                difficulty: true,
                tags: { select: { name: true } }
            }
        });
        await RedisClient.client.set(key, JSON.stringify(problems), 'EX', 3600);
        return problems;
    }

    static async getProblemByIdService(problemId, userId = null) {
        const key = userId ? `problem:${problemId}:${userId}` : `problem:${problemId}`;

        const cached = await RedisClient.client.get(key);
        if (cached) {
            return JSON.parse(cached);
        }

        const problem = await Database.client.problem.findUnique({
            where: { id: problemId },
            include: {
                tags: { select: { name: true } },
                testcases: {
                    where: {
                        OR: [
                            { isHidden: false },
                            { isSample: true }
                        ]
                    }
                },
                tags: true,
                userHints: (userId && (battleId || teamBattleMatchId)) ? {
                    where: { 
                        userId,
                        OR: [
                            { battleId: battleId || undefined },
                            { teamBattleMatchId: teamBattleMatchId || undefined }
                        ]
                    },
                    select: { hintIndex: true }
                } : undefined
            }
        });

        if (problem && userId) {
            const unlockedIndices = problem.userHints.map(uh => uh.hintIndex);
            problem.hints = problem.hints.map((h, i) => unlockedIndices.includes(i) ? h : null);
        } else if (problem) {
            // For guests or when no userId is provided, hide all hints
            problem.hints = problem.hints.map(() => null);
        }

        if (problem) {
            await RedisClient.client.set(key, JSON.stringify(problem), 'EX', 300);
        }
        return problem;
    }

    static async unlockHintService(userId, problemId, hintIndex, battleId = null) {
        if (hintIndex < 0 || hintIndex > 2) throw new Error("Invalid hint index");

        return await Database.client.$transaction(async (tx) => {
            // Determine match type
            let bId = null;
            let tbmId = null;
            
            if (battleId) {
                const isTeamMatch = await tx.teamBattleMatch.findUnique({ where: { id: battleId } });
                if (isTeamMatch) tbmId = battleId;
                else bId = battleId;
            }

            // Check if already unlocked in THIS match
            const existing = await tx.userHint.findFirst({
                where: {
                    userId,
                    problemId,
                    hintIndex,
                    battleId: bId,
                    teamBattleMatchId: tbmId
                }
            });
            if (existing) return { message: "Hint already unlocked in this match" };

            // 2. Check user balance
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { cyberCores: true }
            });

            const HINT_COST = 5;
            if (user.cyberCores < HINT_COST) {
                throw new Error("Insufficient Cyber-Cores. Transmit failed.");
            }

            // 3. Perform transaction
            await tx.user.update({
                where: { id: userId },
                data: { cyberCores: { decrement: HINT_COST } }
            });

            await tx.userHint.create({
                data: { 
                    userId, 
                    problemId, 
                    hintIndex, 
                    battleId: bId, 
                    teamBattleMatchId: tbmId 
                }
            });

            // 4. Get the hint string
            const problem = await tx.problem.findUnique({
                where: { id: problemId },
                select: { hints: true }
            });

            await RedisClient.client.del(`problem:${problemId}:${userId}`);

            return {
                message: "Hint unlocked successfully",
                hint: problem.hints[hintIndex] || "No hint available for this slot.",
                remainingCores: user.cyberCores - HINT_COST
            };
        });
    }

    static async getUnlockedHintsService(userId, problemId, battleId = null, teamBattleMatchId = null) {
        const unlocked = await Database.client.userHint.findMany({
            where: {
                userId,
                problemId,
                OR: [
                    { battleId: battleId || null },
                    { teamBattleMatchId: teamBattleMatchId || null }
                ]
            },
            select: { hintIndex: true }
        });

        const problem = await Database.client.problem.findUnique({
            where: { id: problemId },
            select: { hints: true }
        });

        const result = [null, null, null];
        unlocked.forEach(u => {
            if (u.hintIndex < 3) {
                result[u.hintIndex] = problem.hints[u.hintIndex];
            }
        });

        return result;
    }
}

export default ProblemService;