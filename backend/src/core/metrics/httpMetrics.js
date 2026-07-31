import client from 'prom-client';
import { register } from './registry.js';

export const apiRequestsTotal = new client.Counter({
  name: 'api_requests_total',
  help: 'Total HTTP requests by method and endpoint',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register]
});

export const apiRequestDurationMs = new client.Histogram({
  name: 'api_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register]
});

export const apiErrorsTotal = new client.Counter({
  name: 'api_errors_total',
  help: 'Total API errors by endpoint and error type',
  labelNames: ['endpoint', 'error_type', 'status_code'],
  registers: [register]
});
