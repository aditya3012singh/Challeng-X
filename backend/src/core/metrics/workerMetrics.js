import client from 'prom-client';
import { register } from './registry.js';

export const jobsProcessedTotal = new client.Counter({
  name: 'jobs_processed_total',
  help: 'Total jobs processed by worker',
  labelNames: ['status', 'language'],
  registers: [register]
});

export const jobsFailedTotal = new client.Counter({
  name: 'jobs_failed_total',
  help: 'Total failed jobs by failure reason',
  labelNames: ['reason', 'language'],
  registers: [register]
});

export const jobProcessingDurationMs = new client.Histogram({
  name: 'job_processing_duration_ms',
  help: 'Job processing duration in milliseconds',
  labelNames: ['language'],
  buckets: [100, 500, 1000, 2500, 5000, 10000, 30000, 60000],
  registers: [register]
});

export const queueDepth = new client.Gauge({
  name: 'queue_depth',
  help: 'Current number of jobs in queue by status',
  labelNames: ['status'],
  registers: [register]
});
