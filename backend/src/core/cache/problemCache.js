import RedisClient from "./redis.client.js";
import Database from "../../core/config/db.js";
import logger from "../../core/logger/logger.js";
import { recordCacheOperation } from "../../core/metrics/prometheus.js";

const PROBLEMS_SET = "problems:cached";
const PROBLEM_PREFIX = "problem:cached:";
const PROBLEMS_TTL = 86400; // 24 hours
const LOCK_PREFIX = "lock:problem:";
const LOCK_TTL = 30; // 30 seconds lock TTL

/**
 * Problem Cache Service
 * Caches problems and their test cases in Redis
 */
class ProblemCache {
    /**
     * Get problem from cache or DB with single-flight caching
     * @param {string} problemId 
     * @returns {Promise<object|null>}
     */
    static async getProblem(problemId) {
        try {
            const cached = await RedisClient.client.get(`${PROBLEM_PREFIX}${problemId}`);
            if (cached) {
                logger.debug(`[ProblemCache] Cache hit for problem ${problemId}`);
                recordCacheOperation({ cacheType: 'problem', hit: true });
                return JSON.parse(cached);
            }

            // Single-flight: Try to acquire lock
            recordCacheOperation({ cacheType: 'problem', hit: false });
            const lockKey = `${LOCK_PREFIX}${problemId}`;
            const lock = await RedisClient.client.set(lockKey, '1', 'NX', 'EX', LOCK_TTL);
            
            if (lock) {
                // We got the lock - fetch from DB
                try {
                    const problem = await Database.client.problem.findUnique({
                        where: { id: problemId },
                        include: {
                            testcases: {
                                where: {
                                    OR: [
                                        { isHidden: false },
                                        { isSample: true }
                                    ]
                                }
                            },
                            tags: true
                        }
                    });

                    if (problem) {
                        await this.cacheProblem(problem);
                    }

                    return problem;
                } finally {
                    // Release lock
                    await RedisClient.client.del(lockKey);
                }
            } else {
                // Another request is fetching - wait briefly and retry
                await new Promise(resolve => setTimeout(resolve, 50));
                return await this.getProblem(problemId);
            }
        } catch (error) {
            logger.error(`[ProblemCache] Error getting problem ${problemId}:`, error);
            return null;
        }
    }

    /**
     * Get random problem by difficulty
     * @param {string} difficulty 
     * @returns {Promise<object|null>}
     */
    static async getRandomProblemByDifficulty(difficulty) {
        try {
            const setKey = (difficulty && difficulty !== "null" && difficulty !== "ALL")
                ? `${PROBLEMS_SET}:${difficulty}`
                : PROBLEMS_SET;

            let randomId = await RedisClient.client.srandmember(setKey);

            if (!randomId && setKey !== PROBLEMS_SET) {
                randomId = await RedisClient.client.srandmember(PROBLEMS_SET);
            }
            
            if (!randomId) {
                // Cache miss - fetch from DB
                recordCacheOperation({ cacheType: 'problem', hit: false });
                const whereClause = (difficulty && difficulty !== "null" && difficulty !== "ALL") ? { difficulty } : {};
                const problems = await Database.client.problem.findMany({
                    where: whereClause,
                    select: { id: true, difficulty: true }
                });

                if (problems.length === 0) return null;

                // Cache problems using Redis Sets
                const problemIds = problems.map(p => p.id);
                await RedisClient.client.sadd(PROBLEMS_SET, problemIds);
                if (difficulty && difficulty !== "null" && difficulty !== "ALL") {
                    await RedisClient.client.sadd(`${PROBLEMS_SET}:${difficulty}`, problemIds);
                }

                // Return random problem
                return await this.getProblem(problemIds[Math.floor(Math.random() * problemIds.length)]);
            }

            // Get full problem from cache
            recordCacheOperation({ cacheType: 'problem', hit: true });
            return await this.getProblem(randomId);
        } catch (error) {
            logger.error(`[ProblemCache] Error getting random problem for difficulty ${difficulty}:`, error);
            return null;
        }
    }

    /**
     * Cache problem data
     * @param {object} problem 
     * @returns {Promise<void>}
     */
    static async cacheProblem(problem) {
        try {
            const problemData = {
                id: problem.id,
                title: problem.title,
                description: problem.description,
                constraints: problem.constraints,
                difficulty: problem.difficulty,
                timeLimitMs: problem.timeLimitMs,
                tags: (problem.tags || []).map(tag => tag.name)
                // NOTE: Testcases are NOT included here to save memory
                // They are cached separately in TestcaseCache when needed
            };

            // Delete any existing key with potential wrong type (old List-based data)
            try {
                await RedisClient.client.del(`${PROBLEM_PREFIX}${problem.id}`);
            } catch (delErr) {
                logger.debug(`[ProblemCache] Could not delete old key for ${problem.id}, will overwrite`);
            }

            await RedisClient.client.set(
                `${PROBLEM_PREFIX}${problem.id}`,
                JSON.stringify(problemData),
                'EX', PROBLEMS_TTL
            );

            // Add to difficulty-specific Set (O(1) random selection)
            await RedisClient.client.sadd(`${PROBLEMS_SET}:${problem.difficulty}`, problem.id);
            // Add to global problems Set
            await RedisClient.client.sadd(PROBLEMS_SET, problem.id);

            logger.debug(`[ProblemCache] Cached problem ${problem.id}`);
        } catch (error) {
            logger.error(`[ProblemCache] Error caching problem ${problem.id}:`, error);
        }
    }

