/**
 * Cache Warm-up Script
 * Pre-populates Redis cache with users, problems, and test cases
 * 
 * Usage: node scripts/warmup_cache.js
 */

import env from "../src/core/config/env.js";
import logger from "../src/core/logger/logger.js";
import UserCache from "../src/core/cache/userCache.js";
import ProblemCache from "../src/core/cache/problemCache.js";
import TestcaseCache from "../src/core/cache/testcaseCache.js";

/**
 * Initialize Redis connection
 */
async function initRedis() {
    try {
        await UserCache.getUser("warmup_check");
        logger.info("✅ Redis connected");
        return true;
    } catch (error) {
        logger.error("❌ Redis connection failed:", error);
        return false;
    }
}

/**
 * Warm up all caches
 */
async function warmUpAllCaches() {
    logger.info("═══════════════════════════════════════════════════════════");
    logger.info("🚀 Starting Cache Warm-up");
    logger.info("═══════════════════════════════════════════════════════════");

    // Check Redis connection
    if (!await initRedis()) {
        process.exit(1);
    }

    // Warm up user cache
    logger.info("\n📦 Warming up User Cache...");
    await UserCache.warmUp();

    // Warm up problem cache
    logger.info("\n📦 Warming up Problem Cache...");
    await ProblemCache.warmUp();

    // Warm up testcase cache
    logger.info("\n📦 Warming up Testcase Cache...");
    await TestcaseCache.warmUp();

    logger.info("\n═══════════════════════════════════════════════════════════");
    logger.info("✅ Cache Warm-up Complete");
    logger.info("═══════════════════════════════════════════════════════════");
}

// Run warm-up
warmUpAllCaches().catch(error => {
    logger.error("❌ Warm-up failed:", error);
    process.exit(1);
});
