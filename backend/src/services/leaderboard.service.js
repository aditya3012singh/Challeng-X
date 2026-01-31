import prisma from "../config/db.js";

export async function getLeaderboard(limit = 20) {
  return prisma.user.findMany({
    orderBy: [
      { rankPoints: "desc" },
      { wins: "desc" },
    ],
    take: limit,
    select: {
      id: true,
      username: true,
      rankPoints: true,
      wins: true,
      losses: true
    }
  });
}