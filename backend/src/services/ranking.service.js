// 🏆 ranking.service.js

import Database from "../config/db.js";
import SocketEmitter from "../config/socket.js";

// Updates:

// • Points
// • Win/loss
// • ELO rating // later we will do this


class RankingService {
  static async updateRanks(battleId, winnerId, loserId) {

    if (!winnerId || !loserId) return;

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

    if (battleId) {
      SocketEmitter.emitToBattle(battleId, "rating_update", {
        winner: { id: winnerId, delta: 30 },
        loser: { id: loserId, delta: -20 }
      });
    }
  }
}

export default RankingService;
