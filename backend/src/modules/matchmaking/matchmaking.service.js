import crypto from "crypto";
import RedisClient from "../../core/cache/redis.client.js";
import env from "../../core/config/env.js";
import Database from "../../core/config/db.js";
import BattleCode from "../../utils/battleCode.js";
import SocketEmitter from "../../core/config/socket.js";
import S3Service from "../../integrations/s3/s3.service.js";
import UserCache from "../../core/cache/userCache.js";
import ProblemCache from "../../core/cache/problemCache.js";
import logger from "../../core/logger/logger.js";

const MATCHMAKING_QUEUE = "matchmaking:queue";
const RANK_THRESHOLD = env.MATCHMAKING_RANK_THRESHOLD || 2000;
const QUEUE_TIMEOUT = 60000; // 60 seconds timeout

/**
 * Add player to matchmaking queue
 * @param {string} userId 
 * @param {string} difficulty - EASY, MEDIUM, or HARD
 * @param {string} socketId - Socket connection ID
 */


class MatchmakingService {
  static async joinQueue(userId, difficulty, socketId, lobbyId = null) {
    // Get user's rank points from cache (fallback to DB)
    let user = await UserCache.getUser(userId);
    
    if (!user) {
      // Fallback to DB if not in cache
      user = await Database.client.user.findUnique({
        where: { id: userId },
        select: { rankPoints: true, username: true }
      });
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Cache the user for future requests
      await UserCache.cacheUser(user);
    }

    // Ensure rankPoints is a valid number (default to 1000 if null/undefined)
    const rankPoints = user.rankPoints ?? 1000;

    // Check if user already in queue - if so, remove them and re-join (allows refreshing session)
    const existingQueue = await RedisClient.client.get(`matchmaking:user:${userId}`);
    if (existingQueue) {
      await MatchmakingService.leaveQueue(userId);
    }

    const username = user?.username || user?.name || "Player";

    // Store user in queue with metadata
    const queueData = {
      userId,
      username,
      rankPoints,
      difficulty,
      socketId,
      lobbyId,
      joinedAt: Date.now()
    };

    await RedisClient.client.set(
      `matchmaking:user:${userId}`,
      JSON.stringify(queueData),
      'EX',
      120 // Expire after 2 minutes
    );

    // Add to difficulty-based queue
    await RedisClient.client.zadd(
      `${MATCHMAKING_QUEUE}:${difficulty}`,
      rankPoints,
      userId
    );

    logger.info(`[Matchmaking] User ${username} (${userId}) joined ${difficulty} queue with rank ${rankPoints}`);

    // Try to find a match immediately
    await MatchmakingService.findMatch(userId, difficulty);

    return { message: "Added to queue", queueData };
  }

  /**
/**
 * Remove player from matchmaking queue
 * @param {string} userId
 */
static async leaveQueue(userId) {

  const queueDataStr = await RedisClient.client.get(`matchmaking:user:${userId}`);

  // If user already not in queue, don't crash server
  if (!queueDataStr) {
    return { message: "User already not in queue" };
  }

  const queueData = JSON.parse(queueDataStr);

  // Remove from all queues
  await Promise.all([
    RedisClient.client.del(`matchmaking:user:${userId}`),
    RedisClient.client.zrem(`${MATCHMAKING_QUEUE}:EASY`, userId),
    RedisClient.client.zrem(`${MATCHMAKING_QUEUE}:MEDIUM`, userId),
    RedisClient.client.zrem(`${MATCHMAKING_QUEUE}:HARD`, userId)
  ]);

  return { message: "Removed from queue" };
}

