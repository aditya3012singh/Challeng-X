/**
 * Judge Service Express Server
 * 
 * Provides health check and status endpoints
 */

import express from 'express';
import env from './config/env.js';
import logger from './utils/logger.js';
import JudgeService from './services/judge.service.js';
import judgeQueue from './queue/judgeQueue.js';

class JudgeServer {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`[Server] ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        /**
         * Health Check Endpoint
         * GET /health
         */
        this.app.get('/health', (req, res) => {
            try {
                const health = JudgeService.getHealth();
                res.status(200).json({
                    status: 'healthy',
                    service: env.JUDGE_SERVICE_NAME,
                    ...health,
                });
            } catch (error) {
                logger.error('[Server] Health check error:', error);
                res.status(500).json({
                    status: 'unhealthy',
                    error: error.message,
                });
            }
        });

        /**
         * Status Endpoint
         * GET /status
         */
        this.app.get('/status', async (req, res) => {
            try {
                const health = JudgeService.getHealth();
                const queueStats = await judgeQueue.getStats();

                res.status(200).json({
                    status: 'healthy',
                    service: env.JUDGE_SERVICE_NAME,
                    judge: health,
                    queue: queueStats,
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                logger.error('[Server] Status check error:', error);
                res.status(500).json({
                    status: 'error',
                    error: error.message,
                });
            }
        });

        /**
         * Root Endpoint
         * GET /
         */
        this.app.get('/', (req, res) => {
            res.status(200).json({
                service: env.JUDGE_SERVICE_NAME,
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    health: 'GET /health',
                    status: 'GET /status',
                },
            });
        });

        /**
         * 404 Handler
         */
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not Found',
                path: req.path,
            });
        });

        /**
         * Error Handler
         */
        this.app.use((err, req, res, next) => {
            logger.error('[Server] Error:', err);
            res.status(500).json({
                error: 'Internal Server Error',
                message: err.message,
            });
        });
    }

    /**
     * Start the server
     */
    start() {
        const port = env.JUDGE_SERVICE_PORT;
        this.server = this.app.listen(port, () => {
            logger.info(`[Server] Judge Service running on port ${port}`);
        });

        this.server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`[Server] Port ${port} is already in use`);
            } else {
                logger.error('[Server] Server error:', err);
            }
            process.exit(1);
        });
    }

    /**
     * Stop the server
     */
    async stop() {
        logger.info('[Server] Stopping server...');
        if (this.server) {
            this.server.close();
        }
    }
}

export default new JudgeServer();
