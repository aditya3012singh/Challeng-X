import crypto from "crypto";
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

class BattleService {
  static async createBattleRandomQuestionService(player1Id) {
    let randomProblem = await ProblemCache.getRandomProblemByDifficulty(null);

    if (!randomProblem) {
      const problems = await Database.client.problem.findMany();
      if (problems.length === 0) {
        throw new Error("No problems available");
      }
      randomProblem = problems[Math.floor(Math.random() * problems.length)];
      await ProblemCache.cacheProblem(randomProblem);
    }

    const battleId = crypto.randomUUID();
    const battleCode = await BattleCode.generateBattleCode();

    const battleData = {
      id: battleId,
      battleCode,
      player1Id,
      problemId: randomProblem.id,
      status: "WAITING",
      createdAt: new Date(),
      problem: randomProblem
    };

    // Cache metadata & 6-digit battleCode lookup in Redis (~2ms)
    RedisClient.client.set(`battle:meta:${battleId}`, JSON.stringify(battleData), "EX", 86400).catch(() => {});
    RedisClient.client.set(`battle:code:${battleCode}`, battleId, "EX", 86400).catch(() => {});

    // Pre-cache hidden test cases asynchronously
    S3Service.fetchHiddenTestCases(randomProblem.id).catch(err => 
      console.error(`[Pre-cache] Failed for problem ${randomProblem.id}:`, err.message)
    );

    // Asynchronously write to PostgreSQL in background with Tier 1 (3x Retries) & Tier 3 (Redis DLQ)
    (async () => {
      let attempts = 0;
      while (attempts < 3) {
        try {
          attempts++;
          await Database.client.battle.create({
            data: { id: battleId, player1Id, problemId: randomProblem.id, status: "WAITING", battleCode }
          });
          return;
        } catch (err) {
          if (attempts < 3) await new Promise(res => setTimeout(res, attempts * 1000));
        }
      }
      RedisClient.client.rpush("battle:dlq:failed_creations", JSON.stringify(battleData)).catch(() => {});
    })();

    return battleData;
  }

  static async createBattleWithSelectedQuestionService(player1Id, problemId) {
    let problem = await ProblemCache.getProblem(problemId);
    
    if (!problem) {
      problem = await Database.client.problem.findUnique({
        where: { id: problemId },
        include: { testcases: true, tags: true }
      });
      
      if (!problem) {
        throw new Error("Problem not found");
      }
      
      await ProblemCache.cacheProblem(problem);
    }

    const battleId = crypto.randomUUID();
    const battleCode = await BattleCode.generateBattleCode();

    const battleData = {
      id: battleId,
      battleCode,
      player1Id,
      problemId: problem.id,
      status: "WAITING",
      createdAt: new Date(),
      problem
    };

    // Cache metadata & 6-digit battleCode lookup in Redis (~2ms)
    RedisClient.client.set(`battle:meta:${battleId}`, JSON.stringify(battleData), "EX", 86400).catch(() => {});
    RedisClient.client.set(`battle:code:${battleCode}`, battleId, "EX", 86400).catch(() => {});

    // Pre-cache hidden test cases asynchronously
    S3Service.fetchHiddenTestCases(problem.id).catch(err => 
      console.error(`[Pre-cache] Failed for problem ${problem.id}:`, err.message)
    );

    // Asynchronously write to PostgreSQL in background with Tier 1 (3x Retries) & Tier 3 (Redis DLQ)
    (async () => {
      let attempts = 0;
      while (attempts < 3) {
        try {
          attempts++;
          await Database.client.battle.create({
            data: { id: battleId, player1Id, problemId: problem.id, status: "WAITING", battleCode }
          });
          return;
        } catch (err) {
          if (attempts < 3) await new Promise(res => setTimeout(res, attempts * 1000));
        }
      }
      RedisClient.client.rpush("battle:dlq:failed_creations", JSON.stringify(battleData)).catch(() => {});
    })();

    return battleData;
  }

