import RedisClient from "../cache/redis.client.js";
import Database from "../config/db.js";

class LeaderboardService {
  static async getLeaderboard(page = 1, limit = 20, filter = 'GLOBAL', userId = null) {
    const key = `leaderboard:${filter}:user:${userId || 'anon'}:page:${page}:limit:${limit}`;

    try {
      const cached = await RedisClient.client.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error("Redis error in LeaderboardService:", err.message);
    }

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

    const result = {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };

    try {
      await RedisClient.client.set(key, JSON.stringify(result), 'EX', 60 * 5);
    } catch (err) {
      console.error("Redis set error in LeaderboardService:", err.message);
    }

    return result;
  }
}

export default LeaderboardService;