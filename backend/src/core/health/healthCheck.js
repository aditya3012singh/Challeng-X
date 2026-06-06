import redisEventBus from '../events/redisEventBus.js';
import submissionQueue from '../queue/submissionQueue.js';
import Database from '../config/db.js';
import structuredLogger from '../logger/structuredLogger.js';

/**
 * Health Check Service
 * Phase 6: Monitor system health and dependencies
 * 
 * Features:
 * - Check Redis connection
 * - Check queue health
 * - Check database connection
 * - Check worker status
 * - Provide overall health status
 */
class HealthCheckService {
    constructor() {
        this.lastCheck = null;
        this.checkInterval = 30000; // 30 seconds
    }

    /**
     * Check Redis connection
     * @returns {Promise<object>}
     */
    async checkRedis() {
        try {
            const isHealthy = redisEventBus.isHealthy();
            const status = redisEventBus.getHealthStatus();

            return {
                status: isHealthy ? 'healthy' : 'unhealthy',
                connected: status.connected,
                subscribedChannels: status.subscribedChannels,
                idempotencyStoreSize: status.idempotencyStoreSize,
                deadLetterQueueSize: status.deadLetterQueueSize,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            structuredLogger.error('Redis health check failed', {
                error: error.message
            });
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Check queue health
     * @returns {Promise<object>}
     */
    async checkQueue() {
        try {
            const stats = await submissionQueue.getStats();

            if (!stats) {
                return {
                    status: 'unhealthy',
                    error: 'Queue not initialized',
                    timestamp: new Date().toISOString()
                };
            }

            const totalJobs = stats.jobCounts.waiting + stats.jobCounts.active + stats.jobCounts.completed + stats.jobCounts.failed;
            const failureRate = totalJobs > 0 ? (stats.jobCounts.failed / totalJobs * 100).toFixed(2) : 0;

            return {
                status: stats.jobCounts.failed > 10 ? 'degraded' : 'healthy',
                waiting: stats.jobCounts.waiting,
                active: stats.jobCounts.active,
                completed: stats.jobCounts.completed,
                failed: stats.jobCounts.failed,
                workers: stats.workers,
                failureRate: failureRate + '%',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            structuredLogger.error('Queue health check failed', {
                error: error.message
            });
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Check database connection
     * @returns {Promise<object>}
     */
    async checkDatabase() {
        try {
            // Try a simple query with timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database check timeout after 5s')), 5000)
            );
            
            const queryPromise = Database.client.user.count();
            
            await Promise.race([queryPromise, timeoutPromise]);

            return {
                status: 'healthy',
                connected: true,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            structuredLogger.error('Database health check failed', {
                error: error.message
            });
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get overall health status
     * @returns {Promise<object>}
     */
    async getHealthStatus() {
        try {
            // Add timeout to entire health check (15 seconds)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Health check timeout after 15s')), 15000)
            );
            
            const checksPromise = (async () => {
                const redisHealth = await this.checkRedis();
                const queueHealth = await this.checkQueue();
                const dbHealth = await this.checkDatabase();

                // Determine overall status
                let overallStatus = 'healthy';
                if (redisHealth.status === 'unhealthy' || queueHealth.status === 'unhealthy' || dbHealth.status === 'unhealthy') {
                    overallStatus = 'unhealthy';
                } else if (redisHealth.status === 'degraded' || queueHealth.status === 'degraded' || dbHealth.status === 'degraded') {
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
            structuredLogger.error('Health check failed', {
                error: error.message
            });
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get last health check
     * @returns {object}
     */
    getLastCheck() {
        return this.lastCheck;
    }
}

// Singleton instance
const healthCheckService = new HealthCheckService();

export default healthCheckService;
