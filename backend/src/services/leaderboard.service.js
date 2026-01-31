import redis from "../cache/redis.client.js";
import prisma from "../config/db.js";

export async function getLeaderboard(page = 1, limit = 20) {

  
//try from the cache first 
  const key = `leaderboard:page:${page}:limit:${limit}`;

  const cached= await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const skip = (page - 1) * limit; //now fetch from db

  const [users, total] = await Promise.all([
    prisma.user.findMany({
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

    prisma.user.count()
  ]);
  const result={
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };

  //store in cache for future requests
  await redis.set(key, JSON.stringify(result), 'EX', 60*5); //cache for 5 minutes
  
  return result;
}