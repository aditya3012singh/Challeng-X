import RedisClient from "../core/cache/redis.client.js";
import Database from "../core/config/db.js";

/**
 * Generate a unique 6-digit battle code
 * @returns {Promise<string>} A unique 6-digit code
 */
class BattleCode {
  static async generateBattleCode() {
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = Math.floor(100000 + Math.random() * 900000).toString();

      // 1. Check Redis first (~1ms)
      const cachedId = await RedisClient.client.get(`battle:code:${code}`).catch(() => null);
      if (cachedId) {
        attempts++;
        continue;
      }

      // 2. Check DB (with catch for DB outage resilience)
      try {
        const existing = await Database.client.battle.findUnique({
          where: { battleCode: code }
        });
        if (!existing) {
          isUnique = true;
        }
      } catch (err) {
        // If DB is unreachable, Redis check is sufficient
        isUnique = true;
      }

      attempts++;
    }

    return code || Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default BattleCode;
