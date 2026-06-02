import RedisClient from "./redis.client.js";
import Database from "../../core/config/db.js";
import S3Service from "../../integrations/s3/s3.service.js";
import logger from "../../core/logger/logger.js";
import { recordCacheOperation } from "../../core/metrics/prometheus.js";

const TESTCASE_PREFIX = "testcases:cached:";
const TESTCASE_TTL = 86400; // 24 hours
const ACTIVE_TESTCASE_PREFIX = "testcases:active:";
const ACTIVE_TESTCASE_TTL = 3600; // 1 hour - for active problems

/**
 * Testcase Cache Service
 * Caches test cases in Redis to avoid S3 fetches
 */
class TestcaseCache {
    /**
     * Get test cases from cache or S3 (lazy loading)
     * @param {string} problemId 
     * @returns {Promise<Array>}
     */
    static async getTestcases(problemId) {
        try {
            // Check active testcases first (for currently active problems)
            const activeCached = await RedisClient.client.get(`${ACTIVE_TESTCASE_PREFIX}${problemId}`);
            if (activeCached) {
                logger.debug(`[TestcaseCache] Active cache hit for testcases ${problemId}`);
                recordCacheOperation({ cacheType: 'testcase', hit: true });
                return JSON.parse(activeCached);
            }

            // Check regular cache
            const cached = await RedisClient.client.get(`${TESTCASE_PREFIX}${problemId}`);
            if (cached) {
                logger.debug(`[TestcaseCache] Cache hit for testcases ${problemId}`);
                recordCacheOperation({ cacheType: 'testcase', hit: true });
                return JSON.parse(cached);
            }

            // Cache miss - fetch from S3
            recordCacheOperation({ cacheType: 'testcase', hit: false });
            const testcases = await S3Service.fetchHiddenTestCases(problemId);

            if (testcases && testcases.length > 0) {
                // Cache both active and regular (for active problems)
                await this.cacheTestcases(problemId, testcases, true);
            }

            return testcases || [];
        } catch (error) {
            logger.error(`[TestcaseCache] Error getting testcases for ${problemId}:`, error);
            return [];
        }
    }

    /**
     * Cache test cases
     * @param {string} problemId 
     * @param {Array} testcases 
     * @param {boolean} isActive - If true, also cache as active (shorter TTL)
     * @returns {Promise<void>}
     */
    static async cacheTestcases(problemId, testcases, isActive = false) {
        try {
            await RedisClient.client.set(
                `${TESTCASE_PREFIX}${problemId}`,
                JSON.stringify(testcases),
                'EX', TESTCASE_TTL
            );
            
            if (isActive) {
                // Also cache as active (for currently active problems)
                await RedisClient.client.set(
                    `${ACTIVE_TESTCASE_PREFIX}${problemId}`,
                    JSON.stringify(testcases),
                    'EX', ACTIVE_TESTCASE_TTL
                );
            }
            
            logger.debug(`[TestcaseCache] Cached ${testcases.length} testcases for problem ${problemId}`);
        } catch (error) {
            logger.error(`[TestcaseCache] Error caching testcases for ${problemId}:`, error);
        }
    }

    /**
     * Remove testcases from cache
     * @param {string} problemId 
     * @returns {Promise<void>}
     */
    static async removeTestcases(problemId) {
        try {
            await RedisClient.client.del(`${TESTCASE_PREFIX}${problemId}`);
            await RedisClient.client.del(`${ACTIVE_TESTCASE_PREFIX}${problemId}`);
            logger.debug(`[TestcaseCache] Removed testcases for problem ${problemId}`);
        } catch (error) {
            logger.error(`[TestcaseCache] Error removing testcases for ${problemId}:`, error);
        }
    }

    /**
     * Mark testcases as active (for currently active problems)
     * @param {string} problemId 
     * @returns {Promise<void>}
     */
    static async markActive(problemId) {
        try {
            // Move from regular cache to active cache
            const cached = await RedisClient.client.get(`${TESTCASE_PREFIX}${problemId}`);
            if (cached) {
                await RedisClient.client.set(
                    `${ACTIVE_TESTCASE_PREFIX}${problemId}`,
                    cached,
                    'EX', ACTIVE_TESTCASE_TTL
                );
            }
            logger.debug(`[TestcaseCache] Marked testcases ${problemId} as active`);
        } catch (error) {
            logger.error(`[TestcaseCache] Error marking testcases ${problemId} as active:`, error);
        }
    }

    /**
     * Get cached testcases count
     * @returns {Promise<number>}
     */
    static async getCachedCount() {
        try {
            const keys = await RedisClient.client.keys(`${TESTCASE_PREFIX}*`);
            return keys.length;
        } catch (error) {
            logger.error("[TestcaseCache] Error getting cached count:", error);
            return 0;
        }
    }

    /**
     * Warm up cache with all testcases (lazy loading - only cache active problems)
     * @param {Array<string>} activeProblemIds - Only cache these problems
     * @returns {Promise<void>}
     */
    static async warmUp(activeProblemIds = []) {
        try {
            logger.info("[TestcaseCache] Warming up testcase cache...");

            if (activeProblemIds.length === 0) {
                logger.info("[TestcaseCache] No active problems specified - skipping warm-up");
                return;
            }

            for (const problemId of activeProblemIds) {
                const testcases = await S3Service.fetchHiddenTestCases(problemId);
                if (testcases && testcases.length > 0) {
                    await this.cacheTestcases(problemId, testcases, true);
                }
            }

            logger.info(`[TestcaseCache] Warm up complete: ${activeProblemIds.length} active problems cached`);
        } catch (error) {
            logger.error("[TestcaseCache] Error warming up cache:", error);
        }
    }

    /**
     * Invalidate testcases cache
     * @param {string} problemId 
     * @returns {Promise<void>}
     */
    static async invalidateTestcases(problemId) {
        try {
            await this.removeTestcases(problemId);
            logger.debug(`[TestcaseCache] Invalidated testcases for problem ${problemId}`);
        } catch (error) {
            logger.error(`[TestcaseCache] Error invalidating testcases ${problemId}:`, error);
        }
    }

    /**
     * Update testcases in cache
     * @param {string} problemId 
     * @param {Array} testcases 
     * @returns {Promise<void>}
     */
    static async updateTestcases(problemId, testcases) {
        try {
            await this.cacheTestcases(problemId, testcases);
            logger.debug(`[TestcaseCache] Updated testcases for problem ${problemId}`);
        } catch (error) {
            logger.error(`[TestcaseCache] Error updating testcases ${problemId}:`, error);
        }
    }
}

export default TestcaseCache;
