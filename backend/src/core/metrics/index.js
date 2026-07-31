import { register } from './registry.js';

import {
  apiRequestsTotal,
  apiRequestDurationMs,
  apiErrorsTotal
} from './httpMetrics.js';

import {
  cacheHitsTotal,
  cacheMissesTotal,
  cacheHitRatio
} from './redisMetrics.js';

import {
  dbQueriesTotal,
  dbQueryDurationMs,
  dbTransactionsTotal,
  dbTransactionDurationMs,
  dbErrorsTotal
} from './dbMetrics.js';

import {
  jobsProcessedTotal,
  jobsFailedTotal,
  jobProcessingDurationMs,
  queueDepth
} from './workerMetrics.js';

import {
  judgeExecutionsTotal,
  judgeExecutionDurationMs,
  judgeTimeoutsTotal
} from './judgeMetrics.js';

import {
  grpcRequestsTotal,
  grpcRequestDurationMs,
  grpcErrorsTotal
} from './grpcMetrics.js';

import {
  submissionsTotal,
  submissionResultsTotal
} from './submissionMetrics.js';

// Export the core Prometheus registry and helper
export { register };

export function getMetricsRegistry() {
  return register;
}

/**
 * Get all metrics as Prometheus format string
 * @returns {Promise<string>}
 */
export async function metricsToPrometheus() {
  return await register.metrics();
}

// Re-export individual metric descriptors
export {
  apiRequestsTotal,
  apiRequestDurationMs,
  apiErrorsTotal,
  cacheHitsTotal,
  cacheMissesTotal,
  cacheHitRatio,
  dbQueriesTotal,
  dbQueryDurationMs,
  dbTransactionsTotal,
  dbTransactionDurationMs,
  dbErrorsTotal,
  jobsProcessedTotal,
  jobsFailedTotal,
  jobProcessingDurationMs,
  queueDepth,
  judgeExecutionsTotal,
  judgeExecutionDurationMs,
  judgeTimeoutsTotal,
  grpcRequestsTotal,
  grpcRequestDurationMs,
  grpcErrorsTotal,
  submissionsTotal,
  submissionResultsTotal
};

// ============================================================================
// METRIC RECORDING WRAPPER HELPERS
// ============================================================================

/**
 * Record API request
 * @param {object} options
 */
export function recordApiRequest({ method, endpoint, statusCode, duration }) {
  apiRequestsTotal.labels(method, endpoint, statusCode).inc();
  apiRequestDurationMs.labels(method, endpoint, statusCode).observe(duration);
  
  if (statusCode >= 400) {
    apiErrorsTotal.labels(endpoint, statusCode >= 500 ? 'server_error' : 'client_error', statusCode).inc();
  }
}

/**
 * Record worker job completion
 * @param {object} options
 */
export function recordJobCompletion({ status, language, duration, reason = null }) {
  if (status === 'completed') {
    jobsProcessedTotal.labels('completed', language).inc();
  } else if (status === 'failed') {
    jobsProcessedTotal.labels('failed', language).inc();
    jobsFailedTotal.labels(reason || 'unknown', language).inc();
  }
  
  if (duration) {
    jobProcessingDurationMs.labels(language).observe(duration);
  }
}

/**
 * Update queue depth
 * @param {object} options
 */
export function updateQueueDepth({ waiting, active, completed, failed }) {
  queueDepth.labels('waiting').set(waiting || 0);
  queueDepth.labels('active').set(active || 0);
  queueDepth.labels('completed').set(completed || 0);
  queueDepth.labels('failed').set(failed || 0);
}

/**
 * Record judge execution
 * @param {object} options
 */
export function recordJudgeExecution({ language, status, duration, timeout = false }) {
  judgeExecutionsTotal.labels(language, status).inc();
  
  if (duration) {
    judgeExecutionDurationMs.labels(language).observe(duration);
  }
  
  if (timeout) {
    judgeTimeoutsTotal.labels(language).inc();
  }
}

/**
 * Record cache operation
 * @param {object} options
 */
export function recordCacheOperation({ cacheType, hit, ratio = null }) {
  if (hit) {
    cacheHitsTotal.labels(cacheType).inc();
  } else {
    cacheMissesTotal.labels(cacheType).inc();
  }
  
  if (ratio !== null && ratio >= 0 && ratio <= 100) {
    cacheHitRatio.labels(cacheType).set(ratio);
  }
}

/**
 * Record gRPC request
 * @param {object} options
 */
export function recordGrpcRequest({ method, status, duration, errorCode = null }) {
  grpcRequestsTotal.labels(method, status).inc();
  
  if (duration) {
    grpcRequestDurationMs.labels(method).observe(duration);
  }
  
  if (errorCode) {
    grpcErrorsTotal.labels(method, errorCode).inc();
  }
}

/**
 * Record submission
 * @param {object} options
 */
export function recordSubmission({ type, language, resultStatus }) {
  submissionsTotal.labels(type, language).inc();
  submissionResultsTotal.labels(resultStatus, language).inc();
}

/**
 * Record database query metrics
 * @param {string} queryName
 * @param {string} status - success or error
 * @param {number} duration - duration in ms
 */
export function recordDbQuery(queryName, status, duration) {
  dbQueriesTotal.labels(queryName, status).inc();
  if (duration) {
    dbQueryDurationMs.labels(queryName).observe(duration);
  }
}

/**
 * Record database transaction metrics
 * @param {string} txName
 * @param {string} status - success or error
 * @param {number} duration - duration in ms
 */
export function recordDbTransaction(txName, status, duration) {
  dbTransactionsTotal.labels(txName, status).inc();
  if (duration) {
    dbTransactionDurationMs.labels(txName).observe(duration);
  }
}

/**
 * Record database error metrics
 * @param {string} queryName
 * @param {string} errorCode
 */
export function recordDbError(queryName, errorCode) {
  dbErrorsTotal.labels(queryName, errorCode || 'unknown').inc();
}
