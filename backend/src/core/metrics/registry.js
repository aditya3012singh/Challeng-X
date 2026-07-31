import client from 'prom-client';

// Create a custom Prometheus registry to avoid namespace collisions
export const register = new client.Registry();

// Collect default Node.js and system metrics
client.collectDefaultMetrics({ register });
