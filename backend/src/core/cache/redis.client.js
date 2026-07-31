import Redis from "ioredis";
import env from "../config/env.js";
import structuredLogger from "../logger/structuredLogger.js";

const rawRedisURL = env.REDIS_URL;
const redisHost = env.REDIS_HOST || '127.0.0.1';
const redisPort = env.REDIS_PORT ? parseInt(env.REDIS_PORT) : 6379;
const redisPassword = env.REDIS_PASSWORD;

// Normalize Upstash / Cloud TLS config
const normalizeRedisUrl = (url) => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (/^redis:\/\//i.test(trimmed) && /upstash\.io/i.test(trimmed)) {
    structuredLogger.warn('REDIS_URL is using redis:// for Upstash. Switching to rediss:// automatically.');
    return trimmed.replace(/^redis:\/\//i, 'rediss://');
  }
  return trimmed;
};

const redisURL = normalizeRedisUrl(rawRedisURL);

const commonRedisOptions = {
  maxRetriesPerRequest: null,
  connectTimeout: 30000, // 30 seconds connection timeout
  keepAlive: 30000,      // TCP Keep-Alive
  retryStrategy: (times) => Math.min(times * 250, 5000), // Backoff retry strategy
};

if (redisPassword) {
  commonRedisOptions.password = redisPassword;
}

/**
 * Creates and names a Redis client connection instance
 * @param {string} name
 * @returns {Redis}
 */
export const createRedisClient = (name = 'Redis') => {
  const client = redisURL
    ? new Redis(redisURL, commonRedisOptions)
    : new Redis({
        host: redisHost,
        port: redisPort,
        ...commonRedisOptions,
      });

  client.once('connect', () => {
    structuredLogger.info(`[${name}] Connected to Redis server: ${redisURL ? 'Cloud' : 'Local'}`);
  });

  client.on('reconnecting', (delay) => {
    structuredLogger.warn(`[${name}] Reconnecting in ${delay}ms`);
  });

  client.on('end', () => {
    structuredLogger.warn(`[${name}] Connection closed.`);
  });

  client.on('error', (err) => {
    structuredLogger.error(`[${name}] Connection error:`, { error: err.message });
  });

  return client;
};

// Export individual active client connections for commands vs subscriber listener operations
export const redisConnection = createRedisClient('Main');
export const redisSubscriber = createRedisClient('Subscriber');

class RedisClient {
  static client = redisConnection;
  static subscriber = redisSubscriber;
}

export default RedisClient;
