import ServerApp from "./server.js";
import { registerAllListeners } from "./core/events/listeners/index.js";
import eventConsumer from "./core/events/eventConsumer.js";
import logger from "./core/logger/logger.js";
import healthCheckService from "./core/health/healthCheck.js";

// ✅ PHASE 1: Register all event listeners BEFORE starting server
try {
    registerAllListeners();
    logger.info('✅ [Phase 1] Event bus initialized successfully');
} catch (error) {
    logger.error('❌ [Phase 1] Failed to initialize event bus:', error);
    process.exit(1);
}

// ✅ PHASE 5: Initialize dual mode event bus (local + Redis)
async function initializePhase5() {
    try {
        logger.info('[Phase 5] Starting initialization...');
        await eventConsumer.initialize();
        logger.info('✅ [Phase 5] Dual mode event bus initialized successfully');
        eventConsumer.printStatus();
    } catch (error) {
        logger.error('❌ [Phase 5] Failed to initialize dual mode event bus:', error);
        logger.warn('⚠️ [Phase 5] Falling back to local event bus only');
    }
}

// ✅ PHASE 6: Initialize health check service
// Runs AFTER the server starts so the queue and Redis are fully ready
async function initializePhase6() {
    try {
        logger.info('[Phase 6] Starting initialization...');
        const health = await healthCheckService.getHealthStatus();
        logger.info('✅ [Phase 6] Health check service initialized successfully');
        logger.info(`📊 [Phase 6] Initial health status: ${health.status}`);

        if (health.status !== 'healthy') {
            // Log each individual check result so we know exactly what failed
            if (health.checks) {
                Object.entries(health.checks).forEach(([name, check]) => {
                    if (check.status !== 'healthy') {
                        logger.warn(`⚠️ [Phase 6] ${name}: ${check.status} — ${check.error || JSON.stringify(check)}`);
                    } else {
                        logger.info(`✅ [Phase 6] ${name}: healthy`);
                    }
                });
            } else {
                logger.warn(`⚠️ [Phase 6] System health is ${health.status}: ${health.error || 'unknown'}`);
            }
        }
    } catch (error) {
        logger.error('❌ [Phase 6] Failed to initialize health check service:', error);
        logger.warn('⚠️ [Phase 6] Continuing without health checks');
    }
}

// Initialize Phase 5 before starting server
logger.info('[Startup] Initializing Phase 5...');
await initializePhase5();

// Start server first — queue and caches initialize inside ServerApp.start()
logger.info('[Startup] Starting server...');
ServerApp.start();

// Phase 6 health check runs after full startup (cache warmup ~12s + queue init)
// We use a generous delay to ensure everything is initialized
setTimeout(() => {
    logger.info('[Startup] Initializing Phase 6...');
    initializePhase6();
}, 15000);
