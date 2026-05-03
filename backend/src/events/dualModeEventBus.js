import eventBus from './eventBus.js';
import redisEventBus from './redisEventBus.js';
import logger from '../utils/logger.js';
import structuredLogger from '../utils/structuredLogger.js';
import metricsCollector from '../utils/metricsCollector.js';

/**
 * Dual Mode Event Bus
 * Phase 5: Hybrid local + distributed event system
 * 
 * Features:
 * - Emits to both local and Redis event buses
 * - Subscribes to both local and Redis events
 * - Graceful fallback if Redis is unavailable
 * - Unified interface for event operations
 */
class DualModeEventBus {
    constructor() {
        this.localBus = eventBus;
        this.distributedBus = redisEventBus;
        this.mode = 'dual'; // 'local', 'distributed', or 'dual'
        this.isRedisEnabled = process.env.REDIS_ENABLED !== 'false';
    }

    /**
     * Initialize dual mode event bus
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            logger.info('[DualModeEventBus] 🚀 Initializing dual mode event bus...');

            if (this.isRedisEnabled) {
                const connected = await this.distributedBus.connect();
                if (connected) {
                    this.mode = 'dual';
                    logger.info('[DualModeEventBus] ✅ Dual mode enabled (local + Redis)');
                } else {
                    this.mode = 'local';
                    logger.warn('[DualModeEventBus] ⚠️ Redis unavailable, falling back to local mode');
                }
            } else {
                this.mode = 'local';
                logger.info('[DualModeEventBus] ℹ️ Redis disabled, using local mode only');
            }
        } catch (error) {
            logger.error('[DualModeEventBus] ❌ Error initializing dual mode:', error);
            this.mode = 'local';
        }
    }

    /**
     * Emit event to both local and Redis buses
     * @param {string} eventName
     * @param {object} payload
     * @param {string} eventId
     */
    async emitEvent(eventName, payload, eventId) {
        try {
            const startTime = Date.now();

            // Always emit to local bus
            this.localBus.emitEvent(eventName, payload);

            // Log event emission with structured logger
            structuredLogger.logEventEmitted(eventId, eventName, eventId, {
                mode: this.mode,
                buses: ['local', this.mode === 'dual' ? 'redis' : 'none']
            });

            // Record metrics
            metricsCollector.recordEventEmitted(eventName);

            // Emit to Redis if available
            if (this.mode === 'dual' && this.distributedBus.isHealthy()) {
                await this.distributedBus.publish(eventName, payload, eventId);
            }

            const duration = Date.now() - startTime;
            structuredLogger.logMetric(eventId, 'event_emission_time', duration, 'ms', {
                eventName,
                mode: this.mode
            });
        } catch (error) {
            logger.error('[DualModeEventBus] ❌ Error emitting event:', error);
            structuredLogger.logError(eventId, 'Error emitting event', error, {
                eventName,
                mode: this.mode
            });
            metricsCollector.recordError('EventEmissionError');
        }
    }

    /**
     * Register listener for both local and Redis events
     * @param {string} eventName
     * @param {Function} handler
     */
    async onEvent(eventName, handler) {
        try {
            // Always register to local bus
            this.localBus.onEvent(eventName, handler);

            // Register to Redis if available
            if (this.mode === 'dual' && this.distributedBus.isHealthy()) {
                await this.distributedBus.subscribe(eventName, handler);
            }

            logger.info(`[DualModeEventBus] ✅ Listener registered: ${eventName} (mode: ${this.mode})`);
        } catch (error) {
            logger.error('[DualModeEventBus] ❌ Error registering listener:', error);
            structuredLogger.logError('unknown', `Error registering listener: ${eventName}`, error, {
                eventName,
                mode: this.mode
            });
            metricsCollector.recordError('ListenerRegistrationError');
        }
    }

    /**
     * Get metrics from both buses
     * @returns {object}
     */
    getMetrics() {
        const localMetrics = this.localBus.getMetrics();
        const redisHealth = this.distributedBus.getHealthStatus();

        return {
            mode: this.mode,
            local: localMetrics,
            redis: redisHealth,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Print metrics summary
     */
    printMetricsSummary() {
        const metrics = this.getMetrics();

        console.log('\n' + '='.repeat(70));
        console.log('📊 DUAL MODE EVENT BUS METRICS');
        console.log('='.repeat(70));
        console.log(`Mode: ${metrics.mode.toUpperCase()}`);
        console.log(`Timestamp: ${metrics.timestamp}`);

        console.log('\n📍 LOCAL EVENT BUS:');
        console.log(`  Total Events Emitted: ${metrics.local.summary.totalEventsEmitted}`);
        console.log(`  Total Listener Executions: ${metrics.local.summary.totalListenerExecutions}`);
        console.log(`  Failed Executions: ${metrics.local.summary.failedListenerExecutions}`);
        console.log(`  Success Rate: ${metrics.local.summary.successRate}`);

        if (metrics.mode === 'dual') {
            console.log('\n🌐 REDIS EVENT BUS:');
            console.log(`  Connected: ${metrics.redis.connected ? '✅' : '❌'}`);
            console.log(`  Subscribed Channels: ${metrics.redis.subscribedChannels}`);
            console.log(`  Idempotency Store Size: ${metrics.redis.idempotencyStoreSize}`);
            console.log(`  Dead Letter Queue Size: ${metrics.redis.deadLetterQueueSize}`);
        }

        console.log('='.repeat(70) + '\n');
    }

    /**
     * Get dead letter queue
     * @returns {Array}
     */
    getDeadLetterQueue() {
        return this.distributedBus.getDeadLetterQueue();
    }

    /**
     * Retry dead letter event
     * @param {number} index
     * @returns {Promise<boolean>}
     */
    async retryDeadLetter(index) {
        return this.distributedBus.retryDeadLetter(index);
    }

    /**
     * Clear dead letter queue
     */
    clearDeadLetterQueue() {
        this.distributedBus.clearDeadLetterQueue();
    }

    /**
     * Get health status
     * @returns {object}
     */
    getHealthStatus() {
        return {
            mode: this.mode,
            local: {
                healthy: true
            },
            redis: this.distributedBus.getHealthStatus(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Shutdown dual mode event bus
     * @returns {Promise<void>}
     */
    async shutdown() {
        try {
            logger.info('[DualModeEventBus] 🛑 Shutting down dual mode event bus...');
            
            if (this.mode === 'dual') {
                await this.distributedBus.disconnect();
            }
            
            logger.info('[DualModeEventBus] ✅ Dual mode event bus shut down');
        } catch (error) {
            logger.error('[DualModeEventBus] ❌ Error shutting down:', error);
        }
    }
}

// Singleton instance
const dualModeEventBus = new DualModeEventBus();

export default dualModeEventBus;
