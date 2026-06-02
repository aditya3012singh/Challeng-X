import client from 'prom-client';

/**
 * Prometheus Metrics Module
 * Phase 1A: MVP - Core metrics collection
 * 
 * Exports:
 * - API request metrics
 * - Worker job metrics
 * - Judge execution metrics
 * - Redis cache metrics
 * - gRPC metrics
 */

// Collect default metrics (process, nodejs, gc, etc.)
client.collectDefaultMetrics();

// ============================================================================
// API REQUEST METRICS
// ============================================================================

export const apiRequestsTotal = new client.Counter({
  name: 'api_requests_total',
  help: 'Total HTTP requests by method and endpoint',
  labelNames: ['method', 'endpoint', 'status']
});

export const apiRequestDurationMs = new client.Histogram({
  name: 'api_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
});

export const apiErrorsTotal = new client.Counter({
  name: 'api_errors_total',
  help: 'Total API errors by endpoint and error type',
  labelNames: ['endpoint', 'error_type', 'status_code']
});

// ============================================================================
// WORKER METRICS
// ============================================================================

export const jobsProcessedTotal = new client.Counter({
  name: 'jobs_processed_total',
  help: 'Total jobs processed by worker',
  labelNames: ['status', 'language']
});

export const jobsFailedTotal = new client.Counter({
  name: 'jobs_failed_total',
  help: 'Total failed jobs by failure reason',
  labelNames: ['reason', 'language']
});

export const jobProcessingDurationMs = new client.Histogram({
  name: 'job_processing_duration_ms',
  help: 'Job processing duration in milliseconds',
  labelNames: ['language'],
  buckets: [100, 500, 1000, 2500, 5000, 10000, 30000, 60000]
});

export const queueDepth = new client.Gauge({
  name: 'queue_depth',
  help: 'Current number of jobs in queue by status',
  labelNames: ['status']
});

// ============================================================================
// JUDGE SERVICE METRICS
// ============================================================================

export const judgeExecutionsTotal = new client.Counter({
  name: 'judge_executions_total',
  help: 'Total code executions by language and status',
  labelNames: ['language', 'status']
});

export const judgeExecutionDurationMs = new client.Histogram({
  name: 'judge_execution_duration_ms',
  help: 'Judge execution duration in milliseconds',
  labelNames: ['language'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000]
});

export const judgeTimeoutsTotal = new client.Counter({
  name: 'judge_timeouts_total',
  help: 'Total judge execution timeouts',
  labelNames: ['language']
});

// ============================================================================
// REDIS CACHE METRICS
// ============================================================================

export const cacheHitsTotal = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits by cache type',
  labelNames: ['cache_type']
});

export const cacheMissesTotal = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses by cache type',
  labelNames: ['cache_type']
});

export const cacheHitRatio = new client.Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio percentage by cache type',
  labelNames: ['cache_type']
});

// ============================================================================
// gRPC METRICS
// ============================================================================

export const grpcRequestsTotal = new client.Counter({
  name: 'grpc_requests_total',
  help: 'Total gRPC requests by method and status',
  labelNames: ['method', 'status']
});

export const grpcRequestDurationMs = new client.Histogram({
  name: 'grpc_request_duration_ms',
  help: 'gRPC request duration in milliseconds',
  labelNames: ['method'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
});

export const grpcErrorsTotal = new client.Counter({
  name: 'grpc_errors_total',
  help: 'Total gRPC errors by method and error code',
  labelNames: ['method', 'error_code']
});

// ============================================================================
// SUBMISSION METRICS
// ============================================================================

export const submissionsTotal = new client.Counter({
  name: 'submissions_total',
  help: 'Total submissions by type and language',
  labelNames: ['type', 'language']
});

export const submissionResultsTotal = new client.Counter({
  name: 'submission_results_total',
  help: 'Total submission results by status and language',
  labelNames: ['status', 'language']
});

// ============================================================================
// QUEUE METRICS
// ============================================================================

export const queueJobsTotal = new client.Counter({
  name: 'queue_jobs_total',
  help: 'Total jobs queued',
  labelNames: ['status']
});

// ============================================================================
// EXPORT METRICS REGISTRY
// ============================================================================

export function getMetricsRegistry() {
  return client.register;
}

/**
 * Get all metrics as Prometheus format string
 * @returns {Promise<string>}
 */
export async function metricsToPrometheus() {
  return await client.register.metrics();
}

/**
 * Record API request
 * @param {object} options
 */
export function recordApiRequest({ method, endpoint, statusCode, duration }) {
  const status = statusCode >= 400 ? 'error' : 'success';
  
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
