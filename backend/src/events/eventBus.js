import EventEmitter from 'events';
import logger from '../utils/logger.js';

/**
 * Domain Event Bus - Production Ready
 * Phase 4: Enhanced with reliability, observability, and error isolation
 * 
 * Features:
 * - Event logging with timestamps and execution time
 * - Error isolation per listener (one failure doesn't break others)
 * - Retry mechanism with exponential backoff for critical events
 * - Event payload validation
 * - Event metrics tracking
 * - Debug mode for full event flow visibility
 */
class DomainEventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
        
        // ✅ PHASE 4: Metrics tracking
        this.metrics = {
            totalEventsEmitted: 0,
            totalListenerExecutions: 0,
            failedListenerExecutions: 0,
            totalRetries: 0,
            eventTimings: {}, // eventName -> [timings]
            listenerErrors: {} // eventName -> [errors]
        };
        
        // ✅ PHASE 4: Debug mode flag
        this.debugMode = process.env.EVENT_DEBUG === 'true';
        
        // ✅ PHASE 4: Critical events that should retry
        this.criticalEvents = new Set([
            'BattleFinished',
            'SubmissionCompleted',
            'RewardGranted',
            'AchievementUnlocked'
        ]);
        
        // ✅ PHASE 4: Retry configuration
        this.retryConfig = {
            maxRetries: 3,
            initialDelayMs: 100,
            maxDelayMs: 5000
        };
    }

    /**
     * ✅ PHASE 4: Validate event payload against schema
     * @param {string} eventName
     * @param {object} payload
     * @returns {boolean}
     */
    validateEventPayload(eventName, payload) {
        if (!eventName || typeof eventName !== 'string') {
            logger.error('[EventBus] ❌ Invalid event name:', eventName);
            return false;
        }

        if (!payload || typeof payload !== 'object') {
            logger.error('[EventBus] ❌ Invalid payload for event:', eventName);
            return false;
        }

        // Basic validation - ensure payload is not empty
        if (Object.keys(payload).length === 0) {
            logger.warn('[EventBus] ⚠️ Empty payload for event:', eventName);
        }

        return true;
    }

    /**
     * ✅ PHASE 4: Sanitize payload for logging (remove sensitive data)
     * @param {object} payload
     * @returns {object}
     */
    sanitizePayload(payload) {
        if (!payload) return {};
        
        const sanitized = { ...payload };
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'refreshToken'];
        
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }

    /**
     * ✅ PHASE 4: Calculate exponential backoff delay
     * @param {number} retryCount
     * @returns {number}
     */
    calculateBackoffDelay(retryCount) {
        const delay = this.retryConfig.initialDelayMs * Math.pow(2, retryCount);
        return Math.min(delay, this.retryConfig.maxDelayMs);
    }

    /**
     * ✅ PHASE 4: Sleep utility for retry delays
     * @param {number} ms
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Emit domain event with enhanced logging and validation
     * @param {string} eventName - Event name (e.g., 'BattleFinished')
     * @param {object} payload - Event data
     */
    emitEvent(eventName, payload) {
        // ✅ PHASE 4: Validate payload
        if (!this.validateEventPayload(eventName, payload)) {
            logger.error('[EventBus] ❌ Event validation failed:', eventName);
            return;
        }

        // ✅ PHASE 4: Metrics tracking
        this.metrics.totalEventsEmitted++;

        const eventId = this.generateEventId();
        const timestamp = new Date();
        const sanitizedPayload = this.sanitizePayload(payload);

        // ✅ PHASE 4: Enhanced logging with timestamp
        logger.info(`[EventBus] 📤 Emitting: ${eventName}`, {
            eventId,
            eventName,
            timestamp: timestamp.toISOString(),
            payloadKeys: Object.keys(payload || {}),
            payloadSize: JSON.stringify(payload).length
        });

        // ✅ PHASE 4: Debug mode - log full payload
        if (this.debugMode) {
            logger.debug(`[EventBus] 🔍 DEBUG - Full payload for ${eventName}:`, sanitizedPayload);
        }

        this.emit(eventName, {
            eventName,
            payload,
            timestamp,
            eventId
        });
    }

    /**
     * ✅ PHASE 4: Execute handler with retry logic and error isolation
     * @param {string} eventName
     * @param {Function} handler
     * @param {object} event
     * @param {number} retryCount
     * @returns {Promise<{success: boolean, error?: Error, retries: number}>}
     */
    async executeHandlerWithRetry(eventName, handler, event, retryCount = 0) {
        const startTime = Date.now();
        const handlerName = handler.name || 'anonymous';

        try {
            // ✅ PHASE 4: Execute handler with timeout
            const result = await Promise.race([
                handler(event.payload),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Handler timeout after 30s')), 30000)
                )
            ]);

            const executionTime = Date.now() - startTime;

            // ✅ PHASE 4: Track metrics
            this.metrics.totalListenerExecutions++;
            if (!this.metrics.eventTimings[eventName]) {
                this.metrics.eventTimings[eventName] = [];
            }
            this.metrics.eventTimings[eventName].push(executionTime);

            // ✅ PHASE 4: Enhanced logging with execution time
            logger.info(`[EventBus] ✅ Listener completed: ${eventName} (${handlerName})`, {
                eventId: event.eventId,
                executionTimeMs: executionTime,
                retries: retryCount
            });

            // ✅ PHASE 4: Debug mode
            if (this.debugMode) {
                logger.debug(`[EventBus] 🔍 DEBUG - Handler result for ${eventName}:`, result);
            }

            return { success: true, retries: retryCount };
        } catch (error) {
            const executionTime = Date.now() - startTime;

            // ✅ PHASE 4: Error isolation - check if should retry
            const isCriticalEvent = this.criticalEvents.has(eventName);
            const shouldRetry = isCriticalEvent && retryCount < this.retryConfig.maxRetries;

            // ✅ PHASE 4: Track error metrics
            this.metrics.failedListenerExecutions++;
            if (!this.metrics.listenerErrors[eventName]) {
                this.metrics.listenerErrors[eventName] = [];
            }
            this.metrics.listenerErrors[eventName].push({
                error: error.message,
                timestamp: new Date(),
                retryCount
            });

            if (shouldRetry) {
                // ✅ PHASE 4: Retry with exponential backoff
                const backoffDelay = this.calculateBackoffDelay(retryCount);
                this.metrics.totalRetries++;

                logger.warn(`[EventBus] ⚠️ Listener failed, retrying: ${eventName} (${handlerName})`, {
                    eventId: event.eventId,
                    error: error.message,
                    executionTimeMs: executionTime,
                    retryCount: retryCount + 1,
                    backoffDelayMs: backoffDelay
                });

                await this.sleep(backoffDelay);
                return this.executeHandlerWithRetry(eventName, handler, event, retryCount + 1);
            } else {
                // ✅ PHASE 4: Final failure - log and isolate error
                logger.error(`[EventBus] ❌ Listener failed (no more retries): ${eventName} (${handlerName})`, {
                    eventId: event.eventId,
                    error: error.message,
                    executionTimeMs: executionTime,
                    retryCount,
                    stack: error.stack
                });

                return { success: false, error, retries: retryCount };
            }
        }
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
                logger.warn(`[EventBus] ⚠️ No listeners for: ${eventName} - allowing by default`);
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
     * ✅ PHASE 4: Register event listener with error isolation
     * @param {string} eventName
     * @param {Function} handler
     */
    onEvent(eventName, handler) {
        logger.info(`[EventBus] 📥 Registering listener for: ${eventName}`, {
            handlerName: handler.name || 'anonymous'
        });
        
        this.on(eventName, async (event) => {
            // ✅ PHASE 4: Error isolation - wrap in try-catch
            // Each listener failure is isolated and doesn't affect others
            try {
                if (this.debugMode) {
                    logger.debug(`[EventBus] 🔍 DEBUG - Processing event: ${eventName}`, {
                        eventId: event.eventId,
                        handlerName: handler.name || 'anonymous'
                    });
                }

                // ✅ PHASE 4: Execute with retry logic
                const result = await this.executeHandlerWithRetry(eventName, handler, event);

                if (!result.success) {
                    logger.error(`[EventBus] ❌ Listener execution failed after retries: ${eventName}`, {
                        eventId: event.eventId,
                        error: result.error?.message
                    });
                }
            } catch (error) {
                // ✅ PHASE 4: Final error isolation - prevent listener from crashing event bus
                logger.error(`[EventBus] ❌ Unexpected error in listener: ${eventName}`, {
                    eventId: event.eventId,
                    error: error.message,
                    stack: error.stack
                });
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

    /**
     * ✅ PHASE 4: Get event metrics
     * @returns {object}
     */
    getMetrics() {
        // Calculate average execution times
        const avgTimings = {};
        Object.entries(this.metrics.eventTimings).forEach(([eventName, timings]) => {
            if (timings.length > 0) {
                avgTimings[eventName] = {
                    count: timings.length,
                    avgMs: Math.round(timings.reduce((a, b) => a + b, 0) / timings.length),
                    minMs: Math.min(...timings),
                    maxMs: Math.max(...timings)
                };
            }
        });

        return {
            summary: {
                totalEventsEmitted: this.metrics.totalEventsEmitted,
                totalListenerExecutions: this.metrics.totalListenerExecutions,
                failedListenerExecutions: this.metrics.failedListenerExecutions,
                totalRetries: this.metrics.totalRetries,
                successRate: this.metrics.totalListenerExecutions > 0
                    ? ((this.metrics.totalListenerExecutions - this.metrics.failedListenerExecutions) / this.metrics.totalListenerExecutions * 100).toFixed(2) + '%'
                    : 'N/A'
            },
            timings: avgTimings,
            errors: this.metrics.listenerErrors
        };
    }

    /**
     * ✅ PHASE 4: Print metrics summary to console
     */
    printMetricsSummary() {
        const metrics = this.getMetrics();
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 EVENT BUS METRICS SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Events Emitted: ${metrics.summary.totalEventsEmitted}`);
        console.log(`Total Listener Executions: ${metrics.summary.totalListenerExecutions}`);
        console.log(`Failed Executions: ${metrics.summary.failedListenerExecutions}`);
        console.log(`Total Retries: ${metrics.summary.totalRetries}`);
        console.log(`Success Rate: ${metrics.summary.successRate}`);
        
        if (Object.keys(metrics.timings).length > 0) {
            console.log('\n📈 EXECUTION TIMINGS (ms):');
            Object.entries(metrics.timings).forEach(([eventName, timing]) => {
                console.log(`  ${eventName}: avg=${timing.avgMs}ms, min=${timing.minMs}ms, max=${timing.maxMs}ms (${timing.count} executions)`);
            });
        }
        
        if (Object.keys(metrics.errors).length > 0) {
            console.log('\n❌ ERRORS:');
            Object.entries(metrics.errors).forEach(([eventName, errors]) => {
                console.log(`  ${eventName}: ${errors.length} error(s)`);
                errors.slice(-3).forEach(err => {
                    console.log(`    - ${err.error} (retry #${err.retryCount})`);
                });
            });
        }
        
        console.log('='.repeat(60) + '\n');
    }

    /**
     * ✅ PHASE 4: Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            totalEventsEmitted: 0,
            totalListenerExecutions: 0,
            failedListenerExecutions: 0,
            totalRetries: 0,
            eventTimings: {},
            listenerErrors: {}
        };
        logger.info('[EventBus] 🔄 Metrics reset');
    }
}

// Singleton instance
const eventBus = new DomainEventBus();

export default eventBus;
