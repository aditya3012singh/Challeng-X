import client from 'prom-client';
import { register } from './registry.js';

export const judgeExecutionsTotal = new client.Counter({
  name: 'judge_executions_total',
  help: 'Total code executions by language and status',
  labelNames: ['language', 'status'],
  registers: [register]
});

export const judgeExecutionDurationMs = new client.Histogram({
  name: 'judge_execution_duration_ms',
  help: 'Judge execution duration in milliseconds',
  labelNames: ['language'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register]
});

export const judgeTimeoutsTotal = new client.Counter({
  name: 'judge_timeouts_total',
  help: 'Total judge execution timeouts',
  labelNames: ['language'],
  registers: [register]
});
