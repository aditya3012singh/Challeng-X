import RedisClient from '../cache/redis.client.js';
import { submissionQueue } from '../queue/submission.queue.js';
import Database from '../config/db.js';
import structuredLogger from '../logger/structuredLogger.js';

/**
 * Health Check Service
 * Checks Redis, BullMQ queue, and Database connectivity.
 * 
 * Severity levels:
 *  - healthy:   all checks pass
 *  - degraded:  non-critical checks warn (e.g. high failure rate)
 *  - unhealthy: critical check failed (Redis or DB down)
 * 
 * NOTE: Queue being "not initialized" is NOT unhealthy — the worker
 * is a separate process. Queue check reports degraded if it can't
 * reach Redis, not unhealthy.
 */
class HealthCheckService {
    constructor() {
        this.lastCheck = null;
    }

    /**
     * Check Redis connection by pinging the actual Redis client
     */
    async checkRedis() {
        try {
            const pong = await RedisClient.client.ping();
            return {
                status: pong === 'PONG' ? 'healthy' : 'unhealthy',
                connected: pong === 'PONG',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            structuredLogger.error('Redis health check failed', { error: error.message });
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Check BullMQ submission queue health.
     * Uses the real submission.queue.js (same queue the worker processes).
     * Queue being unreachable = degraded (not unhealthy) since worker is separate.
     */
    async checkQueue() {
        try {
            const counts = await submissionQueue.getJobCounts(
                'waiting', 'active', 'completed', 'failed', 'delayed'
            );

            const failed = counts.failed || 0;
            const waiting = counts.waiting || 0;
            const active = counts.active || 0;

            // High failure rate = degraded, not unhealthy
            const status = failed > 10 ? 'degraded' : 'healthy';

            return {
                status,
                waiting,
                active,
                completed: counts.completed || 0,
                failed,
                delayed: counts.delayed || 0,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            // Queue unreachable = degraded (worker may not be running, that's OK)
            structuredLogger.error('Queue health check failed', { error: error.message });
            return {
                status: 'degraded',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Check database connection with a 5s timeout
     */
    async checkDatabase() {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database check timeout after 5s')), 5000)
            );

            await Promise.race([
                Database.client.$queryRaw`SELECT 1`,
                timeoutPromise
            ]);

            return {
                status: 'healthy',
                connected: true,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            structuredLogger.error('Database health check failed', { error: error.message });
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get overall health status.
     * 
     * unhealthy  = Redis OR Database is down
     * degraded   = queue has high failure rate or is unreachable
     * healthy    = everything OK
     */
    async getHealthStatus() {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Health check timeout after 15s')), 15000)
            );

            const checksPromise = (async () => {
                const [redisHealth, queueHealth, dbHealth] = await Promise.all([
                    this.checkRedis(),
                    this.checkQueue(),
                    this.checkDatabase()
                ]);

                // Only Redis and DB failures make system "unhealthy"
                // Queue degraded = operational but with issues
                let overallStatus = 'healthy';
                if (redisHealth.status === 'unhealthy' || dbHealth.status === 'unhealthy') {
                    overallStatus = 'unhealthy';
                } else if (
                    redisHealth.status === 'degraded' ||
                    queueHealth.status === 'degraded' ||
                    dbHealth.status === 'degraded'
                ) {
                    overallStatus = 'degraded';
                }

                const health = {
                    status: overallStatus,
                    timestamp: new Date().toISOString(),
                    checks: {
                        redis: redisHealth,
                        queue: queueHealth,
                        database: dbHealth
                    }
                };

                this.lastCheck = health;
                return health;
            })();

            return await Promise.race([checksPromise, timeoutPromise]);
        } catch (error) {
            structuredLogger.error('Health check failed', { error: error.message });
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString(),
                checks: {}
            };
        }
    }

    getLastCheck() {
        return this.lastCheck;
    }
}

const healthCheckService = new HealthCheckService();
export default healthCheckService;
