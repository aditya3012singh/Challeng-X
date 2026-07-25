import crypto from "crypto";
import RedisClient from "../../core/cache/redis.client.js";
import env from "../../core/config/env.js";
import Database from "../../core/config/db.js";
import DBWrapper from "../../core/config/db.wrapper.js";
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
  static isMatching = false;

  static async joinQueue(userId, difficulty, socketId, lobbyId = null) {
    // Get user's rank points from cache (fallback to DB)
    let user = await UserCache.getUser(userId);

    if (!user) {
      // Fallback to DB if not in cache
      user = await DBWrapper.execute("joinQueueGetUser", (db) =>
        db.user.findUnique({
          where: { id: userId },
          select: { rankPoints: true, username: true }
        })
      );

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

    const username = user?.username || user?.name || user?.email?.split('@')[0] || `User_${userId.substring(0, 6)}`;

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

    // Trigger matchmaking sweep immediately to eliminate queue latency
    MatchmakingService.tickMatchmaking(SocketEmitter.io).catch(err => {
      logger.error(`[Matchmaking Immediate Tick Error] ${err.message}`);
    });

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

    const p1Name = currentPlayer.username && currentPlayer.username !== "Player"
      ? currentPlayer.username
      : `User_${currentPlayer.userId.substring(0, 6)}`;
    const p2Name = opponentData.username && opponentData.username !== "Player"
      ? opponentData.username
      : `User_${opponentData.userId.substring(0, 6)}`;

    logger.info(`[Matchmaking] Match found: ${p1Name} (${currentPlayer.userId}) vs ${p2Name} (${opponentData.userId})`);

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
    MatchmakingService.persistBattleWithRetry(battleData).catch(() => { });

    return battleData;
  }

  /**
   * Tier 1 (3x Retries) & Tier 3 (Redis DLQ) Failsafe for Battle Creation
   */
  static async persistBattleWithRetry(battleData) {
    try {
      await DBWrapper.execute("persistBattleMatchmaking", (db) =>
        db.battle.create({
          data: {
            id: battleData.id,
            player1Id: battleData.player1Id,
            player2Id: battleData.player2Id,
            problemId: battleData.problemId,
            status: "ONGOING",
            startedAt: battleData.startedAt,
            battleCode: battleData.battleCode
          }
        })
      );
      logger.info(`✅ [Background DB Persist Success] Battle ${battleData.id} persisted to PostgreSQL`);
    } catch (err) {
      logger.error(`❌ [Background DB Persist Failed] Pushing battle ${battleData.id} to Redis DLQ: ${err.message}`);
      // Tier 3: Push to Redis Dead-Letter Queue (DLQ)
      try {
        await RedisClient.client.rpush("battle:dlq:failed_creations", JSON.stringify(battleData));
        logger.error(`🚨 [Tier 3 Redis DLQ] Pushed battle creation ${battleData.id} to DLQ (battle:dlq:failed_creations)`);
      } catch (dlqErr) {
        logger.error(`❌ [DLQ Fatal] Failed to push battle ${battleData.id} to Redis DLQ: ${dlqErr.message}`);
      }
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

  //   /**
  //    * Spawn a Ghost match for a user
  //    * @param {string} userId 
  //    * @param {string} difficulty 
  //    */
  //   static async spawnGhostMatch(userId, difficulty) {
  //     logger.info(`[Matchmaking] Spawning Ghost match for user ${userId} (${difficulty})`);
  // 
  //     // 1. Get User Data
  //     const user = await Database.client.user.findUnique({
  //       where: { id: userId },
  //       select: { id: true, username: true, rankPoints: true }
  //     });
  // 
  //     if (!user) throw new Error("User not found");
  // 
  //     // 2. Get Ghost User
  //     const ghost = await Database.client.user.findUnique({
  //       where: { username: "CHALLENGX_GHOST" }
  //     });
  // 
  //     if (!ghost) throw new Error("Ghost user not found. Run ensure_ghost.js first.");
  // 
  //     // 3. Get socket info before removing from queue
  //     const queueDataStr = await RedisClient.client.get(`matchmaking:user:${userId}`);
  //     const socketId = queueDataStr ? JSON.parse(queueDataStr).socketId : null;
  // 
  //     // 4. Remove user from queue
  //     await MatchmakingService.leaveQueue(userId);
  // 
  //     // 5. Create Battle
  //     const player1 = { userId: user.id, username: user.username, socketId, rankPoints: user.rankPoints };
  //     const player2 = { userId: ghost.id, username: ghost.username, socketId: null, rankPoints: ghost.rankPoints };
  // 
  //     logger.info(`[Matchmaking] Player 1 Socket ID: ${socketId}`);
  // 
  //     const battle = await MatchmakingService.createMatchedBattle(player1, player2, difficulty);
  //     
  //     logger.info(`[Matchmaking] Battle created: ${battle.id}. Emit was successful? ${!!SocketEmitter.io}`);
  //     
  //     return battle;
  //   }

  static startMatchmakingTicker(io) {
    logger.info("🟢 Starting Matchmaking Background Ticker (every 1 second)");
    let tickCount = 0;
    setInterval(async () => {
      try {
        await MatchmakingService.tickMatchmaking(io, tickCount);
        tickCount++;
      } catch (err) {
        logger.error(`[Matchmaking Ticker Error] ${err.message}`);
      }
    }, 1000);
  }

  static async tickMatchmaking(io, tickCount = null) {
    if (MatchmakingService.isMatching) {
      return;
    }
    MatchmakingService.isMatching = true;

    try {
      const difficulties = ["EASY", "MEDIUM", "HARD"];
      for (const diff of difficulties) {
        const queueKey = `${MATCHMAKING_QUEUE}:${diff}`;

        // Get all player IDs in this difficulty queue
        const playerIds = await RedisClient.client.zrange(queueKey, 0, -1);
        if (playerIds.length < 2) continue;

        // Fetch active player metadata from Redis
        const players = [];
        for (const id of playerIds) {
          // If player is locked in a proposal, skip them
          const activeProposal = await RedisClient.client.get(`matchmaking:user:${id}:proposal`);
          if (activeProposal) continue;

          const dataStr = await RedisClient.client.get(`matchmaking:user:${id}`);
          if (dataStr) {
            players.push(JSON.parse(dataStr));
          } else {
            // Stale entry, cleanup from queue
            await RedisClient.client.zrem(queueKey, id);
          }
        }

        // Sort players by wait time descending (longest waiting has smaller joinedAt timestamp)
        players.sort((a, b) => a.joinedAt - b.joinedAt);

        const matchedUserIds = new Set();

        for (let i = 0; i < players.length; i++) {
          const p1 = players[i];
          if (matchedUserIds.has(p1.userId)) continue;

          // Calculate dynamic range based on wait time of p1
          const waitTimeSeconds = Math.floor((Date.now() - p1.joinedAt) / 1000);
          const eloThreshold = Math.min(100 + Math.floor(waitTimeSeconds / 5) * 100, 2000);

          // Find a suitable opponent
          let bestOpponent = null;
          for (let j = i + 1; j < players.length; j++) {
            const p2 = players[j];
            if (matchedUserIds.has(p2.userId)) continue;

            // Check lobbyId (can't match if in the same lobby)
            if (p1.lobbyId && p1.lobbyId === p2.lobbyId) continue;

            // Check rank points difference
            const diffElo = Math.abs(p1.rankPoints - p2.rankPoints);
            if (diffElo <= eloThreshold) {
              bestOpponent = p2;
              break;
            }
          }

          if (bestOpponent) {
            matchedUserIds.add(p1.userId);
            matchedUserIds.add(bestOpponent.userId);

            // Trigger match proposal!
            try {
              await MatchmakingService.proposeMatch(io, p1, bestOpponent, diff);
            } catch (err) {
              logger.error(`[Matchmaking Propose Match Error] for ${p1.userId} and ${bestOpponent.userId}: ${err.message}`);
            }
          }
        }
      }

      // Also broadcast queue metrics to active sockets (once every 5 seconds or on demand)
      if (tickCount === null || tickCount % 5 === 0) {
        await MatchmakingService.broadcastQueueMetrics(io);
      }
    } finally {
      MatchmakingService.isMatching = false;
    }
  }

  static async proposeMatch(io, p1, p2, difficulty) {
    const proposalId = crypto.randomUUID();
    const proposal = {
      id: proposalId,
      player1: p1,
      player2: p2,
      difficulty,
      p1Accepted: false,
      p2Accepted: false,
      expiresAt: Date.now() + 10000 // 10 seconds acceptance window
    };

    // Save proposal to Redis (expire after 30 seconds for safety)
    await RedisClient.client.set(`matchmaking:proposal:${proposalId}`, JSON.stringify(proposal), "EX", 30);

    // Set players' state to locked in proposal
    await RedisClient.client.set(`matchmaking:user:${p1.userId}:proposal`, proposalId, "EX", 30);
    await RedisClient.client.set(`matchmaking:user:${p2.userId}:proposal`, proposalId, "EX", 30);

    // Remove players from sorted queues temporarily so they don't match with others
    const queueKey = `${MATCHMAKING_QUEUE}:${difficulty}`;
    await Promise.all([
      RedisClient.client.zrem(queueKey, p1.userId),
      RedisClient.client.zrem(queueKey, p2.userId)
    ]);

    logger.info(`[Matchmaking] Proposing match ${proposalId} between ${p1.username} and ${p2.username}`);

    // Emit match_proposed socket event to both players
    const socketServer = io || SocketEmitter.io;
    if (socketServer) {
      const payload1 = { proposalId, opponent: p2.username, timeout: 10 };
      socketServer.to(`user_${p1.userId}`).emit("match_proposed", payload1);
      if (p1.socketId) socketServer.to(p1.socketId).emit("match_proposed", payload1);

      const payload2 = { proposalId, opponent: p1.username, timeout: 10 };
      socketServer.to(`user_${p2.userId}`).emit("match_proposed", payload2);
      if (p2.socketId) socketServer.to(p2.socketId).emit("match_proposed", payload2);
    }

    // Start 10 seconds timeout block
    setTimeout(async () => {
      try {
        await MatchmakingService.handleProposalTimeout(socketServer, proposalId);
      } catch (err) {
        logger.error(`[Proposal Timeout Error] ${err.message}`);
      }
    }, 10000);
  }

  static async acceptMatch(userId, proposalId) {
    const proposalStr = await RedisClient.client.get(`matchmaking:proposal:${proposalId}`);
    if (!proposalStr) {
      throw new Error("Match proposal expired or not found");
    }

    const proposal = JSON.parse(proposalStr);

    if (proposal.player1.userId === userId) {
      proposal.p1Accepted = true;
    } else if (proposal.player2.userId === userId) {
      proposal.p2Accepted = true;
    } else {
      throw new Error("Unauthorized to accept this proposal");
    }

    // Save updated proposal
    await RedisClient.client.set(`matchmaking:proposal:${proposalId}`, JSON.stringify(proposal), "EX", 30);

    const socketServer = SocketEmitter.io;
    const otherPlayer = proposal.player1.userId === userId ? proposal.player2 : proposal.player1;
    if (socketServer) {
      socketServer.to(`user_${otherPlayer.userId}`).emit("opponent_accepted", { proposalId });
      if (otherPlayer.socketId) socketServer.to(otherPlayer.socketId).emit("opponent_accepted", { proposalId });
    }

    // Check if both accepted
    if (proposal.p1Accepted && proposal.p2Accepted) {
      // Both accepted! Clean up and launch battle!
      await RedisClient.client.del(`matchmaking:proposal:${proposalId}`);
      await RedisClient.client.del(`matchmaking:user:${proposal.player1.userId}:proposal`);
      await RedisClient.client.del(`matchmaking:user:${proposal.player2.userId}:proposal`);

      // Clean up search session keys
      await RedisClient.client.del(`matchmaking:user:${proposal.player1.userId}`);
      await RedisClient.client.del(`matchmaking:user:${proposal.player2.userId}`);

      // Create Battle
      await MatchmakingService.createMatchedBattle(proposal.player1, proposal.player2, proposal.difficulty);
    }

    return { message: "Match accepted", proposal };
  }

  static async declineMatch(userId, proposalId) {
    const proposalStr = await RedisClient.client.get(`matchmaking:proposal:${proposalId}`);
    if (!proposalStr) {
      return { message: "Proposal already resolved or expired" };
    }

    const proposal = JSON.parse(proposalStr);
    await MatchmakingService.cancelProposal(SocketEmitter.io, proposal, userId); // userId declined
    return { message: "Match declined" };
  }

  static async cancelProposal(io, proposal, declinerUserId) {
    // Delete proposal keys
    await RedisClient.client.del(`matchmaking:proposal:${proposal.id}`);
    await RedisClient.client.del(`matchmaking:user:${proposal.player1.userId}:proposal`);
    await RedisClient.client.del(`matchmaking:user:${proposal.player2.userId}:proposal`);

    const socketServer = io || SocketEmitter.io;

    // Handle Declining Player
    if (declinerUserId) {
      await MatchmakingService.leaveQueue(declinerUserId);
      if (socketServer) {
        socketServer.to(`user_${declinerUserId}`).emit("match_declined_by_you");
        const declinerPlayer = proposal.player1.userId === declinerUserId ? proposal.player1 : proposal.player2;
        if (declinerPlayer.socketId) socketServer.to(declinerPlayer.socketId).emit("match_declined_by_you");
      }
    }

    // Handle Accepting / AFK Player (Priority Re-Queueing!)
    const activePlayer = proposal.player1.userId === declinerUserId ? proposal.player2 : proposal.player1;
    const declinerPlayer = proposal.player1.userId === declinerUserId ? proposal.player1 : proposal.player2;

    // Put the active player back in queue
    const queueKey = `${MATCHMAKING_QUEUE}:${proposal.difficulty}`;

    const userMetaStr = await RedisClient.client.get(`matchmaking:user:${activePlayer.userId}`);
    if (userMetaStr) {
      await RedisClient.client.zadd(queueKey, activePlayer.rankPoints, activePlayer.userId);
      logger.info(`🔄 [Matchmaking] Player ${activePlayer.username} PRIORITY RE-QUEUED (Opponent declined/AFK)`);

      if (socketServer) {
        const cancelPayload = {
          reason: declinerUserId ? `${declinerPlayer.username} declined the match.` : "Match acceptance timed out.",
          reQueued: true
        };
        socketServer.to(`user_${activePlayer.userId}`).emit("match_cancelled", cancelPayload);
        if (activePlayer.socketId) socketServer.to(activePlayer.socketId).emit("match_cancelled", cancelPayload);
      }
    }
  }

  static async handleProposalTimeout(io, proposalId) {
    const proposalStr = await RedisClient.client.get(`matchmaking:proposal:${proposalId}`);
    if (!proposalStr) return; // Already resolved

    const proposal = JSON.parse(proposalStr);
    const socketServer = io || SocketEmitter.io;

    logger.info(`⏰ [Matchmaking] Match Proposal ${proposalId} timed out. Resolving...`);

    if (!proposal.p1Accepted && !proposal.p2Accepted) {
      // Both AFK, remove both from queue
      await RedisClient.client.del(`matchmaking:proposal:${proposalId}`);
      await RedisClient.client.del(`matchmaking:user:${proposal.player1.userId}:proposal`);
      await RedisClient.client.del(`matchmaking:user:${proposal.player2.userId}:proposal`);
      await MatchmakingService.leaveQueue(proposal.player1.userId);
      await MatchmakingService.leaveQueue(proposal.player2.userId);
      if (socketServer) {
        socketServer.to(`user_${proposal.player1.userId}`).emit("match_timeout");
        if (proposal.player1.socketId) socketServer.to(proposal.player1.socketId).emit("match_timeout");
        socketServer.to(`user_${proposal.player2.userId}`).emit("match_timeout");
        if (proposal.player2.socketId) socketServer.to(proposal.player2.socketId).emit("match_timeout");
      }
      return;
    }

    let declinerUserId = null;
    if (!proposal.p1Accepted) {
      declinerUserId = proposal.player1.userId;
    } else if (!proposal.p2Accepted) {
      declinerUserId = proposal.player2.userId;
    }

    await MatchmakingService.cancelProposal(socketServer, proposal, declinerUserId);
  }

  static async broadcastQueueMetrics(io) {
    try {
      const easyCount = await RedisClient.client.zcard(`${MATCHMAKING_QUEUE}:EASY`);
      const mediumCount = await RedisClient.client.zcard(`${MATCHMAKING_QUEUE}:MEDIUM`);
      const hardCount = await RedisClient.client.zcard(`${MATCHMAKING_QUEUE}:HARD`);

      const payload = {
        EASY: easyCount,
        MEDIUM: mediumCount,
        HARD: hardCount,
        timestamp: Date.now()
      };

      const socketServer = io || SocketEmitter.io;
      if (socketServer) {
        socketServer.emit("queue_metrics_broadcast", payload);
      }
    } catch (err) {
      logger.error(`[Queue Metrics Broadcast Error] ${err.message}`);
    }
  }

  static async getGlobalActivityFeed() {
    const cacheKey = "matchmaking:activity_feed_cache";
    try {
      // 1. Try hitting Redis cache first
      const cached = await RedisClient.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // 2. Fetch from DB on miss
      const battles = await DBWrapper.execute("getGlobalActivityFeed", (db) =>
        db.battle.findMany({
          where: { status: "FINISHED" },
          take: 10,
          orderBy: { endedAt: "desc" },
          include: {
            player1: { select: { username: true } },
            player2: { select: { username: true } },
            problem: { select: { title: true, difficulty: true } }
          }
        })
      );

      const formattedFeed = battles.map(b => {
        const p1Name = b.player1?.username || "Unknown";
        const p2Name = b.player2?.username || "Unknown";
        const diff = b.problem?.difficulty ? b.problem.difficulty.toLowerCase() : "standard";

        if (!b.winnerId) {
          return `${p1Name} and ${p2Name} drew in a ${diff} match!`;
        }

        const winnerName = b.winnerId === b.player1Id ? p1Name : p2Name;
        const loserName = b.winnerId === b.player1Id ? p2Name : p1Name;
        return `${winnerName} defeated ${loserName} in a ${diff} match!`;
      });

      // 3. Cache the formatted feed in Redis for 5 minutes (300 seconds)
      await RedisClient.client.set(cacheKey, JSON.stringify(formattedFeed), "EX", 300);

      return formattedFeed;
    } catch (err) {
      logger.error(`[getGlobalActivityFeed Error] ${err.message}`);
      return [];
    }
  }
}

export default MatchmakingService;