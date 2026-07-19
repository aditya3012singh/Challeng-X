import RedisClient from "../../core/cache/redis.client.js";
import Database from "../../core/config/db.js";
import UserCache from "../../core/cache/userCache.js";

const GLOBAL_ZSET_KEY = "leaderboard:global:zset";

class LeaderboardService {
  /**
   * Warm up the Redis ZSET for global leaderboard from PostgreSQL
   */
  static async warmUpZSet() {
    try {
      console.log("🏆 [LeaderboardService] Warming up global Redis ZSET...");
      const topUsers = await Database.client.user.findMany({
        take: 1000,
        orderBy: [{ rankPoints: "desc" }, { wins: "desc" }],
        select: { id: true, rankPoints: true }
      });

      if (topUsers.length === 0) return;

      const pipeline = RedisClient.client.pipeline();
      topUsers.forEach(u => {
        pipeline.zadd(GLOBAL_ZSET_KEY, u.rankPoints, u.id);
      });
      await pipeline.exec();
      console.log(`✅ [LeaderboardService] Global ZSET warmed up with ${topUsers.length} users`);
    } catch (err) {
      console.error("[LeaderboardService] ZSET warm-up error:", err.message);
    }
  }

  /**
   * Update a user's score in Redis ZSET (1ms execution)
   */
  static async updateUserRank(userId, rankPoints) {
    try {
      if (!userId || rankPoints === undefined) return;
      await RedisClient.client.zadd(GLOBAL_ZSET_KEY, rankPoints, userId);
      await UserCache.invalidateUser(userId);
    } catch (err) {
      console.error(`[LeaderboardService] updateUserRank error for user ${userId}:`, err.message);
    }
  }

  /**
   * Get Leaderboard (Sub-5ms for GLOBAL filter using Redis ZSET)
   */
  static async getLeaderboard(page = 1, limit = 20, filter = 'GLOBAL', userId = null) {
    if (filter === 'GLOBAL') {
      try {
        const start = (page - 1) * limit;
        const stop = start + limit - 1;

        // 1. Fetch range of user IDs from ZSET in <2ms
        const [userIds, total] = await Promise.all([
          RedisClient.client.zrevrange(GLOBAL_ZSET_KEY, start, stop),
          RedisClient.client.zcard(GLOBAL_ZSET_KEY)
        ]);

        if (userIds && userIds.length > 0) {
          // 2. Fetch user profiles in parallel from UserCache (~2ms)
          const userProfiles = await Promise.all(
            userIds.map(id => UserCache.getUser(id))
          );

          const formattedData = userProfiles.map((user, idx) => {
            if (!user) return null;
            return {
              id: user.id,
              username: user.username || user.name || "Coder",
              rankPoints: user.rankPoints ?? 1000,
              wins: user.wins ?? 0,
              losses: user.losses ?? 0,
              profilePic: user.profilePic || null,
              country: user.country || null,
              region: user.region || null,
              rank: start + idx + 1
            };
          }).filter(Boolean);

          return {
            data: formattedData,
            total,
            page,
            totalPages: Math.ceil(total / limit)
          };
        }
      } catch (zsetErr) {
        console.error("[LeaderboardService] ZSET read warning:", zsetErr.message);
      }
    }

    // Fallback to PostgreSQL or handling REGIONAL / FRIENDS filters
    const skip = (page - 1) * limit;
    let where = {};

    if (filter === 'REGIONAL' && userId) {
      const user = await Database.client.user.findUnique({
        where: { id: userId },
        select: { region: true, country: true }
      });
      if (user?.region) {
        where.region = user.region;
      } else if (user?.country) {
        where.country = user.country;
      }
    } else if (filter === 'FRIENDS' && userId) {
      const friendships = await Database.client.friendRequest.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        select: { senderId: true, receiverId: true }
      });

      const friendIds = friendships.flatMap(f => [f.senderId, f.receiverId]);
      const uniqueFriendIds = [...new Set([...friendIds, userId])];
      where.id = { in: uniqueFriendIds };
    }

    const [users, total] = await Promise.all([
      Database.client.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { rankPoints: "desc" },
          { wins: "desc" }
        ],
        select: {
          id: true,
          username: true,
          rankPoints: true,
          wins: true,
          losses: true,
          profilePic: true,
          country: true,
          region: true
        }
      }),
      Database.client.user.count({ where })
    ]);

    // Populate ZSET if GLOBAL query ran against DB
    if (filter === 'GLOBAL' && users.length > 0) {
      LeaderboardService.warmUpZSet().catch(() => {});
    }

    const formattedData = users.map((user, idx) => ({
      ...user,
      rank: skip + idx + 1
    }));

    return {
      data: formattedData,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default LeaderboardService;