import Database from "../config/db.js";

const prisma = Database.client;

class AnalyticsService {
    static async getUserAnalytics(userId) {
        if (!userId) return null;

        // 1. Fetch all submissions for the user with problem and tags
        const submissions = await prisma.submission.findMany({
            where: { 
                userId,
                status: 'PASSED' // Only count successful solutions for skill metrics
            },
            include: {
                problem: {
                    include: {
                        tags: true
                    }
                }
            }
        });

        if (submissions.length === 0) {
            return {
                radarData: [
                    { subject: 'Speed', A: 0, fullMark: 100 },
                    { subject: 'Accuracy', A: 0, fullMark: 100 },
                    { subject: 'Logic', A: 0, fullMark: 100 },
                    { subject: 'Depth', A: 0, fullMark: 100 },
                    { subject: 'Versatility', A: 0, fullMark: 100 }
                ],
                tagStats: [],
                totalSolved: 0
            };
        }

        // 2. Initialize metrics
        const knowledge = {}; // Tag-based

        // 3. Calculate Scores
        let totalSpeedScore = 0;
        let totalAccuracyScore = 0;
        
        const difficultyMap = { EASY: 40, MEDIUM: 75, HARD: 100 };
        let totalDifficultyScore = 0;

        submissions.forEach(sub => {
            // Speed: ratio of time used to time limit (Lower time = Higher score)
            const timeLimit = sub.problem.timeLimitMs || 2000;
            const timeUsed = sub.executionTimeMs || 500;
            const speedRatio = Math.max(0, 1 - (timeUsed / timeLimit));
            totalSpeedScore += speedRatio * 100;

            // Accuracy: ratio of passed tests
            const testsPassed = sub.passedTests || 1;
            const testsTotal = sub.totalTests || 1;
            totalAccuracyScore += (testsPassed / testsTotal) * 100;

            // Logic: Weight by difficulty
            totalDifficultyScore += (difficultyMap[sub.problem.difficulty] || 50);

            // Knowledge: Aggregate by tags
            sub.problem.tags.forEach(tag => {
                knowledge[tag.name] = (knowledge[tag.name] || 0) + 1;
            });
        });

        const avgSpeed = totalSpeedScore / submissions.length;
        const avgAccuracy = totalAccuracyScore / submissions.length;
        const avgLogic = totalDifficultyScore / submissions.length;

        // Versatility: Number of unique tags solved (10 tags = 100 score)
        const uniqueTagsCount = Object.keys(knowledge).length;
        const versatilityScore = Math.min(100, uniqueTagsCount * 10);

        // Depth: Max problems solved in a single category (10 problems = 100 score)
        const maxProblemsInOneTag = Math.max(0, ...Object.values(knowledge));
        const depthScore = Math.min(100, maxProblemsInOneTag * 10);

        return {
            radarData: [
                { subject: 'Speed', A: Math.round(avgSpeed), fullMark: 100 },
                { subject: 'Accuracy', A: Math.round(avgAccuracy), fullMark: 100 },
                { subject: 'Logic', A: Math.round(avgLogic), fullMark: 100 },
                { subject: 'Depth', A: Math.round(depthScore), fullMark: 100 },
                { subject: 'Versatility', A: Math.round(versatilityScore), fullMark: 100 }
            ],
            tagStats: Object.entries(knowledge).map(([name, count]) => ({ name, count })),
            totalSolved: submissions.length
        };
    }

    static async getMatchHistory(userId, limit = 10) {
        return prisma.submission.findMany({
            where: { userId },
            include: {
                problem: {
                    select: { 
                        title: true, 
                        difficulty: true 
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: Number(limit)
        });
    }
}

export default AnalyticsService;