  static async joinBattleService(battleCode, player2Id) {
    // 1. Resolve battleId from Redis battleCode lookup (fallback to DB)
    let battleId = await RedisClient.client.get(`battle:code:${battleCode}`);
    let battle = null;

    if (battleId) {
      battle = await BattleService.getBattle(battleId).catch(() => null);
    }

    if (!battle) {
      battle = await Database.client.battle.findUnique({ where: { battleCode } });
      if (battle) battleId = battle.id;
    }

    if (!battle) {
      throw new Error("Battle not available");
    }

    if (battle.player1Id === player2Id) {
      throw new Error("Cannot join your own battle");
    }

    if (battle.status !== "WAITING") {
      throw new Error("Battle already started");
    }

    if (battle.player2Id) {
      throw new Error("Battle already has two players");
    }

    const startedAt = new Date();

    // 2. Immediately update Redis metadata (status: COUNTDOWN)
    const updatedMeta = {
      ...battle,
      player2Id,
      status: "COUNTDOWN",
      startedAt
    };

    RedisClient.client.set(`battle:meta:${battleId}`, JSON.stringify(updatedMeta), "EX", 86400).catch(() => {});

    // 3. Emit socket events in 0ms
    eventBus.emitEvent(EventTypes.BATTLE_SOCKET_JOINED, { battleId, playerId: player2Id });
    eventBus.emitEvent(EventTypes.BATTLE_SOCKET_COUNTDOWN, { battleId, seconds: 5 });
    eventBus.emitEvent(EventTypes.BATTLE_STATE_CHANGED, {
      battleId,
      oldState: 'WAITING',
      newState: 'COUNTDOWN',
      metadata: { seconds: 5 }
    });

    // 4. Asynchronously update DB in background
    Database.client.battle.update({
      where: { battleCode },
      data: { player2Id, status: "COUNTDOWN", startedAt }
    }).catch(err => console.error(`[Async Join DB Write Error] ${err.message}`));

    // 5. Schedule 5s ONGOING transition
    setTimeout(async () => {
      try {
        const ongoingMeta = { ...updatedMeta, status: "ONGOING", startedAt: new Date() };
        RedisClient.client.set(`battle:meta:${battleId}`, JSON.stringify(ongoingMeta), "EX", 86400).catch(() => {});

        Database.client.battle.update({
          where: { id: battleId },
          data: { status: "ONGOING", startedAt: ongoingMeta.startedAt }
        }).catch(err => console.error(`[Async ONGOING DB Write Error] ${err.message}`));

        eventBus.emitEvent(EventTypes.BATTLE_STATE_CHANGED, {
          battleId,
          oldState: 'COUNTDOWN',
          newState: 'ONGOING',
          metadata: { startedAt: ongoingMeta.startedAt }
        });

        eventBus.emitEvent(EventTypes.BATTLE_SOCKET_STARTED, {
          battleId,
          startedAt: ongoingMeta.startedAt
        });

        // 👻 Trigger AI Ghost Simulation if player2 is a Ghost
        const ghost = await Database.client.user.findUnique({ 
          where: { id: player2Id },
          select: { username: true }
        }).catch(() => null);

        if (ghost?.username === "CHALLENGX_GHOST") {
          AISimulatorService.startSimulation(battleId, player2Id, ongoingMeta.problem?.difficulty || "EASY");
        }

        // 🎙️ Live AI Commentary for Spectators
        BattleService.startCommentaryTimer(battleId);
      } catch (err) {
        console.error(`[ONGOING Transition Error] ${err.message}`);
      }
    }, 5000);

    return updatedMeta;
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


  static async getBattle(battleId, userId = null) {
    const cacheKey = `battle:meta:${battleId}`;
    try {
      const cached = await RedisClient.client.get(cacheKey);
      if (cached) {
        console.log(`⚡ [Redis HIT] getBattle for battleId=${battleId}`);
        const cachedBattle = JSON.parse(cached);
        // Redact hints dynamically per-user
        if (cachedBattle.problem && Array.isArray(cachedBattle.problem.hints)) {
          const unlockedIndices = cachedBattle.problem.userHints?.map(uh => uh.hintIndex) || [];
          cachedBattle.problem.hints = cachedBattle.problem.hints.map((h, i) => unlockedIndices.includes(i) ? h : null);
        }
        return cachedBattle;
      } else {
        console.log(`🐢 [Redis MISS] getBattle for battleId=${battleId} - Fetching from DB`);
      }
    } catch (err) {
      console.error(`[RedisCache] getBattle cache read error: ${err.message}`);
    }

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
                teamBattleMatchId: battleId
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
          team1: { include: { members: { include: { user: true } } } },
          team2: { include: { members: { include: { user: true } } } },
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

    const result = {
      ...battle,
      player1: battle.player1,
      player2: battle.player2,
      winner,
      isTeamMatch,
    };

    if (result) {
      try {
        await RedisClient.client.set(cacheKey, JSON.stringify(result), "EX", 86400); // 24 Hours TTL for all statuses
        console.log(`💾 [Redis SET] Cached metadata for battleId=${battleId} (status=${result.status})`);
      } catch (err) {
        console.error(`[RedisCache] getBattle cache set error: ${err.message}`);
      }
    }

    return result;
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

      // 🛡️ Tier 2: Upsert Failsafe if DB row was missing/failed during creation
      if (!battleResult) {
        const cachedMeta = await RedisClient.client.get(`battle:meta:${battleId}`);
        if (cachedMeta) {
          const cached = JSON.parse(cachedMeta);
          console.log(`🛡️ [Tier 2 Upsert Failsafe] Creating missing battle ${battleId} directly as FINISHED in DB`);
          battleResult = await Database.client.battle.upsert({
            where: { id: battleId },
            create: {
              id: battleId,
              battleCode: cached.battleCode || battleId.substring(0, 6),
              player1Id: cached.player1Id || cached.player1?.id,
              player2Id: cached.player2Id || cached.player2?.id,
              problemId: cached.problemId || cached.problem?.id,
              status: "FINISHED",
              startedAt: cached.startedAt ? new Date(cached.startedAt) : new Date(),
              endedAt: new Date(),
              winnerId: winnerId || null
            },
            update: {
              status: "FINISHED",
              endedAt: new Date(),
              winnerId: winnerId || null
            },
            include: { player1: true, player2: true }
          });
        }
      }

      if (!battleResult) return null;

      if (battleResult.status !== "FINISHED") {
        if (isTeamMatch) {
          battleResult = await Database.client.teamBattleMatch.update({
            where: { id: battleId },
            data: {
              status: "FINISHED",
              completedAt: new Date(),
              winnerId,
            },
            include: { player1: true, player2: true }
          });
        } else {
          battleResult = await Database.client.battle.update({
            where: { id: battleId },
            data: {
              status: "FINISHED",
              endedAt: new Date(),
              winnerId,
            },
            include: { player1: true, player2: true }
          });
        }
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

      // Perform background tasks (cache flush)
      (async () => {
        try {
          await RedisClient.client.del("problems:all");
          await RedisClient.client.del(`battle:meta:${battleId}`);
          // Pre-warm the cache with the finished battle metadata
          BattleService.getBattle(battleId).catch(() => {});
          console.log(`✅ ${isTeamMatch ? 'Team ' : ''}Battle Finish: ${battleId} (Winner: ${winnerId})`);
        } catch (err) {
          console.error(`❌ Background task error for battle ${battleId}:`, err.message);
        }
      })();

      return battleResult;
    } catch (error) {
      console.error(`🚨 [Tier 3 Redis DLQ] DB update failed for battle ${battleId}: ${error.message}. Pushing to DLQ queue...`);
      try {
        await RedisClient.client.rpush("battle:dlq:failed_persists", JSON.stringify({
          battleId,
          winnerId,
          timestamp: Date.now()
        }));
      } catch (dlqErr) {
        console.error(`❌ [DLQ Fatal] Could not write to Redis DLQ: ${dlqErr.message}`);
      }
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
        await RedisClient.client.del(`battle:meta:${battleId}`);
        BattleService.getBattle(battleId).catch(() => {});
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
    // 1. Fetch battle from Redis cache first (fallback to DB)
    let battle = await BattleService.getBattle(battleId).catch(() => null);

    if (!battle) {
      battle = await Database.client.battle.findUnique({
        where: { id: battleId },
        include: { player1: true, player2: true }
      }).catch(() => null);
    }

    if (!battle || battle.status === "FINISHED") {
      return null;
    }

    // Determine the winner (the opponent)
    const winnerId = (battle.player1Id === forfeiterId) ? battle.player2Id : battle.player1Id;

    // 2. Immediately update Redis metadata (status: FINISHED, winnerId)
    const updatedMeta = {
      ...battle,
      status: "FINISHED",
      winnerId: winnerId || null,
      endedAt: new Date()
    };

    RedisClient.client.set(`battle:meta:${battleId}`, JSON.stringify(updatedMeta), "EX", 86400).catch(err =>
      console.error(`[RedisCache] forfeitBattle set error: ${err.message}`)
    );

    // 3. Immediately emit battle_end event via WebSockets (0ms wait time for players)
    eventBus.emitEvent(EventTypes.BATTLE_SOCKET_END, {
      battleId,
      winnerId: winnerId || null,
      draw: !winnerId
    });

    // 4. Asynchronously persist to PostgreSQL DB in background with Tier 2 & Tier 3 failsafes
    this.finishBattleService(battleId, winnerId).catch(err =>
      console.error(`[Async Forfeit Finish Error] battle ${battleId}:`, err.message)
    );

    return updatedMeta;
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

  /**
   * Tier 3 DLQ Worker: Drains and replays failed DB writes from Redis Dead-Letter Queues
   */
  static async replayFailedPersists() {
    try {
      // 1. Replay failed creations
      let creationItem = await RedisClient.client.lpop("battle:dlq:failed_creations");
      while (creationItem) {
        const data = JSON.parse(creationItem);
        console.log(`🔄 [DLQ Replay] Retrying DB creation for battleId=${data.id}`);
        await Database.client.battle.upsert({
          where: { id: data.id },
          create: {
            id: data.id,
            player1Id: data.player1Id,
            player2Id: data.player2Id,
            problemId: data.problemId,
            status: data.status || "ONGOING",
            startedAt: new Date(data.startedAt),
            battleCode: data.battleCode
          },
          update: {}
        });
        creationItem = await RedisClient.client.lpop("battle:dlq:failed_creations");
      }

      // 2. Replay failed completions
      let persistItem = await RedisClient.client.lpop("battle:dlq:failed_persists");
      while (persistItem) {
        const data = JSON.parse(persistItem);
        console.log(`🔄 [DLQ Replay] Retrying DB completion for battleId=${data.battleId}`);
        await BattleService.finishBattleService(data.battleId, data.winnerId);
        persistItem = await RedisClient.client.lpop("battle:dlq:failed_persists");
      }
    } catch (err) {
      console.error(`[DLQ Replay Worker] Execution warning: ${err.message}`);
    }
  }
}

export default BattleService;
