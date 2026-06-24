import RedisClient from "./redis.client.js";
import Database from "../../core/config/db.js";
import logger from "../../core/logger/logger.js";
import { recordCacheOperation } from "../../core/metrics/prometheus.js";

const ONLINE_USERS_SET = "online_users";
const PRESENCE_PREFIX = "presence:";
const PRESENCE_TTL = 30; // 30 seconds - for heartbeat-based presence
const USER_PREFIX = "user:profile:";
const USER_TTL = 3600; // 1 hour - for profile data

/**
 * User Cache Service
 * Caches user profile data in Redis to reduce DB calls
 */
class UserCache {
    /**
     * Get user from cache or DB
     * @param {string} userId 
     * @returns {Promise<object|null>}
     */
    static async getUser(userId) {
        try {
            const cached = await RedisClient.client.get(`${USER_PREFIX}${userId}`);
            if (cached) {
                logger.debug(`[UserCache] Cache hit for user ${userId}`);
                recordCacheOperation({ cacheType: 'user', hit: true });
                return JSON.parse(cached);
            }

            // Cache miss - fetch from DB
            recordCacheOperation({ cacheType: 'user', hit: false });
            const user = await Database.client.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    rankPoints: true,
                    profilePic: true,
                    wins: true,
                    losses: true,
                    cyberCores: true,
                    country: true,
                    region: true,
                    linkedin: true,
                    github: true,
                    leetcode: true,
                    codeforces: true,
                    hackerrank: true,
                    gfg: true,
                    twitter: true,
                    instagram: true
                }
            });

            if (user) {
                await this.cacheUser(user);
            }

            return user;
        } catch (error) {
            logger.error(`[UserCache] Error getting user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Cache user data
     * @param {object} user 
     * @param {boolean} isOnline 
     * @returns {Promise<void>}
     */
    static async cacheUser(user, isOnline = false) {
        try {
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                rankPoints: user.rankPoints,
                profilePic: user.profilePic,
                wins: user.wins,
                losses: user.losses,
                cyberCores: user.cyberCores,
                country: user.country,
                region: user.region,
                socialLinks: {
                    linkedin: user.linkedin,
                    github: user.github,
                    leetcode: user.leetcode,
                    codeforces: user.codeforces,
                    hackerrank: user.hackerrank,
                    gfg: user.gfg,
                    twitter: user.twitter,
                    instagram: user.instagram
                }
            };

            // Delete any existing key with potential wrong type
            try {
                await RedisClient.client.del(`${USER_PREFIX}${user.id}`);
            } catch (delErr) {
                logger.debug(`[UserCache] Could not delete old key for ${user.id}, will overwrite`);
            }

            await RedisClient.client.set(
                `${USER_PREFIX}${user.id}`,
                JSON.stringify(userData),
                'EX', USER_TTL
            );

            // Update presence (short TTL, updated on heartbeat)
            if (isOnline) {
                await RedisClient.client.set(
                    `${PRESENCE_PREFIX}${user.id}`,
                    JSON.stringify({ lastHeartbeat: Date.now() }),
                    'EX', PRESENCE_TTL
                );
                await RedisClient.client.sadd(ONLINE_USERS_SET, user.id);
            }

            logger.debug(`[UserCache] Cached user ${user.id}`);
        } catch (error) {
            logger.error(`[UserCache] Error caching user ${user.id}:`, error);
        }
    }

    /**
     * Remove user from cache
     * @param {string} userId 
     * @returns {Promise<void>}
     */
    static async removeUser(userId) {
        try {
            await RedisClient.client.del(`${USER_PREFIX}${userId}`);
            await RedisClient.client.del(`${PRESENCE_PREFIX}${userId}`);
            await RedisClient.client.srem(ONLINE_USERS_SET, userId);
            logger.debug(`[UserCache] Removed user ${userId} from cache`);
        } catch (error) {
            logger.error(`[UserCache] Error removing user ${userId}:`, error);
        }
    }

    /**
     * Mark user as online
     * @param {string} userId 
     * @returns {Promise<void>}
     */
    static async markOnline(userId) {
        try {
            await RedisClient.client.set(
                `${PRESENCE_PREFIX}${userId}`,
                JSON.stringify({ lastHeartbeat: Date.now() }),
                'EX', PRESENCE_TTL
            );
            await RedisClient.client.sadd(ONLINE_USERS_SET, userId);
            logger.debug(`[UserCache] User ${userId} marked as online`);
        } catch (error) {
            logger.error(`[UserCache] Error marking user ${userId} online:`, error);
        }
    }

    /**
     * Update user presence (heartbeat)
     * @param {string} userId 
     * @returns {Promise<void>}
     */
    static async updatePresence(userId) {
        try {
            await RedisClient.client.set(
                `${PRESENCE_PREFIX}${userId}`,
                JSON.stringify({ lastHeartbeat: Date.now() }),
                'EX', PRESENCE_TTL
            );
            logger.debug(`[UserCache] User ${userId} presence updated`);
        } catch (error) {
            logger.error(`[UserCache] Error updating presence for ${userId}:`, error);
        }
    }

    /**
     * Mark user as offline
     * @param {string} userId 
     * @returns {Promise<void>}
     */
    static async markOffline(userId) {
        try {
            await RedisClient.client.srem(ONLINE_USERS_SET, userId);
            logger.debug(`[UserCache] User ${userId} marked as offline`);
        } catch (error) {
            logger.error(`[UserCache] Error marking user ${userId} offline:`, error);
        }
    }

    /**
     * Get all online users
     * @returns {Promise<Array<string>>}
     */
    static async getOnlineUsers() {
        try {
            return await RedisClient.client.smembers(ONLINE_USERS_SET);
        } catch (error) {
            logger.error(`[UserCache] Error getting online users:`, error);
            return [];
        }
    }

    /**
     * Check if user is online
     * @param {string} userId 
     * @returns {Promise<boolean>}
     */
    static async isOnline(userId) {
        try {
            // Check presence first (more accurate for real-time)
            const presence = await RedisClient.client.get(`${PRESENCE_PREFIX}${userId}`);
            if (presence) {
                return true;
            }
            // Fallback to set membership
            return await RedisClient.client.sismember(ONLINE_USERS_SET, userId);
        } catch (error) {
            logger.error(`[UserCache] Error checking if user ${userId} is online:`, error);
            return false;
        }
    }

    /**
     * Get user presence data
     * @param {string} userId 
     * @returns {Promise<object|null>}
     */
    static async getPresence(userId) {
        try {
            const presence = await RedisClient.client.get(`${PRESENCE_PREFIX}${userId}`);
            if (presence) {
                return JSON.parse(presence);
            }
            return null;
        } catch (error) {
            logger.error(`[UserCache] Error getting presence for ${userId}:`, error);
            return null;
        }
    }

    /**
     * Get user rank position
     * @param {string} userId 
     * @returns {Promise<number|null>}
     */
    static async getRankPosition(userId) {
        try {
            const user = await this.getUser(userId);
            if (!user) return null;

            // Get count of users with higher rank
            const rank = await RedisClient.client.zcount("rank:global", user.rankPoints + 1, "+inf");
            return rank + 1;
        } catch (error) {
            logger.error(`[UserCache] Error getting rank for user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Update user rank points in cache
     * @param {string} userId 
     * @param {number} newRankPoints 
     * @returns {Promise<void>}
     */
    static async updateRankPoints(userId, newRankPoints) {
        try {
            const cached = await RedisClient.client.get(`${USER_PREFIX}${userId}`);
            if (cached) {
                const userData = JSON.parse(cached);
                userData.rankPoints = newRankPoints;
                await RedisClient.client.set(
                    `${USER_PREFIX}${userId}`,
                    JSON.stringify(userData),
                    'EX', USER_TTL
                );
            }
        } catch (error) {
            logger.error(`[UserCache] Error updating rank for user ${userId}:`, error);
        }
    }

    /**
     * Warm up cache with all users
     * @returns {Promise<void>}
     */
    static async warmUp() {
        try {
            logger.info("[UserCache] Warming up user cache...");

            const PAGE_SIZE = 500;
            let skip = 0;
            let successCount = 0;
            let errorCount = 0;

            while (true) {
                const users = await Database.client.user.findMany({
                    skip,
                    take: PAGE_SIZE,
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        rankPoints: true,
                        profilePic: true,
                        wins: true,
                        losses: true,
                        cyberCores: true,
                        country: true,
                        region: true,
                        linkedin: true,
                        github: true,
                        leetcode: true,
                        codeforces: true,
                        hackerrank: true,
                        gfg: true,
                        twitter: true,
                        instagram: true
                    }
                });

                if (users.length === 0) break;

                for (const user of users) {
                    try {
                        await this.cacheUser(user);
                        successCount++;
                    } catch (err) {
                        errorCount++;
                        logger.debug(`[UserCache] Skipping user ${user.id} due to cache error`);
                    }
                }

                skip += PAGE_SIZE;
                if (users.length < PAGE_SIZE) break; // last page
            }

            logger.info(`[UserCache] Warm up complete: ${successCount} users cached${errorCount > 0 ? `, ${errorCount} skipped` : ''}`);
        } catch (error) {
            logger.error("[UserCache] Error warming up cache:", error);
        }
    }

    /**
     * Invalidate user profile cache
     * @param {string} userId 
     * @returns {Promise<void>}
     */
    static async invalidateUser(userId) {
        try {
            await RedisClient.client.del(`${USER_PREFIX}${userId}`);
            await RedisClient.client.del(`${PRESENCE_PREFIX}${userId}`);
            logger.debug(`[UserCache] Invalidated user ${userId} cache`);
        } catch (error) {
            logger.error(`[UserCache] Error invalidating user ${userId}:`, error);
        }
    }

    /**
     * Update user profile in cache
     * @param {object} user 
     * @returns {Promise<void>}
     */
    static async updateUserProfile(user) {
        try {
            await this.cacheUser(user);
            logger.debug(`[UserCache] Updated user profile ${user.id}`);
        } catch (error) {
            logger.error(`[UserCache] Error updating user profile ${user.id}:`, error);
        }
    }
}

export default UserCache;
