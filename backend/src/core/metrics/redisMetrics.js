import client from 'prom-client';
import { register } from './registry.js';

export const cacheHitsTotal = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits by cache type',
  labelNames: ['cache_type'],
  registers: [register]
});

export const cacheMissesTotal = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses by cache type',
  labelNames: ['cache_type'],
  registers: [register]
});

export const cacheHitRatio = new client.Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio percentage by cache type',
  labelNames: ['cache_type'],
  registers: [register]
});
