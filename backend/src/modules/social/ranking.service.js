// 🏆 ranking.service.js

import Database from "../../core/config/db.js";
import eventBus from "../../core/events/eventBus.js";
import { EventTypes } from "../../core/events/eventTypes.js";

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

    // ✅ PHASE 3B: Emit USER_RANK_UPDATED event (will be handled by Socket listener)
    if (battleId) {
      eventBus.emitEvent(EventTypes.USER_RANK_UPDATED, {
        battleId,
        winner: { id: winnerId, delta: 30 },
        loser: { id: loserId, delta: -20 }
      });
    }
  }
}

export default RankingService;
