import Redis from "ioredis";

class RedisClient {
  static client = new Redis({
    host: "redis",
    port: 6379
  });
}

RedisClient.client.on("connect", () => {
  console.log("✅ Redis connected");
});

RedisClient.client.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

export default RedisClient;