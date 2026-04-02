// Matchmaking service - finds opponents for battles

import RedisClient from "../cache/redis.client.js";
import env from "../config/env.js";
import Database from "../config/db.js";
import BattleCode from "../utils/battleCode.js";
import SocketEmitter from "../config/socket.js";
import S3Service from "./s3.service.js";
import logger from "../utils/logger.js";

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
    // Get user's rank points
    const user = await Database.client.user.findUnique({
      where: { id: userId },
      select: { rankPoints: true, username: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already in queue - if so, remove them and re-join (allows refreshing session)
    const existingQueue = await RedisClient.client.get(`matchmaking:user:${userId}`);
    if (existingQueue) {
      await MatchmakingService.leaveQueue(userId);
    }

    // Store user in queue with metadata
    const queueData = {
      userId,
      username: user.username,
      rankPoints: user.rankPoints,
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
      user.rankPoints,
      userId
    );

    logger.info(`[Matchmaking] User ${user.username} (${userId}) joined ${difficulty} queue with rank ${user.rankPoints}`);

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

    logger.info(`[Matchmaking] Match found: ${currentPlayer.username} vs ${opponentData.username}`);

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

    // Get random problem of specified difficulty
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

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    const battleCode = await BattleCode.generateBattleCode();

    // Create battle with both players
    const battle = await Database.client.battle.create({
      data: {
        player1Id: player1.userId,
        player2Id: player2.userId,
        problemId: randomProblem.id,
        status: "ONGOING",
        startedAt: new Date(),
        battleCode
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            description: true,
            timeLimitMs: true
          }
        }
      }
    });
    
    // Pre-cache hidden test cases asynchronously to speed up the first submission
    S3Service.fetchHiddenTestCases(randomProblem.id).catch(err => 
      console.error(`[Pre-cache] Matchmaking failed for problem ${randomProblem.id}:`, err.message)
    );
    
    // Notify both players via user-specific rooms (more stable than socket IDs)
    const user1Room = `user_${player1.userId}`;
    logger.info(`[Matchmaking] Emitting match_found to room: ${user1Room}`);
    SocketEmitter.io?.to(user1Room).emit("match_found", {
      battleId: battle.id,
      battleCode: battle.battleCode,
      opponent: player2.username,
      problem: battle.problem
    });
  
    // For ghost matches, player2.socketId/userId might be system-level, but we follow the same pattern
    if (player2.userId && player2.userId !== 'ghost') {
        const user2Room = `user_${player2.userId}`;
        SocketEmitter.io?.to(user2Room).emit("match_found", {
          battleId: battle.id,
          battleCode: battle.battleCode,
          opponent: player1.username,
          problem: battle.problem
        });
    }

    return battle;
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
      where: { username: "CHALLEGX_GHOST" }
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