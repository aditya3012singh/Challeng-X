// Controls battle rules:

import RedisClient from "../cache/redis.client.js";
import Database from "../config/db.js";
import RankingService from "./ranking.service.js";
import SocketEmitter from "../config/socket.js";
import BattleCode from "../utils/battleCode.js";
// • Start timer
// • Assign problem
// • End match
// • Decide winner

class BattleService {
  static async createBattleRandomQuestionService(player1Id) {

    const problems = await Database.client.problem.findMany();
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];

    const battleCode = await BattleCode.generateBattleCode();

    const battle = await Database.client.battle.create({
      data: {
        player1Id,
        problemId: randomProblem.id,
        status: "WAITING",
        battleCode,
      }
    });

    return battle;
  }

  static async createBattleWithSelectedQuestionService(player1Id, problemId) {
    const battleCode = await BattleCode.generateBattleCode();

    const battle = await Database.client.battle.create({
      data: {
        player1Id,
        problemId,
        status: "WAITING",
        battleCode,
      }
    });

    return battle;
  }

  static async joinBattleService(battleCode, player2Id) {

    const battleExists = await Database.client.battle.findUnique({
      where: { battleCode }
    });

    if (!battleExists) {
      throw new Error("Battle not available");
    }

    if (battleExists.player1Id === player2Id) {
      throw new Error("Cannot join your own battle");
    }

    if (battleExists.status !== "WAITING") {
      throw new Error("Battle already started");
    }

    if (battleExists.player2Id) {
      throw new Error("Battle already has two players");
    }

    const battle = await Database.client.battle.update({
      where: { battleCode },
      data: {
        player2Id,
        status: "ONGOING",
        startedAt: new Date(),
      }
    });

    SocketEmitter.emitToBattle(battle.id, "playerJoined", {
      playerId: player2Id
    });

    SocketEmitter.emitToBattle(battle.id, "battleStarted", {
      startedAt: new Date()
    });

    return battle;
  }
  //         throw new Error("Cannot join your own battle");
  //     }

  //     if(battleExists.status !== "WAITING"){
  //         throw new Error("Battle already started");
  //     }

  //     if(battleExists.player2Id){
  //         throw new Error("Battle already has two players");
  //     }

  //     const battle = await prisma.battle.update({
  //         where: { id: battleId },
  //         data: {
  //             player2Id,
  //             status: "ONGOING",
  //             startedAt: new Date(),
  //         }
  //     });

  //     emitToBattle(battleId, "playerJoined", {
  //       playerId: player2Id
  //     });

  //     emitToBattle(battleId, "battleStarted", {
  //       startedAt: new Date()
  //     });

  //     return battle;
  // }

  static async getBattle(battleId) {
    const battle = await Database.client.battle.findUnique({
      where: { id: battleId },
      include: {
        problem: {
          select: {
            id: true, title: true, difficulty: true, description: true, timeLimitMs: true, testcases: true
          }
        },
        player1: { select: { id: true, username: true, email: true } },
        player2: { select: { id: true, username: true, email: true } },
      }
    });
    // Add winner details if available
    let winner = null;
    if (battle.winnerId) {
      if (battle.player1 && battle.player1.id === battle.winnerId) winner = battle.player1;
      else if (battle.player2 && battle.player2.id === battle.winnerId) winner = battle.player2;
    }
    return {
      ...battle,
      player1: battle.player1,
      player2: battle.player2,
      winner,
    };
  }

  static async finishBattleService(battleId, winnerId) {
    const battle = await Database.client.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle || battle.status === "FINISHED") return null;

    // 1. Update status synchronously
    const battleResult = await Database.client.battle.update({
      where: { id: battleId },
      data: {
        status: "FINISHED",
        endedAt: new Date(),
        winnerId,
      }
    });

    // 2. Perform background tasks (ranking, cache flush)
    (async () => {
      try {
        const loserId = (battle.player1Id === winnerId) ? battle.player2Id : battle.player1Id;
        await RankingService.updateRanks(winnerId, loserId);
        await RedisClient.client.flushall();
        console.log(`✅ Background ranking and cache flush completed for battle ${battleId}`);
      } catch (err) {
        console.error(`❌ Background task error for battle ${battleId}:`, err.message);
      }
    })();

    return battleResult;
  }

  static async incrementBattleAttempt(battleId, userId) {
    const battle = await Database.client.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle) return;

    const data = {};
    if (battle.player1Id === userId) {
      data.attemptsPlayer1 = { increment: 1 };
    } else if (battle.player2Id === userId) {
      data.attemptsPlayer2 = { increment: 1 };
    }

    const updatedBattle = await Database.client.battle.update({
      where: { id: battleId },
      data,
      include: { player1: true, player2: true }
    });

    // Notify listeners about the attempt update
    SocketEmitter.emitToBattle(battleId, "attemptsUpdated", {
      player1Attempts: updatedBattle.attemptsPlayer1,
      player2Attempts: updatedBattle.attemptsPlayer2
    });

    // Check if both players have failed 3 times
    if (updatedBattle.attemptsPlayer1 >= 3 && updatedBattle.attemptsPlayer2 >= 3) {
      // Check if battle is still ongoing (nobody passed)
      if (updatedBattle.status === "ONGOING") {
        await this.handleDoubleFailure(battleId, updatedBattle.player1Id, updatedBattle.player2Id);
      }
    }

    return updatedBattle;
  }

  static async handleDoubleFailure(battleId, p1Id, p2Id) {
    console.log(`💀 Double failure in battle ${battleId}. Ending with penalties...`);

    await Database.client.battle.update({
      where: { id: battleId },
      data: {
        status: "FINISHED",
        endedAt: new Date(),
        winnerId: null // No winner
      }
    });

    // Apply penalties to BOTH players
    (async () => {
      try {
        // Custom ranking reduction for double failure
        await Database.client.user.updateMany({
          where: { id: { in: [p1Id, p2Id] } },
          data: {
            rankPoints: { decrement: 50 },
            losses: { increment: 1 }
          }
        });
        await RedisClient.client.flushall();
        SocketEmitter.emitToBattle(battleId, "battleFinished", { winnerId: null, draw: true });
        console.log(`✅ Double failure penalties applied for battle ${battleId}`);
      } catch (err) {
        console.error(`❌ handleDoubleFailure error: ${err.message}`);
      }
    })();
  }

  static async getRemainingAttempts(battleId, userId) {
    const battle = await Database.client.battle.findUnique({
      where: { id: battleId },
      select: { player1Id: true, player2Id: true, attemptsPlayer1: true, attemptsPlayer2: true }
    });
    if (!battle) return 3;
    const used = battle.player1Id === userId ? battle.attemptsPlayer1 : battle.attemptsPlayer2;
    return Math.max(0, 3 - used);
  }

  static async getBattleHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const battles = await Database.client.battle.findMany({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ],
        status: "FINISHED"
      },
      skip,
      take: limit,
      orderBy: {
        endedAt: "desc"
      },
      include: {
        problem: {
          select: {
            title: true,
            difficulty: true
          }
        },
        player1: {
          select: { username: true }
        },
        player2: {
          select: { username: true }
        }
      }
    });

    const total = await Database.client.battle.count({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ],
        status: "FINISHED"
      }
    });

    return {
      data: battles,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default BattleService;
