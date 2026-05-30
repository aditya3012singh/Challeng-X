import RedisClient from "../cache/redis.client.js";
import logger from "../logger/logger.js";

const CACHE_PREFIX = "response:";
const CACHE_TTL = 300; // 5 minutes default

/**
 * Response Cache Service
 * Caches API responses in Redis to reduce database load
 */
class ResponseCache {
    /**
     * Generate cache key from request
     * @param {object} req - Express request
     * @returns {string} Cache key
     */
    static generateKey(req) {
        const { method, url, query } = req;
        const queryString = Object.keys(query)
            .sort()
            .map(k => `${k}=${query[k]}`)
            .join("&");
        return `${CACHE_PREFIX}${method}:${url}?${queryString}`;
    }

    /**
     * Get cached response
     * @param {string} key - Cache key
     * @returns {Promise<object|null>}
     */
    static async get(key) {
        try {
            const cached = await RedisClient.client.get(key);
            if (cached) {
                logger.debug(`[ResponseCache] Cache hit for ${key}`);
                return JSON.parse(cached);
            }
            return null;
        } catch (error) {
            logger.error(`[ResponseCache] Error getting cache ${key}:`, error);
            return null;
        }
    }

    /**
     * Set cached response
     * @param {string} key - Cache key
     * @param {object} data - Response data
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<void>}
     */
    static async set(key, data, ttl = CACHE_TTL) {
        try {
            await RedisClient.client.set(
                key,
                JSON.stringify(data),
                'EX', ttl
            );
            logger.debug(`[ResponseCache] Cached response for ${key}`);
        } catch (error) {
            logger.error(`[ResponseCache] Error caching ${key}:`, error);
        }
    }

    /**
     * Invalidate cache by pattern
     * @param {string} pattern - Key pattern to invalidate
     * @returns {Promise<void>}
     */
    static async invalidate(pattern) {
        try {
            const keys = await RedisClient.client.keys(`${CACHE_PREFIX}${pattern}*`);
            if (keys.length > 0) {
                await RedisClient.client.del(keys);
                logger.info(`[ResponseCache] Invalidated ${keys.length} keys matching ${pattern}`);
            }
        } catch (error) {
            logger.error(`[ResponseCache] Error invalidating ${pattern}:`, error);
        }
    }

    /**
     * Clear all cached responses
     * @returns {Promise<void>}
     */
    static async clearAll() {
        try {
            const keys = await RedisClient.client.keys(`${CACHE_PREFIX}*`);
            if (keys.length > 0) {
                await RedisClient.client.del(keys);
                logger.info(`[ResponseCache] Cleared ${keys.length} cached responses`);
            }
        } catch (error) {
            logger.error("[ResponseCache] Error clearing cache:", error);
        }
    }

    /**
     * Cache middleware for Express
     * @param {object} options - Cache options
     * @returns {function} Express middleware
     */
    static middleware(options = {}) {
        const { ttl = CACHE_TTL, skip = () => false } = options;

        return async (req, res, next) => {
            // Skip if not GET request
            if (req.method !== 'GET') {
                return next();
            }

            // Skip if skip function returns true
            if (skip(req, res)) {
                return next();
            }

            const key = this.generateKey(req);

            try {
                const cached = await this.get(key);
                if (cached) {
                    return res.json(cached);
                }

                // Override res.json to cache the response
                const originalJson = res.json.bind(res);
                res.json = (data) => {
                    this.set(key, data, ttl).catch(() => {});
                    return originalJson(data);
                };

                next();
            } catch (error) {
                logger.error("[ResponseCache] Middleware error:", error);
                next();
            }
        };
    }
}

export default ResponseCache;
