// Controls battle rules:

import RedisClient from "../../core/cache/redis.client.js";
import Database from "../../core/config/db.js";
import BattleCode from "../../utils/battleCode.js";
import S3Service from "../../integrations/s3/s3.service.js";
import ProblemCache from "../../core/cache/problemCache.js";
import AISimulatorService from "../ai/ai.simulator.js";
import AIService from "../ai/ai.service.js";
import env from "../../core/config/env.js";
// ✅ PHASE 1: Import event bus
import eventBus from "../../core/events/eventBus.js";
import { EventTypes } from "../../core/events/eventTypes.js";
// • Start timer
// • Assign problem
// • End match
// • Decide winner

class BattleService {
  static async createBattleRandomQuestionService(player1Id) {
    // Get random problem from cache
    const randomProblem = await ProblemCache.getRandomProblemByDifficulty(null);

    if (!randomProblem) {
      // Fallback to DB if cache is empty
      const problems = await Database.client.problem.findMany();
      if (problems.length === 0) {
        throw new Error("No problems available");
      }
      const randomProblemFromDB = problems[Math.floor(Math.random() * problems.length)];
      
      // Cache the problem for future use
      await ProblemCache.cacheProblem(randomProblemFromDB);
      
      const battleCode = await BattleCode.generateBattleCode();

      const battle = await Database.client.battle.create({
        data: {
          player1Id,
          problemId: randomProblemFromDB.id,
          status: "WAITING",
          battleCode,
        }
      });

      // Pre-cache hidden test cases asynchronously to speed up the first submission
      S3Service.fetchHiddenTestCases(randomProblemFromDB.id).catch(err => 
        console.error(`[Pre-cache] Failed for problem ${randomProblemFromDB.id}:`, err.message)
      );

      return battle;
    }

    const battleCode = await BattleCode.generateBattleCode();

    const battle = await Database.client.battle.create({
      data: {
        player1Id,
        problemId: randomProblem.id,
        status: "WAITING",
        battleCode,
      }
    });

    // Pre-cache hidden test cases asynchronously to speed up the first submission
    S3Service.fetchHiddenTestCases(randomProblem.id).catch(err => 
      console.error(`[Pre-cache] Failed for problem ${randomProblem.id}:`, err.message)
    );

    return battle;
  }

