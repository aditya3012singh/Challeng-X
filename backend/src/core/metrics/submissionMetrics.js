import client from 'prom-client';
import { register } from './registry.js';

export const submissionsTotal = new client.Counter({
  name: 'submissions_total',
  help: 'Total submissions by type and language',
  labelNames: ['type', 'language'],
  registers: [register]
});

export const submissionResultsTotal = new client.Counter({
  name: 'submission_results_total',
  help: 'Total submission results by status and language',
  labelNames: ['status', 'language'],
  registers: [register]
});
