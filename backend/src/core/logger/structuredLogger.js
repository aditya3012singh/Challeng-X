import logger from './logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Structured Logger with Trace ID Propagation
 * Phase 6: Enhanced observability with trace IDs and structured logging
 * 
 * Features:
 * - Trace ID propagation across requests, events, and workers
 * - Structured logging with consistent format
 * - Context-aware logging
 * - Performance metrics logging
 */
class StructuredLogger {
    constructor() {
        this.traceIdMap = new Map(); // Store trace IDs per request/context
    }

    /**
     * Generate or get trace ID for current context
     * @param {string} existingTraceId
     * @returns {string}
     */
    getOrCreateTraceId(existingTraceId) {
        if (existingTraceId) {
            return existingTraceId;
        }
        return `trace_${uuidv4()}`;
    }

    /**
     * Store trace ID in context
     * @param {string} contextId
     * @param {string} traceId
     */
    setTraceId(contextId, traceId) {
        this.traceIdMap.set(contextId, traceId);
    }

    /**
     * Get trace ID from context
     * @param {string} contextId
     * @returns {string}
     */
    getTraceId(contextId) {
        return this.traceIdMap.get(contextId);
    }

    /**
     * Clear trace ID from context
     * @param {string} contextId
     */
    clearTraceId(contextId) {
        this.traceIdMap.delete(contextId);
    }

    /**
     * Log with structured format
     * @param {string} level
     * @param {string} message
     * @param {object} metadata
     */
    log(level, message, metadata = {}) {
        const structuredLog = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            ...metadata
        };

        // Log to Winston logger
        logger[level](JSON.stringify(structuredLog));
    }

    /**
     * Log info level
     * @param {string} message
     * @param {object} metadata
     */
    info(message, metadata = {}) {
        this.log('info', message, metadata);
    }

    /**
     * Log error level
     * @param {string} message
     * @param {object} metadata
     */
    error(message, metadata = {}) {
        this.log('error', message, metadata);
    }

    /**
     * Log warn level
     * @param {string} message
     * @param {object} metadata
     */
    warn(message, metadata = {}) {
        this.log('warn', message, metadata);
    }

    /**
     * Log debug level
     * @param {string} message
     * @param {object} metadata
     */
    debug(message, metadata = {}) {
        this.log('debug', message, metadata);
    }

    /**
     * Log request start
     * @param {string} traceId
     * @param {string} method
     * @param {string} path
     * @param {object} metadata
     */
    logRequestStart(traceId, method, path, metadata = {}) {
        this.info('REQUEST_START', {
            traceId,
            method,
            path,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log request end
     * @param {string} traceId
     * @param {number} statusCode
     * @param {number} duration
     * @param {object} metadata
     */
    logRequestEnd(traceId, statusCode, duration, metadata = {}) {
        this.info('REQUEST_END', {
            traceId,
            statusCode,
            durationMs: duration,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log event emission
     * @param {string} traceId
     * @param {string} eventName
     * @param {string} eventId
     * @param {object} metadata
     */
    logEventEmitted(traceId, eventName, eventId, metadata = {}) {
        this.info('EVENT_EMITTED', {
            traceId,
            eventName,
            eventId,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log event received
     * @param {string} traceId
     * @param {string} eventName
     * @param {string} eventId
     * @param {object} metadata
     */
    logEventReceived(traceId, eventName, eventId, metadata = {}) {
        this.info('EVENT_RECEIVED', {
            traceId,
            eventName,
            eventId,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log listener execution
     * @param {string} traceId
     * @param {string} eventName
     * @param {string} listenerName
     * @param {number} duration
     * @param {object} metadata
     */
    logListenerExecution(traceId, eventName, listenerName, duration, metadata = {}) {
        this.info('LISTENER_EXECUTED', {
            traceId,
            eventName,
            listenerName,
            durationMs: duration,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log job queued
     * @param {string} traceId
     * @param {string} jobId
     * @param {string} jobName
     * @param {object} metadata
     */
    logJobQueued(traceId, jobId, jobName, metadata = {}) {
        this.info('JOB_QUEUED', {
            traceId,
            jobId,
            jobName,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log job started
     * @param {string} traceId
     * @param {string} jobId
     * @param {string} jobName
     * @param {object} metadata
     */
    logJobStarted(traceId, jobId, jobName, metadata = {}) {
        this.info('JOB_STARTED', {
            traceId,
            jobId,
            jobName,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log job completed
     * @param {string} traceId
     * @param {string} jobId
     * @param {string} jobName
     * @param {number} duration
     * @param {object} metadata
     */
    logJobCompleted(traceId, jobId, jobName, duration, metadata = {}) {
        this.info('JOB_COMPLETED', {
            traceId,
            jobId,
            jobName,
            durationMs: duration,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log job failed
     * @param {string} traceId
     * @param {string} jobId
     * @param {string} jobName
     * @param {string} error
     * @param {object} metadata
     */
    logJobFailed(traceId, jobId, jobName, error, metadata = {}) {
        this.error('JOB_FAILED', {
            traceId,
            jobId,
            jobName,
            error,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log error with trace
     * @param {string} traceId
     * @param {string} message
     * @param {Error} error
     * @param {object} metadata
     */
    logError(traceId, message, error, metadata = {}) {
        this.error(message, {
            traceId,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log performance metric
     * @param {string} traceId
     * @param {string} metricName
     * @param {number} value
     * @param {string} unit
     * @param {object} metadata
     */
    logMetric(traceId, metricName, value, unit = 'ms', metadata = {}) {
        this.info('METRIC', {
            traceId,
            metricName,
            value,
            unit,
            timestamp: new Date().toISOString(),
            ...metadata
        });
    }

    /**
     * Log event flow chain
     * @param {string} traceId
     * @param {Array} chain
     */
    logEventFlowChain(traceId, chain) {
        this.info('EVENT_FLOW_CHAIN', {
            traceId,
            chain: chain.map(step => ({
                step: step.step,
                service: step.service,
                duration: step.duration,
                timestamp: step.timestamp
            })),
            totalDuration: chain.reduce((sum, step) => sum + (step.duration || 0), 0),
            timestamp: new Date().toISOString()
        });
    }
}

// Singleton instance
const structuredLogger = new StructuredLogger();

export default structuredLogger;
