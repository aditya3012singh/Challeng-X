import { Queue, Worker } from 'bullmq';
import logger from '../logger/logger.js';
import dualModeEventBus from '../events/dualModeEventBus.js';
import { EventTypes } from '../events/eventTypes.js';
import structuredLogger from '../logger/structuredLogger.js';
import metricsCollector from '../metrics/metricsCollector.js';

/**
 * Submission Queue - BullMQ based job processing
 * Phase 5: Distributed job queue for code execution
 * 
 * Features:
 * - Distributed job processing
 * - Automatic retries with exponential backoff
 * - Job persistence
 * - Dead letter queue for failed jobs
 * - Horizontal scaling support
 */
class SubmissionQueue {
    constructor() {
        this.queue = null;
        this.worker = null;
        this.isInitialized = false;
        this.redisConnection = {
            host: process.env.REDIS_HOST || 'localhost', 
            port: process.env.REDIS_PORT || 6379
        };
    }




    /**
     * Initialize submission queue
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            logger.info('[SubmissionQueue]  Initializing submission queue...');

            // Create queue
            this.queue = new Queue('submissions', {
                connection: this.redisConnection,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000
                    },
                    removeOnComplete: true,
                    removeOnFail: false
                }
            });

            // Create worker
            this.worker = new Worker('submissions', this.processSubmission.bind(this), {
                connection: this.redisConnection,
                concurrency: 5 // Process 5 jobs concurrently
            });

            // Handle worker events
            this.worker.on('completed', (job) => {
                logger.info('[SubmissionQueue] ✅ Job completed:', {
                    jobId: job.id,
                    jobName: job.name,
                    duration: job.finishedOn - job.processedOn
                });
            });

            this.worker.on('failed', (job, error) => {
                logger.error('[SubmissionQueue] ❌ Job failed:', {
                    jobId: job.id,
                    jobName: job.name,
                    error: error.message,
                    attempts: job.attemptsMade
                });
            });

            this.worker.on('error', (error) => {
                logger.error('[SubmissionQueue] ❌ Worker error:', error);
            });

            this.isInitialized = true;
            logger.info('[SubmissionQueue] ✅ Submission queue initialized');
        } catch (error) {
            logger.error('[SubmissionQueue] ❌ Error initializing queue:', error);
            throw error;
        }
    }

    /**
     * Add submission job to queue
     * @param {object} submissionData
     * @returns {Promise<object>}
     */
    async addSubmission(submissionData) {
        if (!this.isInitialized) {
            throw new Error('Submission queue not initialized');
        }

        try {
            const jobId = submissionData.submissionId;
            const traceId = submissionData.traceId || `trace_${jobId}`;

            const job = await this.queue.add('process-submission', submissionData, {
                jobId: jobId,
                priority: submissionData.priority || 5
            });

            // Log job queued with structured logger
            structuredLogger.logJobQueued(traceId, job.id, 'process-submission', {
                submissionId: submissionData.submissionId,
                userId: submissionData.userId,
                problemId: submissionData.problemId
            });

            // Record metrics
            metricsCollector.recordJobQueued('process-submission');

            logger.info('[SubmissionQueue] 📥 Submission added to queue:', {
                jobId: job.id,
                submissionId: submissionData.submissionId,
                userId: submissionData.userId
            });

            return job;
        } catch (error) {
            logger.error('[SubmissionQueue] ❌ Error adding submission to queue:', error);
            metricsCollector.recordJobFailed('process-submission');
            metricsCollector.recordError('SubmissionQueueError');
            throw error;
        }
    }

