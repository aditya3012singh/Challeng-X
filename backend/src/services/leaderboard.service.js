import RedisClient from "../cache/redis.client.js";
import Database from "../config/db.js";

class LeaderboardService {
  static async getLeaderboard(page = 1, limit = 20) {

  
//try from the cache first 
  const key = `leaderboard:page:${page}:limit:${limit}`;

  const cached= await RedisClient.client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const skip = (page - 1) * limit; //now fetch from db

  const [users, total] = await Promise.all([
    Database.client.user.findMany({
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
        losses: true
      }
    }),

    Database.client.user.count()
  ]);
  const result={
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };

  //store in cache for future requests
  await RedisClient.client.set(key, JSON.stringify(result), 'EX', 60*5); //cache for 5 minutes
  
  return result;
  }
}

export default LeaderboardService;