import client from 'prom-client';
import { register } from './registry.js';

export const dbQueriesTotal = new client.Counter({
  name: 'db_queries_total',
  help: 'Total database queries executed by status and operation name',
  labelNames: ['query_name', 'status'],
  registers: [register]
});

export const dbQueryDurationMs = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Database query execution duration in milliseconds',
  labelNames: ['query_name'],
  buckets: [5, 20, 50, 100, 250, 500, 1000],
  registers: [register]
});

export const dbTransactionsTotal = new client.Counter({
  name: 'db_transactions_total',
  help: 'Total database transactions executed by status and transaction name',
  labelNames: ['tx_name', 'status'],
  registers: [register]
});

export const dbTransactionDurationMs = new client.Histogram({
  name: 'db_transaction_duration_ms',
  help: 'Database transaction execution duration in milliseconds',
  labelNames: ['tx_name'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500],
  registers: [register]
});

export const dbErrorsTotal = new client.Counter({
  name: 'db_errors_total',
  help: 'Total database errors by query/transaction name and database error code',
  labelNames: ['query_name', 'error_code'],
  registers: [register]
});
