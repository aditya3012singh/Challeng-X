import Redis from "ioredis";

class RedisClient {
  static client = new Redis({
    host: "127.0.0.1",
    port: 6379
  });
}

RedisClient.client.on("connect", () => {
  console.log("✅ Redis connected");
});

export default RedisClient;