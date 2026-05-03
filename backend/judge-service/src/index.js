/**
 * Judge Service - Main Entry Point
 * 
 * Distributed code execution microservice
 * Listens to judge queue and processes code execution jobs
 */

import env from './config/env.js';
import logger from './utils/logger.js';
import server from './server.js';
import judgeQueue from './queue/judgeQueue.js';

// Error handlers
process.on('uncaughtException', (err) => {
    logger.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection:', reason);
    process.exit(1);
});

/**
 * Initialize and start the service
 */
async function start() {
    try {
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info(`🚀 Starting ${env.JUDGE_SERVICE_NAME}...`);
        logger.info('═══════════════════════════════════════════════════════════');

        // Initialize judge queue
        logger.info('[Init] Initializing judge queue...');
        await judgeQueue.initialize();
        logger.info('✅ [Init] Judge queue initialized');

        // Start Express server
        logger.info('[Init] Starting Express server...');
        server.start();
        logger.info('✅ [Init] Express server started');

        logger.info('═══════════════════════════════════════════════════════════');
        logger.info(`✅ ${env.JUDGE_SERVICE_NAME} is ready`);
        logger.info(`📊 Port: ${env.JUDGE_SERVICE_PORT}`);
        logger.info(`🔄 Pool Size: ${env.JUDGE_POOL_SIZE}`);
        logger.info('═══════════════════════════════════════════════════════════');

    } catch (error) {
        logger.error('❌ Failed to start service:', error);
        process.exit(1);
    }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
    logger.info('🛑 Shutting down service...');
    try {
        await server.stop();
        await judgeQueue.shutdown();
        logger.info('✅ Service shutdown complete');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the service
start();
