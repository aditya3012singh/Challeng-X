// 🎮 squidGameSocket.js - WebSocket events for Squid Game

import SquidGameConfig from "../constants/squidGameConfig.js";
import SquidGameService from "../services/squidGame.service.js";

/**
 * Initialize Squid Game WebSocket handlers
 * @param {Object} io - Socket.io instance
 */
export function initializeSquidGameSocket(io) {
  const squidGameNamespace = io.of("/squid-game");

  squidGameNamespace.on("connection", (socket) => {
    console.log("🎮 Squid Game player connected:", socket.id);

    /**
     * Join a tournament room
     * Event: squid_game:join_tournament
     */
    socket.on("squid_game:join_tournament", async (data) => {
      const { squidGameId, userId } = data;

      // Join room for this tournament
      socket.join(`tournament-${squidGameId}`);

      // Notify others that a player joined
      squidGameNamespace
        .to(`tournament-${squidGameId}`)
        .emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.PLAYER_JOINED, {
          message: `Player joined tournament`,
          timestamp: new Date()
        });

      console.log(`✅ User ${userId} joined tournament ${squidGameId}`);
    });

    /**
     * Submit a solution
     * Event: squid_game:submit_solution
     */
    socket.on("squid_game:submit_solution", async (data) => {
      const {
        squidGameId,
        userId,
        code,
        language,
        status,
        executionTimeMs,
        testCasesPassed,
        totalTestCases
      } = data;

      try {
        const submission = await squidGameService.submitSquidGameSolution(
          squidGameId,
        const submission = await SquidGameService.submitSquidGameSolution(
          code,
          language,
          status,
          executionTimeMs,
          testCasesPassed,
          totalTestCases
        );

        // Notify tournament that submission was received
        squidGameNamespace
          .to(`tournament-${squidGameId}`)
          .emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.SUBMISSION_RECEIVED, {
            userId,
            status,
            score: submission.score,
            testCasesPassed,
            totalTestCases,
            timestamp: new Date()
          });

        console.log(`📝 Submission received from ${userId}`);
      } catch (error) {
        socket.emit("error", {
          message: "Failed to submit solution",
          error: error.message
        });
      }
    });

    /**
     * Request leaderboard update
     * Event: squid_game:request_leaderboard
     */
    socket.on("squid_game:request_leaderboard", async (data) => {
      const { squidGameId } = data;

      try {
        const leaderboard = await SquidGameService.getSquidGameLeaderboard(
          squidGameId
        );

        // Send leaderboard to requesting user
        socket.emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.LEADERBOARD_UPDATED, {
          leaderboard,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit("error", {
          message: "Failed to fetch leaderboard",
          error: error.message
        });
      }
    });

    /**
     * End round and eliminate players
     * Event: squid_game:end_round
     */
    socket.on("squid_game:end_round", async (data) => {
      const { squidGameId } = data;

      try {
        const result = await SquidGameService.endRoundAndEliminate(squidGameId);

        // Broadcast round end to all players in tournament
        squidGameNamespace
          .to(`tournament-${squidGameId}`)
          .emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.ROUND_ENDED, {
            ...result,
            timestamp: new Date()
          });

        // Broadcast elimination event
        if (result.eliminatedCount > 0) {
          squidGameNamespace
            .to(`tournament-${squidGameId}`)
            .emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.PLAYERS_ELIMINATED, {
              eliminatedCount: result.eliminatedCount,
              remainingPlayers: result.remainingPlayers,
              leaderboard: result.leaderboard,
              timestamp: new Date()
            });
        }

        // Broadcast tournament completion if applicable
        if (result.tournamentEnded) {
          squidGameNamespace
            .to(`tournament-${squidGameId}`)
            .emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.TOURNAMENT_COMPLETED, {
              winner: result.winner,
              finalLeaderboard: result.leaderboard,
              timestamp: new Date()
            });
        }

        console.log(`🏆 Round ended for tournament ${squidGameId}`);
      } catch (error) {
        socket.emit("error", {
          message: "Failed to end round",
          error: error.message
        });
      }
    });

    /**
     * Disconnect handler
     */
    socket.on("disconnect", () => {
      console.log("❌ Squid Game player disconnected:", socket.id);
    });
  });

  return squidGameNamespace;
}

/**
 * Emit real-time leaderboard updates to all tournament participants
 * @param {Object} io - Socket.io instance
 * @param {string} squidGameId - Tournament ID
 * @param {Array} leaderboard - Current leaderboard
 */
export function broadcastLeaderboardUpdate(io, squidGameId, leaderboard) {
  io.of("/squid-game")
    .to(`tournament-${squidGameId}`)
    .emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.LEADERBOARD_UPDATED, {
      leaderboard,
      timestamp: new Date()
    });
}

/**
 * Emit round started event
 * @param {Object} io - Socket.io instance
 * @param {string} squidGameId - Tournament ID
 * @param {Object} round - Round information
 */
export function broadcastRoundStart(io, squidGameId, round) {
  io.of("/squid-game")
    .to(`tournament-${squidGameId}`)
    .emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.ROUND_STARTED, {
      roundNumber: round.roundNumber,
      difficulty: round.difficulty,
      timeLimit: round.timeLimit,
      problem: {
        id: round.problem.id,
        title: round.problem.title,
        description: round.problem.description
      },
      timestamp: new Date()
    });
}