  static async createBattleWithSelectedQuestionService(player1Id, problemId) {
    // Get problem from cache
    let problem = await ProblemCache.getProblem(problemId);
    
    if (!problem) {
      // Fallback to DB if not in cache
      problem = await Database.client.problem.findUnique({
        where: { id: problemId },
        include: { testcases: true, tags: true }
      });
      
      if (!problem) {
        throw new Error("Problem not found");
      }
      
      // Cache the problem for future use
      await ProblemCache.cacheProblem(problem);
    }

    const battleCode = await BattleCode.generateBattleCode();

    const battle = await Database.client.battle.create({
      data: {
        player1Id,
        problemId: problemId,
        status: "WAITING",
        battleCode,
      }
    });

    // Pre-cache hidden test cases asynchronously to speed up the first submission
    S3Service.fetchHiddenTestCases(problemId).catch(err => 
      console.error(`[Pre-cache] Failed for problem ${problemId}:`, err.message)
    );

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

    // Emit battle_joined event via eventBus
    eventBus.emitEvent(EventTypes.BATTLE_SOCKET_JOINED, {
      battleId: battle.id,
      playerId: player2Id
    });

    // Emit battle_countdown event via eventBus
    eventBus.emitEvent(EventTypes.BATTLE_SOCKET_COUNTDOWN, {
      battleId: battle.id,
      seconds: 5
    });

    // ✅ PHASE 3B: Emit BATTLE_STATE_CHANGED event (will be handled by Socket listener)
    eventBus.emitEvent(EventTypes.BATTLE_STATE_CHANGED, {
      battleId: battle.id,
      oldState: 'WAITING',
      newState: 'COUNTDOWN',
      metadata: { seconds: 5 }
    });

    setTimeout(async () => {
      try {
        await Database.client.battle.update({
          where: { id: battle.id },
          data: { status: "ONGOING", startedAt: new Date() }
        });
        
        // ✅ PHASE 3B: Emit BATTLE_STATE_CHANGED event
        eventBus.emitEvent(EventTypes.BATTLE_STATE_CHANGED, {
          battleId: battle.id,
          oldState: 'COUNTDOWN',
          newState: 'ONGOING',
          metadata: { startedAt: new Date() }
        });
        
        // Emit battle_start event via eventBus
        eventBus.emitEvent(EventTypes.BATTLE_SOCKET_STARTED, {
          battleId: battle.id,
          startedAt: new Date()
        });

        // Setup battle timeout (e.g., 30 minutes = 1,800,000 ms)
        setTimeout(async () => {
          try {
            const b = await Database.client.battle.findUnique({ where: { id: battle.id } });
            if (b && b.status === "ONGOING") {
              const result = await BattleService.finishBattleService(battle.id, null); // draw
              if (result) {
                // Emit battle_timeout event via eventBus
                eventBus.emitEvent(EventTypes.BATTLE_SOCKET_TIMEOUT, {
                  battleId: battle.id,
                  draw: true
                });
                
                // Emit battle_end event via eventBus
                eventBus.emitEvent(EventTypes.BATTLE_SOCKET_END, {
                  battleId: battle.id,
                  winnerId: null,
                  draw: true
                });
              }
            }
          } catch (e) {
            console.error("Timeout handler error:", e.message);
          }
        }, 1800000); // 30 mins

        // 👻 Trigger AI Ghost Simulation if player2 is a Ghost
        const ghost = await Database.client.user.findUnique({ 
          where: { id: player2Id },
          select: { username: true }
        });
        if (ghost?.username === "CHALLENGX_GHOST") {
          const b = await Database.client.battle.findUnique({ 
            where: { id: battle.id },
            include: { problem: true }
          });
          AISimulatorService.startSimulation(battle.id, player2Id, b.problem.difficulty);
        }

        // 🎙️ Live AI Commentary for Spectators
        BattleService.startCommentaryTimer(battle.id);
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

  static async getBattle(battleId, userId = null) {
    let battle = await Database.client.battle.findUnique({
      where: { id: battleId },
      include: {
        problem: {
          select: {
            id: true, title: true, difficulty: true, description: true, timeLimitMs: true,
            hints: true,
            tags: { select: { name: true } },
            userHints: userId ? { where: { 
              userId,
              battleId: battleId
            }, select: { hintIndex: true } } : undefined,
            testcases: {
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

    let isTeamMatch = false;

    // If not found in 1v1 Battle, check TeamBattleMatch
    if (!battle) {
      const teamMatch = await Database.client.teamBattleMatch.findUnique({
        where: { id: battleId },
        include: {
          problem: {
            select: {
              id: true, title: true, difficulty: true, description: true, timeLimitMs: true,
              hints: true,
              tags: { select: { name: true } },
              userHints: userId ? { where: { 
                userId,
                OR: [
                  { battleId: undefined },
                  { teamBattleMatchId: battle.teamBattleId ? battle.id : undefined }
                ]
              }, select: { hintIndex: true } } : undefined,
              testcases: {
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
          teamBattle: true,
        }
      });

      if (teamMatch) {
        isTeamMatch = true;
        // Map TeamBattleMatch to Battle structure
        battle = {
          ...teamMatch,
          endedAt: teamMatch.completedAt, // Normalize field name
          battleCode: teamMatch.teamBattle.battleCode, // Use parent battle code
        };
      }
    }

    if (!battle) {
      throw new Error("Battle not found");
    }

    // Redact hints
    if (battle.problem) {
      const unlockedIndices = battle.problem.userHints?.map(uh => uh.hintIndex) || [];
      battle.problem.hints = battle.problem.hints.map((h, i) => unlockedIndices.includes(i) ? h : null);
    }

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
      isTeamMatch,
    };
  }

  static async getLiveBattlesService() {
    // Fetch all currently active battles for the live spectator directory
    const liveBattles = await Database.client.battle.findMany({
      where: {
        OR: [
          { status: "ONGOING" },
          { status: "COUNTDOWN" }
        ]
      },
      orderBy: {
        startedAt: "desc"
      },
      take: 20, // Limit to 20 most recent active battles to prevent payload bloat
      include: {
        problem: {
          select: { title: true, difficulty: true }
        },
        player1: {
          select: { id: true, username: true }
        },
        player2: {
          select: { id: true, username: true }
        }
      }
    });

    return liveBattles;
  }

  static async incrementBattleAttempt(battleId, userId) {
    let battle = await Database.client.battle.findUnique({
      where: { id: battleId }
    });

    let isTeamMatch = false;
    if (!battle) {
      battle = await Database.client.teamBattleMatch.findUnique({
        where: { id: battleId }
      });
      if (battle) isTeamMatch = true;
    }

    if (!battle) return;

    const data = {};
    if (battle.player1Id === userId) {
      data.attemptsPlayer1 = { increment: 1 };
    } else if (battle.player2Id === userId) {
      data.attemptsPlayer2 = { increment: 1 };
    }

    let updatedBattle;
    if (isTeamMatch) {
      updatedBattle = await Database.client.teamBattleMatch.update({
        where: { id: battleId },
        data,
      });
    } else {
      updatedBattle = await Database.client.battle.update({
        where: { id: battleId },
        data,
      });
    }

    // Notify listeners about the attempt update via eventBus
    eventBus.emitEvent(EventTypes.BATTLE_SOCKET_ATTEMPTS_UPDATED, {
      battleId,
      player1Attempts: updatedBattle.attemptsPlayer1 || 0,
      player2Attempts: updatedBattle.attemptsPlayer2 || 0
    });

    return updatedBattle;
  }

  static async finishBattleService(battleId, winnerId) {
    try {
      // Try Battle first
      let battleResult = await Database.client.battle.findUnique({ where: { id: battleId } });
      let isTeamMatch = false;
      
      if (!battleResult) {
        battleResult = await Database.client.teamBattleMatch.findUnique({ where: { id: battleId } });
        if (battleResult) isTeamMatch = true;
      }

      if (!battleResult) return null;

      if (isTeamMatch) {
        battleResult = await Database.client.teamBattleMatch.update({
          where: { id: battleId, status: "ONGOING" },
          data: {
            status: "FINISHED",
            completedAt: new Date(),
            winnerId,
          },
          include: { player1: true, player2: true }
        });
      } else {
        battleResult = await Database.client.battle.update({
          where: { id: battleId, status: "ONGOING" },
          data: {
            status: "FINISHED",
            endedAt: new Date(),
            winnerId,
          },
          include: { player1: true, player2: true }
        });
      }

      // 👻 Stop AI Simulation if it was active
      AISimulatorService.stopSimulation(battleId);

      // ✅ Emit BATTLE_FINISHED for all non-team battles (including draws)
      if (!isTeamMatch) {
        const loserId = winnerId
          ? (battleResult.player1Id === winnerId ? battleResult.player2Id : battleResult.player1Id)
          : null;

        // Get problem details for event
        const battle = await Database.client.battle.findUnique({
          where: { id: battleId },
          include: { problem: true }
        });

        eventBus.emitEvent(EventTypes.BATTLE_FINISHED, {
          battleId,
          winnerId: winnerId || null,
          loserId,
          problemId: battle?.problemId,
          difficulty: battle?.problem?.difficulty,
          duration: battle?.startedAt ? Date.now() - battle.startedAt.getTime() : 0,
          player1Attempts: battleResult.attemptsPlayer1 || 0,
          player2Attempts: battleResult.attemptsPlayer2 || 0
        });
      }

      // ✅ PHASE 3B: Removed RankingService call - now handled by Profile listener
      // Perform background tasks (cache flush)
      (async () => {
        try {
          // ✅ PHASE 4: Removed RewardService call - now handled by Reward listener
          // Reward granting is triggered by BATTLE_FINISHED event
          await RedisClient.client.del("problems:all");
          console.log(`✅ ${isTeamMatch ? 'Team ' : ''}Battle Finish: ${battleId} (Winner: ${winnerId})`);
        } catch (err) {
          console.error(`❌ Background task error for battle ${battleId}:`, err.message);
        }
      })();

      return battleResult;
    } catch (error) {
      console.log(`ℹ️ Battle ${battleId} already finished or record missing. Ignoring winner ${winnerId}.`);
      return null;
    }
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

        // ✅ Invalidate cache for both players so stale rankPoints aren't served
        const { default: UserCache } = await import("../../core/cache/userCache.js");
        await UserCache.invalidateUser(p1Id);
        await UserCache.invalidateUser(p2Id);

        await RedisClient.client.del("problems:all");
        // Emit battle_end event via eventBus
        eventBus.emitEvent(EventTypes.BATTLE_SOCKET_END, {
          battleId,
          winnerId: null,
          draw: true
        });
        console.log(`✅ Double failure penalties applied for battle ${battleId}`);
      } catch (err) {
        console.error(`❌ handleDoubleFailure error: ${err.message}`);
      }
    })();
  }

  static async forfeitBattle(battleId, forfeiterId) {
    let battle = await Database.client.battle.findUnique({
      where: { id: battleId },
      include: { player1: true, player2: true }
    });

    let isTeamMatch = false;
    if (!battle) {
      battle = await Database.client.teamBattleMatch.findUnique({
        where: { id: battleId },
        include: { player1: true, player2: true }
      });
      if (battle) isTeamMatch = true;
    }

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
      // Emit battle_end event via eventBus
      eventBus.emitEvent(EventTypes.BATTLE_SOCKET_END, {
        battleId,
        winnerId,
        draw: false
      });
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

  static async startCommentaryTimer(battleId) {
    const interval = setInterval(async () => {
      try {
        const battle = await Database.client.battle.findUnique({
          where: { id: battleId },
          include: { player1: true, player2: true, problem: true }
        });

        if (!battle || battle.status !== "ONGOING") {
          clearInterval(interval);
          return;
        }

        // Get current progress for both players
        const p1Progress = await Database.client.submission.count({ 
          where: { battleId, userId: battle.player1Id, status: "PASSED" } 
        });
        const p2Progress = await Database.client.submission.count({ 
          where: { battleId, userId: battle.player2Id, status: "PASSED" } 
        });

        const commentary = await AIService.generateLiveComment(
          { username: battle.player1.username, progress: p1Progress },
          { username: battle.player2?.username || "Awaiting...", progress: p2Progress },
          battle.problem
        );

        // Emit battle_commentary event via eventBus
        eventBus.emitEvent(EventTypes.BATTLE_SOCKET_COMMENTARY, {
          battleId,
          commentary,
          timestamp: new Date()
        });
      } catch (err) {
        console.error("AI Commentary Error:", err.message);
      }
    }, 45000); // Every 45 seconds
  }
}

export default BattleService;
