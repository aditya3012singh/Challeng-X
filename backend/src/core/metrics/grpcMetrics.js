import client from 'prom-client';
import { register } from './registry.js';

export const grpcRequestsTotal = new client.Counter({
  name: 'grpc_requests_total',
  help: 'Total gRPC requests by method and status',
  labelNames: ['method', 'status'],
  registers: [register]
});

export const grpcRequestDurationMs = new client.Histogram({
  name: 'grpc_request_duration_ms',
  help: 'gRPC request duration in milliseconds',
  labelNames: ['method'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register]
});

export const grpcErrorsTotal = new client.Counter({
  name: 'grpc_errors_total',
  help: 'Total gRPC errors by method and error code',
  labelNames: ['method', 'error_code'],
  registers: [register]
});
