/**
 * Judge Client Service
 * 
 * Client for communicating with the distributed Judge Service
 * Queues code execution jobs and listens for results
 */

import IORedis from 'ioredis';
import env from '../../core/config/env.js';
import logger from '../../core/logger/logger.js';
import structuredLogger from '../../core/logger/structuredLogger.js';
import metricsCollector from '../../core/metrics/metricsCollector.js';

const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 50, 2000),
};

const connection = env.REDIS_URL
    ? new IORedis(env.REDIS_URL, redisOptions)
    : new IORedis({
        ...redisOptions,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
    });

// Redis Publisher for queuing judge jobs
const publisher = env.REDIS_URL
    ? new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null })
    : new IORedis({
        ...redisOptions,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
    });

logger.info('[JudgeClient] Connected to Redis');

/**
 * Judge Client Service
 */
class JudgeClientService {
    constructor() {
        this.resultHandlers = new Map(); // submissionId -> handler
        this.isListening = false;
    }

    /**
     * Initialize the judge client
     * Starts listening for judge results
     */
    async initialize() {
        try {
            logger.info('[JudgeClient] Initializing judge client...');

            // Create subscriber for judge events
            const subscriber = env.REDIS_URL
                ? new IORedis(env.REDIS_URL, redisOptions)
                : new IORedis({
                    ...redisOptions,
                    host: env.REDIS_HOST,
                    port: env.REDIS_PORT,
                    password: env.REDIS_PASSWORD,
                });

            // Subscribe to judge events
            await subscriber.subscribe('judge_events');
            logger.info('[JudgeClient] Subscribed to judge_events channel');

            // Handle judge events
            subscriber.on('message', async (channel, message) => {
                if (channel === 'judge_events') {
                    try {
                        const event = JSON.parse(message);
                        await this.handleJudgeEvent(event);
                    } catch (error) {
                        logger.error('[JudgeClient] Error handling judge event:', error);
                    }
                }
            });

            this.isListening = true;
            logger.info('[JudgeClient] Judge client initialized successfully');
        } catch (error) {
            logger.error('[JudgeClient] Error initializing judge client:', error);
            throw error;
        }
    }

    /**
     * Queue a code execution job
     * @param {object} jobData - Job data
     */
    async queueCodeExecution(jobData) {
        try {
            const {
                submissionId,
                language,
                code,
                inputs,
                earlyExit = true,
                traceId,
                priority = 5,
            } = jobData;

            logger.info(`[JudgeClient] Queuing code execution for submission ${submissionId}`, {
                traceId,
                language,
                inputCount: inputs.length,
            });

            // Publish job to judge queue
            const jobMessage = {
                submissionId,
                language,
                code,
                inputs,
                earlyExit,
                traceId,
                priority,
                timestamp: new Date().toISOString(),
            };

            // Queue the job via Redis (judge service will pick it up)
            await publisher.lpush('judge:queue', JSON.stringify(jobMessage));

            // Log with structured logger
            structuredLogger.logJobQueued(traceId, submissionId, 'code-execution', {
                language,
                inputCount: inputs.length,
            });

            // Record metrics
            metricsCollector.recordJobQueued('code-execution');

            logger.info(`[JudgeClient] Code execution queued for submission ${submissionId}`);

            return {
                success: true,
                submissionId,
                traceId,
            };
        } catch (error) {
            logger.error('[JudgeClient] Error queuing code execution:', error);
            metricsCollector.recordJobFailed('code-execution');
            metricsCollector.recordError('JudgeQueueError');
            throw error;
        }
    }

    /**
     * Handle judge event
     * @param {object} event - Judge event
     */
    async handleJudgeEvent(event) {
        const { event: eventType, data } = event;
        const { submissionId, traceId } = data;

        logger.info(`[JudgeClient] Received judge event: ${eventType}`, {
            submissionId,
            traceId,
        });

        switch (eventType) {
            case 'judge_result':
                await this.handleJudgeResult(data);
                break;
            case 'judge_error':
                await this.handleJudgeError(data);
                break;
            case 'judge_progress':
                await this.handleJudgeProgress(data);
                break;
            default:
                logger.warn(`[JudgeClient] Unknown judge event type: ${eventType}`);
        }
    }

    /**
     * Handle judge result
     * @param {object} data - Result data
     */
    async handleJudgeResult(data) {
        const { submissionId, traceId, results, stopped_at, executionTimeMs, language } = data;

        logger.info(`[JudgeClient] Judge result received for submission ${submissionId}`, {
            traceId,
            stoppedAt: stopped_at,
            totalTests: results.length,
            executionTimeMs,
        });

        // Log with structured logger
        structuredLogger.logJobCompleted(traceId, submissionId, 'code-execution', executionTimeMs, {
            stoppedAt: stopped_at,
            totalTests: results.length,
            language,
        });

        // Record metrics
        metricsCollector.recordJobCompleted('code-execution', executionTimeMs);

        // Call registered handler if exists
        const handler = this.resultHandlers.get(submissionId);
        if (handler) {
            try {
                await handler({
                    success: true,
                    results,
                    stopped_at,
                    executionTimeMs,
                });
                this.resultHandlers.delete(submissionId);
            } catch (error) {
                logger.error(`[JudgeClient] Error in result handler for ${submissionId}:`, error);
            }
        }
    }

    /**
     * Handle judge error
     * @param {object} data - Error data
     */
    async handleJudgeError(data) {
        const { submissionId, traceId, error, executionTimeMs } = data;

        logger.error(`[JudgeClient] Judge error for submission ${submissionId}:`, error, {
            traceId,
            executionTimeMs,
        });

        // Log with structured logger
        structuredLogger.logJobFailed(traceId, submissionId, 'code-execution', error, {
            executionTimeMs,
        });

        // Record metrics
        metricsCollector.recordJobFailed('code-execution');
        metricsCollector.recordError('JudgeExecutionError');

        // Call registered handler if exists
        const handler = this.resultHandlers.get(submissionId);
        if (handler) {
            try {
                await handler({
                    success: false,
                    error,
                    executionTimeMs,
                });
                this.resultHandlers.delete(submissionId);
            } catch (error) {
                logger.error(`[JudgeClient] Error in error handler for ${submissionId}:`, error);
            }
        }
    }

    /**
     * Handle judge progress
     * @param {object} data - Progress data
     */
    async handleJudgeProgress(data) {
        const { submissionId, traceId, index, total, passed } = data;

        logger.debug(`[JudgeClient] Judge progress for submission ${submissionId}:`, {
            traceId,
            index,
            total,
            passed,
        });

        // Publish progress to Redis for real-time updates
        await publisher.publish('judge_progress', JSON.stringify({
            submissionId,
            traceId,
            index,
            total,
            passed,
            timestamp: new Date().toISOString(),
        })).catch((err) => logger.error('[JudgeClient] Error publishing progress:', err));
    }

    /**
     * Register result handler
     * @param {string} submissionId - Submission ID
     * @param {Function} handler - Result handler
     */
    registerResultHandler(submissionId, handler) {
        this.resultHandlers.set(submissionId, handler);
    }

    /**
     * Unregister result handler
     * @param {string} submissionId - Submission ID
     */
    unregisterResultHandler(submissionId) {
        this.resultHandlers.delete(submissionId);
    }

    /**
     * Get health status
     */
    async getHealth() {
        try {
            // Try to ping Redis
            await connection.ping();
            return {
                status: 'healthy',
                redis: 'connected',
                listening: this.isListening,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                redis: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
}

export default new JudgeClientService();
