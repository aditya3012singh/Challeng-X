// 🏆 ranking.service.js

import Database from "../config/db.js";

// Updates:

// • Points
// • Win/loss
// • ELO rating // later we will do this


class RankingService {
  static async updateRanks(winnerId, loserId) {

  await Database.client.user.update({
    where: { id: winnerId },
    data: {
      rankPoints: { increment: 30 },
      wins: { increment: 1 }
    }
  });

  await Database.client.user.update({
    where: { id: loserId },
    data: {
      rankPoints: { decrement: 20 },
      losses: { increment: 1 }
    }
  });
  }
}

export default RankingService;
