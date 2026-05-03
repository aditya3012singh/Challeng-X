import EventEmitter from 'events';
import logger from '../utils/logger.js';

/**
 * Domain Event Bus
 * Handles event emission and subscription for cross-module communication
 */
class DomainEventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50); // Increase for multiple listeners per event
    }

    /**
     * Emit domain event
     * @param {string} eventName - Event name (e.g., 'BattleFinished')
     * @param {object} payload - Event data
     */
    emitEvent(eventName, payload) {
        logger.info(`[EventBus] 📤 Emitting: ${eventName}`, { 
            eventName,
            payloadKeys: Object.keys(payload || {})
        });
        
        this.emit(eventName, {
            eventName,
            payload,
            timestamp: new Date(),
            eventId: this.generateEventId()
        });
    }

    /**
     * Emit and wait for synchronous response (for validation events)
     * @param {string} eventName
     * @param {object} payload
     * @returns {Promise<any>}
     */
    async emitAndWait(eventName, payload) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Event ${eventName} timed out after 5000ms`));
            }, 5000);

            const listeners = this.listeners(eventName);
            
            if (listeners.length === 0) {
                clearTimeout(timeout);
                logger.warn(`[EventBus] ⚠️  No listeners for: ${eventName} - allowing by default`);
                resolve({ allowed: true });
                return;
            }

            // Call first listener and wait for response
            const handler = listeners[0];
            Promise.resolve(handler({ eventName, payload, timestamp: new Date() }))
                .then(result => {
                    clearTimeout(timeout);
                    logger.info(`[EventBus] ✅ ${eventName} validation result:`, result);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeout);
                    logger.error(`[EventBus] ❌ ${eventName} validation error:`, error);
                    reject(error);
                });
        });
    }

    /**
     * Register event listener
     * @param {string} eventName
     * @param {Function} handler
     */
    onEvent(eventName, handler) {
        logger.info(`[EventBus] 📥 Registering listener for: ${eventName}`);
        
        this.on(eventName, async (event) => {
            try {
                logger.info(`[EventBus] 🔔 Processing: ${eventName}`);
                await handler(event.payload);
                logger.info(`[EventBus] ✅ Completed: ${eventName}`);
            } catch (error) {
                logger.error(`[EventBus] ❌ Error in ${eventName} handler:`, error);
            }
        });
    }

    /**
     * Generate unique event ID
     * @returns {string}
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Singleton instance
const eventBus = new DomainEventBus();

export default eventBus;
