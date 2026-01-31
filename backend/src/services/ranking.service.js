// 🏆 ranking.service.js

import prisma from "../config/db.js";

// Updates:

// • Points
// • Win/loss
// • ELO rating // later we will do this


export async function updateRanks(winnerId, loserId) {

  await prisma.user.update({
    where: { id: winnerId },
    data: {
      rankPoints: { increment: 30 },
      wins: { increment: 1 }
    }
  });

  await prisma.user.update({
    where: { id: loserId },
    data: {
      rankPoints: { decrement: 20 },
      losses: { increment: 1 }
    }
  });
}
