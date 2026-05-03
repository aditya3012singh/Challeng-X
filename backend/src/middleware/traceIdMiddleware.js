import { v4 as uuidv4 } from 'uuid';
import structuredLogger from '../utils/structuredLogger.js';

/**
 * Trace ID Middleware
 * Phase 6: Propagate trace IDs across requests
 * 
 * Features:
 * - Generate trace ID for each request
 * - Attach trace ID to request object
 * - Pass trace ID to response headers
 * - Log request start and end with trace ID
 */
export function traceIdMiddleware(req, res, next) {
    // Get or create trace ID
    const traceId = req.headers['x-trace-id'] || `trace_${uuidv4()}`;
    
    // Attach to request
    req.traceId = traceId;
    
    // Attach to response headers
    res.setHeader('X-Trace-ID', traceId);
    
    // Store in structured logger
    structuredLogger.setTraceId(req.id || traceId, traceId);
    
    // Log request start
    const startTime = Date.now();
    structuredLogger.logRequestStart(traceId, req.method, req.path, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    
    // Intercept response end
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - startTime;
        
        // Log request end
        structuredLogger.logRequestEnd(traceId, res.statusCode, duration, {
            contentLength: res.get('content-length')
        });
        
        // Clear trace ID from storage
        structuredLogger.clearTraceId(req.id || traceId);
        
        // Call original end
        originalEnd.apply(res, args);
    };
    
    next();
}

/**
 * Attach trace ID to async context
 * @param {string} traceId
 * @param {Function} fn
 * @returns {Promise}
 */
export async function withTraceId(traceId, fn) {
    try {
        return await fn(traceId);
    } catch (error) {
        structuredLogger.logError(traceId, 'Error in traced function', error);
        throw error;
    }
}

/**
 * Create trace ID context for events
 * @param {string} traceId
 * @param {string} eventName
 * @returns {object}
 */
export function createEventTraceContext(traceId, eventName) {
    return {
        traceId,
        eventName,
        eventId: `evt_${uuidv4()}`,
        timestamp: new Date().toISOString()
    };
}

/**
 * Create trace ID context for jobs
 * @param {string} traceId
 * @param {string} jobName
 * @returns {object}
 */
export function createJobTraceContext(traceId, jobName) {
    return {
        traceId,
        jobName,
        jobId: `job_${uuidv4()}`,
        timestamp: new Date().toISOString()
    };
}