    /**
     * Process submission job
     * @param {object} job
     * @returns {Promise<object>}
     */
    async processSubmission(job) {
        const { submissionId, userId, problemId, code, language, type, context, traceId } = job.data;
        const startTime = Date.now();
        const jobTraceId = traceId || `trace_${submissionId}`;

        try {
            // Log job started with structured logger
            structuredLogger.logJobStarted(jobTraceId, job.id, 'process-submission', {
                submissionId,
                userId,
                problemId
            });

            logger.info('[SubmissionQueue] 🔄 Processing submission:', {
                jobId: job.id,
                submissionId,
                userId,
                problemId
            });

            // Emit submission started event
            await dualModeEventBus.emitEvent(EventTypes.SUBMISSION_ATTEMPTED, {
                submissionId,
                userId,
                problemId,
                type,
                traceId: jobTraceId,
                timestamp: new Date()
            }, `evt_${submissionId}_started`);

            // TODO: Implement actual code execution logic
            // This would call the judge service or code executor
            const result = await this.executeSubmission({
                submissionId,
                userId,
                problemId,
                code,
                language,
                type,
                context,
                traceId: jobTraceId
            });

            // Emit submission completed event
            await dualModeEventBus.emitEvent(EventTypes.SUBMISSION_COMPLETED, {
                submissionId,
                userId,
                problemId,
                status: result.status,
                executionTimeMs: result.executionTimeMs,
                passedTests: result.passedTests,
                totalTests: result.totalTests,
                type,
                context,
                testCaseResults: result.testCaseResults,
                failureDetails: result.failureDetails,
                traceId: jobTraceId,
                timestamp: new Date()
            }, `evt_${submissionId}_completed`);

            const duration = Date.now() - startTime;

            // Log job completed with structured logger
            structuredLogger.logJobCompleted(jobTraceId, job.id, 'process-submission', duration, {
                submissionId,
                status: result.status
            });

            // Record metrics
            metricsCollector.recordJobCompleted('process-submission', duration);

            logger.info('[SubmissionQueue] ✅ Submission processed:', {
                jobId: job.id,
                submissionId,
                status: result.status,
                duration
            });

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error('[SubmissionQueue] ❌ Error processing submission:', error);

            // Log job failed with structured logger
            structuredLogger.logJobFailed(jobTraceId, job.id, 'process-submission', error.message, {
                submissionId,
                userId,
                problemId
            });

            // Record metrics
            metricsCollector.recordJobFailed('process-submission');
            metricsCollector.recordError('SubmissionProcessingError');

            // Emit submission failed event
            await dualModeEventBus.emitEvent(EventTypes.SUBMISSION_FINALIZED, {
                submissionId,
                userId,
                problemId,
                status: 'ERROR',
                traceId: jobTraceId,
                error: error.message,
                type,
                context,
                timestamp: new Date()
            }, `evt_${submissionId}_failed`);

            throw error;
        }
    }

    /**
     * Execute submission (placeholder for actual execution logic)
     * @param {object} submissionData
     * @returns {Promise<object>}
     */
    async executeSubmission(submissionData) {
        // TODO: Implement actual code execution
        // This would integrate with the judge service
        return {
            status: 'PASSED',
            executionTimeMs: 150,
            passedTests: 10,
            totalTests: 10,
            testCaseResults: [],
            failureDetails: null
        };
    }

    /**
     * Get queue stats
     * @returns {Promise<object>}
     */
    async getStats() {
        if (!this.isInitialized) {
            return null;
        }

        try {
            const counts = await this.queue.getJobCounts();
            const workers = await this.queue.getWorkers();

            return {
                queue: 'submissions',
                jobCounts: counts,
                workers: workers.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('[SubmissionQueue] ❌ Error getting queue stats:', error);
            return null;
        }
    }

    /**
     * Get failed jobs
     * @param {number} start
     * @param {number} end
     * @returns {Promise<Array>}
     */
    async getFailedJobs(start = 0, end = 10) {
        if (!this.isInitialized) {
            return [];
        }

        try {
            return await this.queue.getFailed(start, end);
        } catch (error) {
            logger.error('[SubmissionQueue] ❌ Error getting failed jobs:', error);
            return [];
        }
    }

    /**
     * Retry failed job
     * @param {string} jobId
     * @returns {Promise<boolean>}
     */
    async retryFailedJob(jobId) {
        if (!this.isInitialized) {
            return false;
        }

        try {
            const job = await this.queue.getJob(jobId);
            if (!job) {
                logger.error('[SubmissionQueue] ❌ Job not found:', jobId);
                return false;
            }

            await job.retry();
            logger.info('[SubmissionQueue] 🔄 Job retried:', jobId);
            return true;
        } catch (error) {
            logger.error('[SubmissionQueue] ❌ Error retrying job:', error);
            return false;
        }
    }

    /**
     * Clear queue
     * @returns {Promise<void>}
     */
    async clear() {
        if (!this.isInitialized) {
            return;
        }

        try {
            await this.queue.clean(0, 'completed');
            await this.queue.clean(0, 'failed');
            logger.info('[SubmissionQueue] 🔄 Queue cleared');
        } catch (error) {
            logger.error('[SubmissionQueue] ❌ Error clearing queue:', error);
        }
    }

    /**
     * Shutdown queue
     * @returns {Promise<void>}
     */
    async shutdown() {
        try {
            logger.info('[SubmissionQueue] 🛑 Shutting down submission queue...');

            if (this.worker) {
                await this.worker.close();
            }

            if (this.queue) {
                await this.queue.close();
            }

            this.isInitialized = false;
            logger.info('[SubmissionQueue] ✅ Submission queue shut down');
        } catch (error) {
            logger.error('[SubmissionQueue] ❌ Error shutting down queue:', error);
        }
    }
}

// Singleton instance
const submissionQueue = new SubmissionQueue();

export default submissionQueue;
