// Matchmaking service - finds opponents for battles

import RedisClient from "../cache/redis.client.js";
import Database from "../config/db.js";
import BattleCode from "../utils/battleCode.js";
import { emitToBattle } from "../config/socket.js";
import { io } from "../server.js";

const MATCHMAKING_QUEUE = "matchmaking:queue";
const RANK_THRESHOLD = 200; // Max rank difference for matching
const QUEUE_TIMEOUT = 60000; // 60 seconds timeout

/**
 * Add player to matchmaking queue
 * @param {string} userId 
 * @param {string} difficulty - EASY, MEDIUM, or HARD
 * @param {string} socketId - Socket connection ID
 */


class MatchmakingService {
  static async joinQueue(userId, difficulty, socketId) {
  // Get user's rank points
  const user = await Database.client.user.findUnique({
    where: { id: userId },
    select: { rankPoints: true, username: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user already in queue
  const existingQueue = await RedisClient.client.get(`matchmaking:user:${userId}`);
  if (existingQueue) {
    throw new Error("Already in matchmaking queue");
  }

  // Store user in queue with metadata
  const queueData = {
    userId,
    username: user.username,
    rankPoints: user.rankPoints,
    difficulty,
    socketId,
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

  // Try to find a match immediately
  await findMatch(userId, difficulty);

  return { message: "Added to queue", queueData };
  }
}

/**
 * Remove player from matchmaking queue
 * @param {string} userId 
 */
  static async leaveQueue(userId) {
  const queueDataStr = await RedisClient.client.get(`matchmaking:user:${userId}`);
  
  if (!queueDataStr) {
    throw new Error("Not in queue");
  }

  const queueData = JSON.parse(queueDataStr);

  // Remove from all difficulty queues
  await Promise.all([
    RedisClient.client.del(`matchmaking:user:${userId}`),
    RedisClient.client.zrem(`${MATCHMAKING_QUEUE}:EASY`, userId),
    RedisClient.client.zrem(`${MATCHMAKING_QUEUE}:MEDIUM`, userId),
    RedisClient.client.zrem(`${MATCHMAKING_QUEUE}:HARD`, userId)
  ]);

  return { message: "Removed from queue" };
  }
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

  // Find an opponent (not self)
  const opponent = potentialMatches.find(id => id !== userId);

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

  // Create battle
  await createMatchedBattle(currentPlayer, opponentData, difficulty);
  }
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
    leaveQueue(player1.userId),
    leaveQueue(player2.userId)
  ]);

  // Get random problem of specified difficulty
  const problems = await Database.client.problem.findMany({
    where: { difficulty }
  });

  if (problems.length === 0) {
    // Notify players - no problems available
    io.to(player1.socketId).emit("matchmakingError", { 
      message: "No problems available for this difficulty" 
    });
    io.to(player2.socketId).emit("matchmakingError", { 
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

  // Notify both players via socket
  io.to(player1.socketId).emit("matchFound", {
    battleId: battle.id,
    battleCode: battle.battleCode,
    opponent: player2.username,
    problem: battle.problem
  });

  io.to(player2.socketId).emit("matchFound", {
    battleId: battle.id,
    battleCode: battle.battleCode,
    opponent: player1.username,
    problem: battle.problem
  });

  return battle;
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
}

export default MatchmakingService;
}