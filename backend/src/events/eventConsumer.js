import dualModeEventBus from './dualModeEventBus.js';
import logger from '../utils/logger.js';

/**
 * Event Consumer
 * Phase 5: Unified event consumption from both local and distributed buses
 * 
 * Responsibilities:
 * - Register all event listeners
 * - Handle both local and distributed events
 * - Ensure idempotency
 * - Manage error handling
 */
class EventConsumer {
    constructor() {
        this.isInitialized = false;
        this.listeners = new Map();
    }

    /**
     * Initialize event consumer
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            logger.info('[EventConsumer] 🚀 Initializing event consumer...');

            // Initialize dual mode event bus
            await dualModeEventBus.initialize();

            this.isInitialized = true;
            logger.info('[EventConsumer] ✅ Event consumer initialized');
        } catch (error) {
            logger.error('[EventConsumer] ❌ Error initializing event consumer:', error);
            throw error;
        }
    }

    /**
     * Register event listener
     * @param {string} eventName
     * @param {Function} handler
     * @returns {Promise<void>}
     */
    async registerListener(eventName, handler) {
        if (!this.isInitialized) {
            throw new Error('Event consumer not initialized');
        }

        try {
            // Register to dual mode event bus
            await dualModeEventBus.onEvent(eventName, handler);

            // Store listener reference
            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, []);
            }
            this.listeners.get(eventName).push(handler);

            logger.info('[EventConsumer] 📥 Listener registered:', {
                eventName,
                handlerName: handler.name || 'anonymous'
            });
        } catch (error) {
            logger.error('[EventConsumer] ❌ Error registering listener:', error);
            throw error;
        }
    }

    /**
     * Register multiple listeners
     * @param {Array} listenerConfigs
     * @returns {Promise<void>}
     */
    async registerListeners(listenerConfigs) {
        try {
            logger.info('[EventConsumer] 📥 Registering multiple listeners...');

            for (const config of listenerConfigs) {
                await this.registerListener(config.eventName, config.handler);
            }

            logger.info('[EventConsumer] ✅ All listeners registered');
        } catch (error) {
            logger.error('[EventConsumer] ❌ Error registering listeners:', error);
            throw error;
        }
    }

    /**
     * Get registered listeners
     * @returns {Map}
     */
    getListeners() {
        return this.listeners;
    }

    /**
     * Get listener count
     * @returns {number}
     */
    getListenerCount() {
        let count = 0;
        for (const handlers of this.listeners.values()) {
            count += handlers.length;
        }
        return count;
    }

    /**
     * Print consumer status
     */
    printStatus() {
        const health = dualModeEventBus.getHealthStatus();

        console.log('\n' + '='.repeat(70));
        console.log('📊 EVENT CONSUMER STATUS');
        console.log('='.repeat(70));
        console.log(`Mode: ${health.mode.toUpperCase()}`);
        console.log(`Initialized: ${this.isInitialized ? '✅' : '❌'}`);
        console.log(`Registered Listeners: ${this.getListenerCount()}`);
        console.log(`Subscribed Events: ${this.listeners.size}`);

        if (health.mode === 'dual') {
            console.log(`\nRedis Connected: ${health.redis.connected ? '✅' : '❌'}`);
            console.log(`Redis Subscribed Channels: ${health.redis.subscribedChannels}`);
            console.log(`Dead Letter Queue Size: ${health.redis.deadLetterQueueSize}`);
        }

        console.log('='.repeat(70) + '\n');
    }

    /**
     * Shutdown event consumer
     * @returns {Promise<void>}
     */
    async shutdown() {
        try {
            logger.info('[EventConsumer] 🛑 Shutting down event consumer...');

            await dualModeEventBus.shutdown();

            this.isInitialized = false;
            logger.info('[EventConsumer] ✅ Event consumer shut down');
        } catch (error) {
            logger.error('[EventConsumer] ❌ Error shutting down event consumer:', error);
        }
    }
}

// Singleton instance
const eventConsumer = new EventConsumer();

export default eventConsumer;
