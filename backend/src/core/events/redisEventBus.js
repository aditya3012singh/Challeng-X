import redis from 'redis';
import logger from '../logger/logger.js';
import structuredLogger from '../logger/structuredLogger.js';
import metricsCollector from '../metrics/metricsCollector.js';

/**
 * Redis Event Bus - Distributed Event System
 * Phase 5: Distributed event communication for horizontal scaling
 * 
 * Features:
 * - Pub/Sub for event distribution across services
 * - Event persistence via Redis
 * - Idempotency tracking to prevent duplicate processing
 * - Dead letter queue for failed events
 * - Graceful fallback to local event bus
 */
class RedisEventBus {
    constructor() {
        this.publisher = null;
        this.subscriber = null;
        this.isConnected = false;
        this.handlers = new Map(); // eventName -> [handlers]
        this.idempotencyStore = new Map(); // eventId -> timestamp
        this.deadLetterQueue = []; // Failed events
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // ms
    }

    /**
     * Initialize Redis connection
     * @returns {Promise<boolean>}
     */
    async connect() {
        try {
            // Use REDIS_URL if available, otherwise construct from individual vars
            let redisUrl = process.env.REDIS_URL;
            
            // If REDIS_URL contains ${REDIS_PASSWORD}, replace it with actual value
            if (redisUrl && redisUrl.includes('${REDIS_PASSWORD}')) {
                redisUrl = redisUrl.replace('${REDIS_PASSWORD}', process.env.REDIS_PASSWORD || '');
            }
            
            // Fallback to individual config if REDIS_URL is not set
            if (!redisUrl) {
                const password = process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : '';
                redisUrl = `redis://${password}${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
            }

            // Create publisher client
            this.publisher = redis.createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > this.maxReconnectAttempts) {
                            logger.error('[RedisEventBus] ❌ Max reconnection attempts reached');
                            return new Error('Max reconnection attempts reached');
                        }
                        const delay = Math.min(this.reconnectDelay * Math.pow(2, retries), 30000);
                        logger.warn(`[RedisEventBus] ⚠️ Reconnecting in ${delay}ms (attempt ${retries + 1})`);
                        return delay;
                    }
                }
            });

            // Create subscriber client (separate connection required for pub/sub)
            this.subscriber = redis.createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > this.maxReconnectAttempts) {
                            logger.error('[RedisEventBus] ❌ Subscriber max reconnection attempts reached');
                            return new Error('Max reconnection attempts reached');
                        }
                        const delay = Math.min(this.reconnectDelay * Math.pow(2, retries), 30000);
                        logger.warn(`[RedisEventBus] ⚠️ Subscriber reconnecting in ${delay}ms (attempt ${retries + 1})`);
                        return delay;
                    }
                }
            });

            // Handle publisher errors
            this.publisher.on('error', (err) => {
                logger.error('[RedisEventBus] ❌ Publisher error:', err);
                this.isConnected = false;
            });

            // Handle subscriber errors
            this.subscriber.on('error', (err) => {
                logger.error('[RedisEventBus] ❌ Subscriber error:', err);
                this.isConnected = false;
            });

            // Connect both clients
            await this.publisher.connect();
            await this.subscriber.connect();

            this.isConnected = true;
            this.reconnectAttempts = 0;

            logger.info('[RedisEventBus] ✅ Connected to Redis');
            return true;
        } catch (error) {
            logger.error('[RedisEventBus] ❌ Failed to connect to Redis:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Disconnect from Redis
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            if (this.publisher) {
                await this.publisher.quit();
            }
            if (this.subscriber) {
                await this.subscriber.quit();
            }
            this.isConnected = false;
            logger.info('[RedisEventBus] ✅ Disconnected from Redis');
        } catch (error) {
            logger.error('[RedisEventBus] ❌ Error disconnecting from Redis:', error);
        }
    }

    /**
     * Publish event to Redis
     * @param {string} eventName
     * @param {object} payload
     * @param {string} eventId
     * @returns {Promise<boolean>}
     */
    async publish(eventName, payload, eventId) {
        if (!this.isConnected) {
            logger.warn('[RedisEventBus] ⚠️ Not connected to Redis, skipping publish');
            return false;
        }

        try {
            const message = JSON.stringify({
                eventName,
                payload,
                eventId,
                timestamp: new Date().toISOString(),
                source: 'distributed'
            });

            // Publish to Redis channel
            const subscribers = await this.publisher.publish(eventName, message);

            // Log with structured logger
            structuredLogger.logEventEmitted(eventId, eventName, eventId, {
                subscribers,
                payloadSize: message.length,
                source: 'redis'
            });

            // Record metrics
            metricsCollector.recordEventEmitted(eventName);

            logger.info(`[RedisEventBus] 📤 Published: ${eventName}`, {
                eventId,
                subscribers,
                payloadSize: message.length
            });

            // Store in Redis for persistence (optional)
            await this.storeEventInRedis(eventName, message, eventId);

            return true;
        } catch (error) {
            logger.error('[RedisEventBus] ❌ Error publishing event:', error);
            metricsCollector.recordEventFailed(eventName);
            return false;
        }
    }

    /**
     * Subscribe to events
     * @param {string} eventName
     * @param {Function} handler
     * @returns {Promise<void>}
     */
    async subscribe(eventName, handler) {
        if (!this.isConnected) {
            logger.warn('[RedisEventBus] ⚠️ Not connected to Redis, cannot subscribe');
            return;
        }

        try {
            // Store handler locally
            if (!this.handlers.has(eventName)) {
                this.handlers.set(eventName, []);
            }
            this.handlers.get(eventName).push(handler);

            // Subscribe to Redis channel
            await this.subscriber.subscribe(eventName, async (message) => {
                try {
                    const event = JSON.parse(message);
                    const startTime = Date.now();
                    
                    // Check idempotency
                    if (this.isEventProcessed(event.eventId)) {
                        logger.warn(`[RedisEventBus] ⚠️ Duplicate event detected: ${event.eventId}`);
                        structuredLogger.warn('Duplicate event detected', {
                            traceId: event.eventId,
                            eventName,
                            eventId: event.eventId
                        });
                        return;
                    }

                    // Mark as processed
                    this.markEventProcessed(event.eventId);

                    // Log event received with structured logger
                    structuredLogger.logEventReceived(event.eventId, eventName, event.eventId, {
                        source: event.source
                    });

                    logger.info(`[RedisEventBus] 📥 Received: ${eventName}`, {
                        eventId: event.eventId,
                        source: event.source
                    });

                    // Execute handler
                    await handler(event.payload);

                    const duration = Date.now() - startTime;

                    // Log listener execution
                    structuredLogger.logListenerExecution(event.eventId, eventName, handler.name || 'anonymous', duration, {
                        source: 'redis'
                    });

                    // Record metrics
                    metricsCollector.recordEventReceived(eventName);
                    metricsCollector.recordListenerExecution(handler.name || 'anonymous', duration, false);

                    logger.info(`[RedisEventBus] ✅ Handler completed: ${eventName}`, {
                        eventId: event.eventId,
                        duration
                    });
                } catch (error) {
                    logger.error(`[RedisEventBus] ❌ Error handling event: ${eventName}`, error);
                    
                    // Log error with structured logger
                    structuredLogger.logError(event?.eventId || 'unknown', `Error handling event: ${eventName}`, error, {
                        eventName
                    });

                    // Record metrics
                    metricsCollector.recordEventFailed(eventName);
                    metricsCollector.recordError('EventHandlingError');
                    
                    // Add to dead letter queue
                    this.addToDeadLetterQueue(eventName, message, error);
                }
            });

            logger.info(`[RedisEventBus] 📥 Subscribed to: ${eventName}`, {
                handlerName: handler.name || 'anonymous'
            });
        } catch (error) {
            logger.error('[RedisEventBus] ❌ Error subscribing to event:', error);
        }
    }

    /**
     * Check if event has been processed (idempotency)
     * @param {string} eventId
     * @returns {boolean}
     */
    isEventProcessed(eventId) {
        return this.idempotencyStore.has(eventId);
    }

    /**
     * Mark event as processed
     * @param {string} eventId
     */
    markEventProcessed(eventId) {
        this.idempotencyStore.set(eventId, Date.now());
        
        // Clean up old entries (older than 1 hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        for (const [id, timestamp] of this.idempotencyStore.entries()) {
            if (timestamp < oneHourAgo) {
                this.idempotencyStore.delete(id);
            }
        }
    }

    /**
     * Store event in Redis for persistence
     * @param {string} eventName
     * @param {string} message
     * @param {string} eventId
     * @returns {Promise<void>}
     */
    async storeEventInRedis(eventName, message, eventId) {
        if (!this.isConnected) return;

        try {
            const key = `event:${eventName}:${eventId}`;
            const ttl = 24 * 60 * 60; // 24 hours

            await this.publisher.setEx(key, ttl, message);
        } catch (error) {
            logger.error('[RedisEventBus] ❌ Error storing event in Redis:', error);
        }
    }

    /**
     * Add event to dead letter queue
     * @param {string} eventName
     * @param {string} message
     * @param {Error} error
     */
    addToDeadLetterQueue(eventName, message, error) {
        try {
            const deadLetterEntry = {
                eventName,
                message,
                error: error.message,
                timestamp: new Date().toISOString(),
                retries: 0
            };

            this.deadLetterQueue.push(deadLetterEntry);

            logger.error('[RedisEventBus] ❌ Event added to dead letter queue:', {
                eventName,
                error: error.message,
                queueSize: this.deadLetterQueue.length
            });

            // Store in Redis for persistence
            this.storeDeadLetterInRedis(deadLetterEntry);
        } catch (err) {
            logger.error('[RedisEventBus] ❌ Error adding to dead letter queue:', err);
        }
    }

    /**
     * Store dead letter in Redis
     * @param {object} deadLetterEntry
     * @returns {Promise<void>}
     */
    async storeDeadLetterInRedis(deadLetterEntry) {
        if (!this.isConnected) return;

        try {
            const key = `deadletter:${deadLetterEntry.eventName}:${Date.now()}`;
            const ttl = 7 * 24 * 60 * 60; // 7 days

            await this.publisher.setEx(key, ttl, JSON.stringify(deadLetterEntry));
        } catch (error) {
            logger.error('[RedisEventBus] ❌ Error storing dead letter in Redis:', error);
        }
    }

    /**
     * Get dead letter queue
     * @returns {Array}
     */
    getDeadLetterQueue() {
        return this.deadLetterQueue;
    }

    /**
     * Retry dead letter event
     * @param {number} index
     * @returns {Promise<boolean>}
     */
    async retryDeadLetter(index) {
        if (index < 0 || index >= this.deadLetterQueue.length) {
            logger.error('[RedisEventBus] ❌ Invalid dead letter index');
            return false;
        }

        try {
            const deadLetterEntry = this.deadLetterQueue[index];
            const event = JSON.parse(deadLetterEntry.message);

            logger.info('[RedisEventBus] 🔄 Retrying dead letter event:', {
                eventName: deadLetterEntry.eventName,
                retries: deadLetterEntry.retries + 1
            });

            // Get handlers for this event
            const handlers = this.handlers.get(deadLetterEntry.eventName) || [];

            for (const handler of handlers) {
                try {
                    await handler(event.payload);
                } catch (error) {
                    deadLetterEntry.retries++;
                    logger.error('[RedisEventBus] ❌ Retry failed:', error);
                    return false;
                }
            }

            // Remove from dead letter queue on success
            this.deadLetterQueue.splice(index, 1);
            logger.info('[RedisEventBus] ✅ Dead letter event retried successfully');
            return true;
        } catch (error) {
            logger.error('[RedisEventBus] ❌ Error retrying dead letter:', error);
            return false;
        }
    }

    /**
     * Clear dead letter queue
     */
    clearDeadLetterQueue() {
        this.deadLetterQueue = [];
        logger.info('[RedisEventBus] 🔄 Dead letter queue cleared');
    }

    /**
     * Get connection status
     * @returns {boolean}
     */
    isHealthy() {
        return this.isConnected;
    }

    /**
     * Get health status object
     * @returns {object}
     */
    getHealthStatus() {
        return {
            connected: this.isConnected,
            idempotencyStoreSize: this.idempotencyStore.size,
            deadLetterQueueSize: this.deadLetterQueue.length,
            subscribedChannels: this.handlers.size
        };
    }
}

// Singleton instance
const redisEventBus = new RedisEventBus();

export default redisEventBus;
