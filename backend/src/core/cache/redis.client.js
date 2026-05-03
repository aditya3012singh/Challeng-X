import Redis from "ioredis";
import env from "../config/env.js";
import logger from "../logger/logger.js";

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
};

class RedisClient {
  static client = env.REDIS_URL ? new Redis(env.REDIS_URL, redisConfig) : new Redis(redisConfig);
}

RedisClient.client.on("connect", () => {
  logger.info("✅ Redis connected");
});

RedisClient.client.on("error", (err) => {
  logger.error("❌ Redis error:", err);
});

export default RedisClient;
