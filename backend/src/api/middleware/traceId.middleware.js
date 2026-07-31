import { v4 as uuidv4 } from 'uuid';
import structuredLogger from '../../core/logger/structuredLogger.js';
import { contextStorage } from '../../core/logger/context.js';

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
    // Trace ID: parse from W3C traceparent or x-trace-id header, fallback to 32-character hex UUID
    const traceparent = req.headers['traceparent'];
    const parts = traceparent?.split('-');
    const incomingTraceId = req.headers['x-trace-id'] || (parts?.length === 4 ? parts[1] : undefined);
    
    const traceId = incomingTraceId || uuidv4().replace(/-/g, '');
    const requestId = `req_${uuidv4().replace(/-/g, '')}`;
    
    // Attach to request
    req.traceId = traceId;
    req.requestId = requestId;
    
    // Attach to response headers
    res.setHeader('X-Trace-ID', traceId);
    res.setHeader('X-Request-ID', requestId);
    
    // Log request start
    const startTime = Date.now();
    structuredLogger.logRequestStart(traceId, req.method, req.path, {
        requestId,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    
    // Intercept response end
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - startTime;
        
        // Log request end
        structuredLogger.logRequestEnd(traceId, res.statusCode, duration, {
            requestId,
            contentLength: res.get('content-length')
        });
        
        // Call original end
        originalEnd.apply(res, args);
    };
    
    contextStorage.run({ traceId, requestId }, () => {
        next();
    });
}

/**
 * Attach trace ID to async context
 * @param {string} traceId
 * @param {Function} fn
 * @returns {Promise}
 */
export async function withTraceId(traceId, fn) {
    try {
        return await contextStorage.run({ traceId }, () => fn(traceId));
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