    /**
     * Cache problem IDs for difficulty (legacy - kept for compatibility)
     * @param {string} problemId 
     * @param {string} difficulty 
     * @returns {Promise<void>}
     */
    static async cacheProblemIds(problemId, difficulty) {
        try {
            // Use Set instead of List for O(1) random selection
            await RedisClient.client.sadd(`${PROBLEMS_SET}:${difficulty}`, problemId);
            await RedisClient.client.sadd(PROBLEMS_SET, problemId);
        } catch (error) {
            logger.error(`[ProblemCache] Error caching problem IDs for ${problemId}:`, error);
        }
    }

    /**
     * Remove problem from cache
     * @param {string} problemId 
     * @returns {Promise<void>}
     */
    static async removeProblem(problemId) {
        try {
            await RedisClient.client.del(`${PROBLEM_PREFIX}${problemId}`);
            // Remove from Sets
            await RedisClient.client.srem(PROBLEMS_SET, problemId);
            
            // Get difficulty from cache
            const cached = await RedisClient.client.get(`${PROBLEM_PREFIX}${problemId}`);
            if (cached) {
                const problemData = JSON.parse(cached);
                await RedisClient.client.srem(`${PROBLEMS_SET}:${problemData.difficulty}`, problemId);
            }

            logger.debug(`[ProblemCache] Removed problem ${problemId} from cache`);
        } catch (error) {
            logger.error(`[ProblemCache] Error removing problem ${problemId}:`, error);
        }
    }

    /**
     * Get all cached problem IDs
     * @returns {Promise<Array<string>>}
     */
    static async getAllProblemIds() {
        try {
            return await RedisClient.client.smembers(PROBLEMS_SET);
        } catch (error) {
            logger.error("[ProblemCache] Error getting all problem IDs:", error);
            return [];
        }
    }

    /**
     * Get problem count by difficulty
     * @param {string} difficulty 
     * @returns {Promise<number>}
     */
    static async getProblemCountByDifficulty(difficulty) {
        try {
            return await RedisClient.client.scard(`${PROBLEMS_SET}:${difficulty}`);
        } catch (error) {
            logger.error(`[ProblemCache] Error getting problem count for ${difficulty}:`, error);
            return 0;
        }
    }

    /**
     * Warm up cache with all problems
     * @returns {Promise<void>}
     */
    static async warmUp() {
        try {
            logger.info("[ProblemCache] Warming up problem cache...");

            const problems = await Database.client.problem.findMany({
                select: {
                    id: true,
                    title: true,
                    description: true,
                    constraints: true,
                    difficulty: true,
                    timeLimitMs: true,
                    tags: {
                        select: { name: true }
                    }
                }
            });

            let successCount = 0;
            let errorCount = 0;

            // Use Redis pipeline to batch writes for better performance
            const pipeline = RedisClient.client.pipeline();

            for (const problem of problems) {
                try {
                    const problemData = {
                        id: problem.id,
                        title: problem.title,
                        description: problem.description,
                        constraints: problem.constraints,
                        difficulty: problem.difficulty,
                        timeLimitMs: problem.timeLimitMs,
                        tags: (problem.tags || []).map(tag => tag.name)
                    };

                    pipeline.set(
                        `${PROBLEM_PREFIX}${problem.id}`,
                        JSON.stringify(problemData),
                        'EX', PROBLEMS_TTL
                    );
                    pipeline.sadd(`${PROBLEMS_SET}:${problem.difficulty}`, problem.id);
                    pipeline.sadd(PROBLEMS_SET, problem.id);
                    successCount++;
                } catch (err) {
                    errorCount++;
                    logger.debug(`[ProblemCache] Skipping problem ${problem.id} due to error`);
                }
            }

            await pipeline.exec();

            logger.info(`[ProblemCache] Warm up complete: ${successCount} problems cached${errorCount > 0 ? `, ${errorCount} skipped` : ''}`);
        } catch (error) {
            logger.error("[ProblemCache] Error warming up cache:", error);
        }
    }

    /**
     * Invalidate problem cache
     * @param {string} problemId 
     * @returns {Promise<void>}
     */
    static async invalidateProblem(problemId) {
        try {
            await RedisClient.client.del(`${PROBLEM_PREFIX}${problemId}`);
            await RedisClient.client.srem(PROBLEMS_SET, problemId);
            
            // Get difficulty from cache
            const cached = await RedisClient.client.get(`${PROBLEM_PREFIX}${problemId}`);
            if (cached) {
                const problemData = JSON.parse(cached);
                await RedisClient.client.srem(`${PROBLEMS_SET}:${problemData.difficulty}`, problemId);
            }
            
            logger.debug(`[ProblemCache] Invalidated problem ${problemId}`);
        } catch (error) {
            logger.error(`[ProblemCache] Error invalidating problem ${problemId}:`, error);
        }
    }

    /**
     * Update problem in cache
     * @param {object} problem 
     * @returns {Promise<void>}
     */
    static async updateProblem(problem) {
        try {
            await this.cacheProblem(problem);
            logger.debug(`[ProblemCache] Updated problem ${problem.id}`);
        } catch (error) {
            logger.error(`[ProblemCache] Error updating problem ${problem.id}:`, error);
        }
    }
}

export default ProblemCache;