  /**
   * Find a match for a player
   * @param {string} userId 
   * @param {string} difficulty 
   */
  static async findMatch(userId, difficulty) {
    const queueDataStr = await RedisClient.client.get(`matchmaking:user:${userId}`);
    if (!queueDataStr) return;

    const currentPlayer = JSON.parse(queueDataStr);
    const queueKey = `${MATCHMAKING_QUEUE}:${difficulty}`;

    // Get players in similar rank range
    const minRank = currentPlayer.rankPoints - RANK_THRESHOLD;
    const maxRank = currentPlayer.rankPoints + RANK_THRESHOLD;

    const potentialMatches = await RedisClient.client.zrangebyscore(
      queueKey,
      minRank,
      maxRank
    );

    // Find an opponent (not self AND not in same lobby)
    const opponent = potentialMatches.find(id => {
      if (id === userId) return false;
      // If we have detailed opponent data, we can check lobbyId
      return true; 
    });

    if (!opponent) {
      return null; // No match found yet
    }

    const opponentDataStr = await RedisClient.client.get(`matchmaking:user:${opponent}`);
    if (!opponentDataStr) {
      // Opponent left queue, remove from sorted set
      await RedisClient.client.zrem(queueKey, opponent);
      return null;
    }

    const opponentData = JSON.parse(opponentDataStr);

    // Final safety check: ensure they are not in the same lobby
    if (currentPlayer.lobbyId && currentPlayer.lobbyId === opponentData.lobbyId) {
      logger.info(`[Matchmaking] Skipping teammate ${opponentData.username} for ${currentPlayer.username}`);
      return null;
    }

    logger.info(`[Matchmaking] Match found: ${currentPlayer.username || "Player 1"} vs ${opponentData.username || "Player 2"}`);

    // Create battle
    await MatchmakingService.createMatchedBattle(currentPlayer, opponentData, difficulty);
  }

  /**
   * Create a battle from matched players
   * @param {object} player1 
   * @param {object} player2 
   * @param {string} difficulty 
   */
  static async createMatchedBattle(player1, player2, difficulty) {
    // Remove both players from queue
    await Promise.all([
      MatchmakingService.leaveQueue(player1.userId),
      MatchmakingService.leaveQueue(player2.userId)
    ]);

    // Get random problem of specified difficulty from cache
    let selectedProblem = await ProblemCache.getRandomProblemByDifficulty(difficulty);

    if (!selectedProblem) {
      // Fallback to DB if cache is empty
      const problems = await Database.client.problem.findMany({
        where: { difficulty }
      });

      if (problems.length === 0) {
        // Notify players - no problems available
        SocketEmitter.io?.to(player1.socketId).emit("matchmakingError", {
          message: "No problems available for this difficulty"
        });
        SocketEmitter.io?.to(player2.socketId).emit("matchmakingError", {
          message: "No problems available for this difficulty"
        });
        return;
      }

      selectedProblem = problems[Math.floor(Math.random() * problems.length)];
      await ProblemCache.cacheProblem(selectedProblem);
    }

    const battleId = crypto.randomUUID();
    const battleCode = await BattleCode.generateBattleCode();
    const startedAt = new Date();

    const problemMetadata = {
      id: selectedProblem.id,
      title: selectedProblem.title,
      difficulty: selectedProblem.difficulty,
      description: selectedProblem.description,
      timeLimitMs: selectedProblem.timeLimitMs,
      hints: selectedProblem.hints || [],
      testcases: selectedProblem.testcases || []
    };

    const battleData = {
      id: battleId,
      battleCode,
      player1Id: player1.userId,
      player2Id: player2.userId,
      problemId: selectedProblem.id,
      status: "ONGOING",
      startedAt,
      problem: problemMetadata,
      player1: { id: player1.userId, username: player1.username },
      player2: { id: player2.userId, username: player2.username }
    };

    // 1. Immediately cache battle metadata in Redis (0ms)
    RedisClient.client.set(`battle:meta:${battleId}`, JSON.stringify(battleData), "EX", 86400).catch(err =>
      console.error(`[RedisCache] createMatchedBattle set error: ${err.message}`)
    );

    // 2. Pre-cache hidden test cases asynchronously
    S3Service.fetchHiddenTestCases(selectedProblem.id).catch(err => 
      console.error(`[Pre-cache] Matchmaking failed for problem ${selectedProblem.id}:`, err.message)
    );

    // 3. Instantly notify both players via WebSockets (0ms wait time)
    const user1Room = `user_${player1.userId}`;
    logger.info(`[Matchmaking] Emitting match_found to room: ${user1Room} and socket: ${player1.socketId}`);
    const payload1 = {
      battleId,
      battleCode,
      opponent: player2.username,
      problem: problemMetadata
    };
    SocketEmitter.io?.to(user1Room).emit("match_found", payload1);
    if (player1.socketId) SocketEmitter.io?.to(player1.socketId).emit("match_found", payload1);

    if (player2.userId && player2.userId !== 'ghost') {
      const user2Room = `user_${player2.userId}`;
      const payload2 = {
        battleId,
        battleCode,
        opponent: player1.username,
        problem: problemMetadata
      };
      SocketEmitter.io?.to(user2Room).emit("match_found", payload2);
      if (player2.socketId) SocketEmitter.io?.to(player2.socketId).emit("match_found", payload2);
    }

    // 4. Asynchronously persist to PostgreSQL in background with Tier 1 (3x Retries) & Tier 3 (Redis DLQ)
    MatchmakingService.persistBattleWithRetry(battleData).catch(() => {});

    return battleData;
  }

