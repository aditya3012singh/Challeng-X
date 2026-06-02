import { recordApiRequest } from '../../core/metrics/prometheus.js';
import logger from '../../core/logger/logger.js';

/**
 * Express middleware to record API metrics
 * Tracks: request count, duration, error rate
 */
export function metricsMiddleware(req, res, next) {
  // Record start time
  const startTime = Date.now();
  
  // Normalize endpoint path (remove IDs to avoid cardinality explosion)
  const endpoint = normalizeEndpoint(req.path);
  
  // Intercept response end to capture status code and duration
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    try {
      recordApiRequest({
        method: req.method,
        endpoint,
        statusCode,
        duration
      });
    } catch (error) {
      logger.error('Failed to record API metrics', {
        error: error.message,
        endpoint,
        method: req.method
      });
    }
    
    // Call original end
    originalEnd.apply(res, args);
  };
  
  next();
}

/**
 * Normalize endpoint path to avoid high cardinality
 * Converts /api/submissions/123 → /api/submissions/:id
 * @param {string} path
 * @returns {string}
 */
function normalizeEndpoint(path) {
  // Remove query string
  path = path.split('?')[0];
  
  // Replace UUIDs and numeric IDs with placeholders
  path = path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id');
  path = path.replace(/\/\d+(?=\/|$)/g, '/:id');
  
  return path || '/';
}
