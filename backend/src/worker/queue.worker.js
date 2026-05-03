/**
 * Queue Worker Process
 * Phase 5: Separate process for handling distributed jobs
 * 
 * This is a standalone process that:
 * - Connects to Redis
 * - Processes jobs from the submission queue
 * - Emits events via the distributed event bus
 * - Can be scaled horizontally
 * 
 * Usage: node src/worker/queueWorker.js
 */

import 'dotenv/config';
import logger from '../core/logger/logger.js';
import submissionQueue from '../core/queue/submissionQueue.js';
import eventConsumer from '../core/events/eventConsumer.js';

/**
 * Initialize worker process
 */
async function initializeWorker() {
    try {
        logger.info('[QueueWorker] 🚀 Starting queue worker process...');

        // Initialize submission queue
        await submissionQueue.initialize();

        // Initialize event consumer
        await eventConsumer.initialize();

        logger.info('[QueueWorker] ✅ Queue worker initialized');

        // Print status
        printWorkerStatus();

        // Handle graceful shutdown
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error('[QueueWorker] ❌ Error initializing worker:', error);
        process.exit(1);
    }
}

/**
 * Print worker status
 */
function printWorkerStatus() {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 QUEUE WORKER STATUS');
    console.log('='.repeat(70));
    console.log(`Process ID: ${process.pid}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Redis URL: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
    console.log('='.repeat(70) + '\n');
}

/**
 * Graceful shutdown
 * @param {string} signal
 */
async function shutdown(signal) {
    logger.info(`[QueueWorker] 🛑 Received ${signal}, shutting down gracefully...`);

    try {
        // Shutdown submission queue
        await submissionQueue.shutdown();

        // Shutdown event consumer
        await eventConsumer.shutdown();

        logger.info('[QueueWorker] ✅ Queue worker shut down successfully');
        process.exit(0);
    } catch (error) {
        logger.error('[QueueWorker] ❌ Error during shutdown:', error);
        process.exit(1);
    }
}

/**
 * Monitor queue stats periodically
 */
async function monitorQueue() {
    setInterval(async () => {
        try {
            const stats = await submissionQueue.getStats();
            if (stats) {
                logger.info('[QueueWorker] 📊 Queue stats:', {
                    waiting: stats.jobCounts.waiting,
                    active: stats.jobCounts.active,
                    completed: stats.jobCounts.completed,
                    failed: stats.jobCounts.failed,
                    workers: stats.workers
                });
            }
        } catch (error) {
            logger.error('[QueueWorker] ❌ Error monitoring queue:', error);
        }
    }, 30000); // Every 30 seconds
}

/**
 * Start worker
 */
async function start() {
    try {
        await initializeWorker();
        await monitorQueue();

        logger.info('[QueueWorker] ✅ Queue worker is running and ready to process jobs');
    } catch (error) {
        logger.error('[QueueWorker] ❌ Fatal error:', error);
        process.exit(1);
    }
}

// Start the worker
start();