  /**
   * Tier 1 (3x Retries) & Tier 3 (Redis DLQ) Failsafe for Battle Creation
   */
  static async persistBattleWithRetry(battleData, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        attempts++;
        await Database.client.battle.create({
          data: {
            id: battleData.id,
            player1Id: battleData.player1Id,
            player2Id: battleData.player2Id,
            problemId: battleData.problemId,
            status: "ONGOING",
            startedAt: battleData.startedAt,
            battleCode: battleData.battleCode
          }
        });
        logger.info(`✅ [Tier 1 DB Write Success] Battle ${battleData.id} persisted to PostgreSQL (Attempt ${attempts})`);
        return;
      } catch (err) {
        logger.warn(`⚠️ [Tier 1 DB Write Warning] Attempt ${attempts}/${maxRetries} failed for battle ${battleData.id}: ${err.message}`);
        if (attempts < maxRetries) {
          await new Promise(res => setTimeout(res, attempts * 1000));
        }
      }
    }

    // Tier 3: All 3 retries failed -> Push to Redis Dead-Letter Queue (DLQ)
    try {
      await RedisClient.client.rpush("battle:dlq:failed_creations", JSON.stringify(battleData));
      logger.error(`🚨 [Tier 3 Redis DLQ] Pushed battle creation ${battleData.id} to DLQ (battle:dlq:failed_creations)`);
    } catch (dlqErr) {
      logger.error(`❌ [DLQ Fatal] Failed to push battle ${battleData.id} to Redis DLQ: ${dlqErr.message}`);
    }
  }

  /**
   * Get current queue status
   * @param {string} userId 
   */
  static async getQueueStatus(userId) {
    const queueDataStr = await RedisClient.client.get(`matchmaking:user:${userId}`);

    if (!queueDataStr) {
      return { inQueue: false };
    }

    const queueData = JSON.parse(queueDataStr);
    const queueKey = `${MATCHMAKING_QUEUE}:${queueData.difficulty}`;

    // Refresh expiry to keep user in queue while they are actively polling
    await RedisClient.client.expire(`matchmaking:user:${userId}`, 120);

    // Get queue size
    const queueSize = await RedisClient.client.zcard(queueKey);
    const waitTime = Date.now() - queueData.joinedAt;

    return {
      inQueue: true,
      difficulty: queueData.difficulty,
      queueSize,
      waitTime,
      estimatedWait: Math.max(0, 30000 - waitTime) // Estimate 30s max wait
    };
  }

  /**
   * Spawn a Ghost match for a user
   * @param {string} userId 
   * @param {string} difficulty 
   */
  static async spawnGhostMatch(userId, difficulty) {
    logger.info(`[Matchmaking] Spawning Ghost match for user ${userId} (${difficulty})`);

    // 1. Get User Data
    const user = await Database.client.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, rankPoints: true }
    });

    if (!user) throw new Error("User not found");

    // 2. Get Ghost User
    const ghost = await Database.client.user.findUnique({
      where: { username: "CHALLENGX_GHOST" }
    });

    if (!ghost) throw new Error("Ghost user not found. Run ensure_ghost.js first.");

    // 3. Get socket info before removing from queue
    const queueDataStr = await RedisClient.client.get(`matchmaking:user:${userId}`);
    const socketId = queueDataStr ? JSON.parse(queueDataStr).socketId : null;

    // 4. Remove user from queue
    await MatchmakingService.leaveQueue(userId);

    // 5. Create Battle
    const player1 = { userId: user.id, username: user.username, socketId, rankPoints: user.rankPoints };
    const player2 = { userId: ghost.id, username: ghost.username, socketId: null, rankPoints: ghost.rankPoints };

    logger.info(`[Matchmaking] Player 1 Socket ID: ${socketId}`);

    const battle = await MatchmakingService.createMatchedBattle(player1, player2, difficulty);
    
    logger.info(`[Matchmaking] Battle created: ${battle.id}. Emit was successful? ${!!SocketEmitter.io}`);
    
    return battle;
  }
}

export default MatchmakingService;