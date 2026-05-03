/**
 * Judge Queue - BullMQ Queue for Code Execution Jobs
 * 
 * Listens to submission queue and processes code execution
 * Emits results back via Redis events
 */

import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import JudgeService from '../services/judge.service.js';

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

// Redis Publisher for emitting results
const publisher = env.REDIS_URL
    ? new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null })
    : new IORedis({
        ...redisOptions,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
    });

logger.info('[JudgeQueue] Connected to Redis');

/**
 * Judge Queue - Processes code execution jobs
 */
class JudgeQueue {
    constructor() {
        this.queue = null;
        this.worker = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the judge queue
     */
    async initialize() {
        try {
            logger.info('[JudgeQueue] Initializing judge queue...');

            // Create queue
            this.queue = new Queue('judgeQueue', {
                connection,
                defaultJobOptions: {
                    attempts: 1, // No retries for judge jobs
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            });

            // Create worker
            this.worker = new Worker('judgeQueue', this.processJob.bind(this), {
                connection,
                concurrency: env.JUDGE_POOL_SIZE,
            });

            // Event handlers
            this.worker.on('completed', (job) => {
                logger.info(`[JudgeQueue] Job ${job.id} completed`);
            });

            this.worker.on('failed', (job, err) => {
                logger.error(`[JudgeQueue] Job ${job.id} failed:`, err.message);
            });

            this.worker.on('error', (err) => {
                logger.error('[JudgeQueue] Worker error:', err);
            });

            this.isInitialized = true;
            logger.info('[JudgeQueue] Judge queue initialized successfully');
        } catch (error) {
            logger.error('[JudgeQueue] Error initializing queue:', error);
            throw error;
        }
    }

    /**
     * Process a judge job
     * @param {Job} job - BullMQ job
     */
    async processJob(job) {
        const {
            submissionId,
            language,
            code,
            inputs,
            earlyExit = true,
            traceId,
        } = job.data;

        const startTime = Date.now();

        try {
            logger.info(`[JudgeQueue] Processing job ${job.id} for submission ${submissionId}`, {
                traceId,
                language,
                inputCount: inputs.length,
            });

            // Execute code
            const { results, stopped_at } = await JudgeService.runTestCases(
                language,
                code,
                inputs,
                earlyExit,
                (progress) => {
                    // Update job progress
                    job.updateProgress(Math.floor((progress.index / inputs.length) * 100)).catch(() => {});

                    // Emit progress event
                    publisher.publish('judge_events', JSON.stringify({
                        event: 'judge_progress',
                        data: {
                            submissionId,
                            traceId,
                            index: progress.index,
                            total: inputs.length,
                            passed: progress.passed,
                        },
                    })).catch((err) => logger.error('[JudgeQueue] Error publishing progress:', err));
                }
            );

            const duration = Date.now() - startTime;

            logger.info(`[JudgeQueue] Job ${job.id} execution completed`, {
                traceId,
                submissionId,
                duration,
                stoppedAt: stopped_at,
                totalTests: inputs.length,
            });

            // Emit result event
            const resultEvent = {
                event: 'judge_result',
                data: {
                    submissionId,
                    traceId,
                    results,
                    stopped_at,
                    executionTimeMs: duration,
                    language,
                    timestamp: new Date().toISOString(),
                },
            };

            await publisher.publish('judge_events', JSON.stringify(resultEvent));
            logger.info(`[JudgeQueue] Result event published for submission ${submissionId}`);

            return {
                success: true,
                submissionId,
                results,
                stopped_at,
                executionTimeMs: duration,
            };
        } catch (error) {
            logger.error(`[JudgeQueue] Error processing job ${job.id}:`, error);

            const duration = Date.now() - startTime;

            // Emit error event
            const errorEvent = {
                event: 'judge_error',
                data: {
                    submissionId,
                    traceId,
                    error: error.message,
                    executionTimeMs: duration,
                    timestamp: new Date().toISOString(),
                },
            };

            await publisher.publish('judge_events', JSON.stringify(errorEvent));

            throw error;
        }
    }

    /**
     * Queue a judge job
     * @param {object} jobData - Job data
     */
    async queueJob(jobData) {
        if (!this.isInitialized) {
            throw new Error('Judge queue not initialized');
        }

        try {
            const job = await this.queue.add('execute-code', jobData, {
                jobId: jobData.submissionId,
                priority: jobData.priority || 5,
            });

            logger.info(`[JudgeQueue] Job queued for submission ${jobData.submissionId}`, {
                jobId: job.id,
                traceId: jobData.traceId,
            });

            return job;
        } catch (error) {
            logger.error('[JudgeQueue] Error queuing job:', error);
            throw error;
        }
    }

    /**
     * Get queue stats
     */
    async getStats() {
        if (!this.queue) return null;

        const counts = await this.queue.getJobCounts();
        return {
            waiting: counts.waiting,
            active: counts.active,
            completed: counts.completed,
            failed: counts.failed,
            delayed: counts.delayed,
        };
    }

    /**
     * Shutdown the queue
     */
    async shutdown() {
        logger.info('[JudgeQueue] Shutting down judge queue...');
        if (this.worker) {
            await this.worker.close();
        }
        if (this.queue) {
            await this.queue.close();
        }
        await connection.quit();
        await publisher.quit();
        logger.info('[JudgeQueue] Judge queue shutdown complete');
    }
}

export default new JudgeQueue();
