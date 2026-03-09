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
        status: "COUNTDOWN",
        startedAt: new Date(),
      }
    });

    SocketEmitter.emitToBattle(battle.id, "battle_joined", {
      playerId: player2Id
    });

    SocketEmitter.emitToBattle(battle.id, "battle_countdown", {
      seconds: 5
    });

    setTimeout(async () => {
      try {
        await Database.client.battle.update({
          where: { id: battle.id },
          data: { status: "ONGOING", startedAt: new Date() }
        });
        SocketEmitter.emitToBattle(battle.id, "battle_start", {
          startedAt: new Date()
        });

        // Setup battle timeout (e.g., 30 minutes = 1,800,000 ms)
        setTimeout(async () => {
          try {
            const b = await Database.client.battle.findUnique({ where: { id: battle.id } });
            if (b && b.status === "ONGOING") {
              const result = await BattleService.finishBattleService(battle.id, null); // draw
              if (result) {
                SocketEmitter.emitToBattle(battle.id, "battle_timeout", { draw: true });
                SocketEmitter.emitToBattle(battle.id, "battle_end", { winnerId: null, draw: true });
              }
            }
          } catch (e) {
            console.error("Timeout handler error:", e.message);
          }
        }, 1800000); // 30 mins
      } catch (e) {
        console.error("Countdown handler error:", e.message);
      }
    }, 5000);

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
            id: true, title: true, difficulty: true, description: true, timeLimitMs: true, testcases: {
              where: {
                OR: [
                  { isHidden: false },
                  { isSample: true }
                ]
              }
            }
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
    // Atomic update: only transition if still ONGOING
    // This prevents race conditions where two players pass at the same time
    try {
      const battleResult = await Database.client.battle.update({
        where: {
          id: battleId,
          status: "ONGOING" // Essential for atomicity
        },
        data: {
          status: "FINISHED",
          endedAt: new Date(),
          winnerId,
        },
        include: { player1: true, player2: true }
      });

      // Perform background tasks (ranking, cache flush)
      (async () => {
        try {
          if (winnerId) {
            const loserId = (battleResult.player1Id === winnerId) ? battleResult.player2Id : battleResult.player1Id;
            await RankingService.updateRanks(battleId, winnerId, loserId);
          }
          await RedisClient.client.flushall();
          console.log(`✅ Atomic Battle Finish: ${battleId} (Winner: ${winnerId})`);
        } catch (err) {
          console.error(`❌ Background task error for battle ${battleId}:`, err.message);
        }
      })();

      return battleResult;
    } catch (error) {
      // P2025 is Prisma's "Record to update not found" error,
      // which happens here if status is already FINISHED.
      console.log(`ℹ️ Battle ${battleId} already finished or record missing. Ignoring winner ${winnerId}.`);
      return null;
    }
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
    SocketEmitter.emitToBattle(battleId, "attempts_updated", {
      player1Attempts: updatedBattle.attemptsPlayer1,
      player2Attempts: updatedBattle.attemptsPlayer2
    });

    // Check if both players have failed 10 times
    if (updatedBattle.attemptsPlayer1 >= 10 && updatedBattle.attemptsPlayer2 >= 10) {
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
        SocketEmitter.emitToBattle(battleId, "battle_end", { winnerId: null, draw: true });
        console.log(`✅ Double failure penalties applied for battle ${battleId}`);
      } catch (err) {
        console.error(`❌ handleDoubleFailure error: ${err.message}`);
      }
    })();
  }

  static async forfeitBattle(battleId, forfeiterId) {
    const battle = await Database.client.battle.findUnique({
      where: { id: battleId },
      include: { player1: true, player2: true }
    });

    if (!battle || battle.status === "FINISHED") {
      return null;
    }

    // Determine the winner (the other person)
    const winnerId = (battle.player1Id === forfeiterId) ? battle.player2Id : battle.player1Id;

    // If there's no opponent yet (battle is WAITING), just cancel it
    if (!winnerId) {
      return await Database.client.battle.update({
        where: { id: battleId },
        data: { status: "FINISHED", winnerId: null }
      });
    }

    // Atomically finish the battle
    const result = await this.finishBattleService(battleId, winnerId);

    if (result) {
      SocketEmitter.emitToBattle(battleId, "battle_end", { winnerId, draw: false });
    }

    return result;
  }

  static async getRemainingAttempts(battleId, userId) {
    const battle = await Database.client.battle.findUnique({
      where: { id: battleId },
      select: { player1Id: true, player2Id: true, attemptsPlayer1: true, attemptsPlayer2: true }
    });
    if (!battle) return 10;
    const used = battle.player1Id === userId ? battle.attemptsPlayer1 : battle.attemptsPlayer2;
    return Math.max(0, 10 - used);
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
