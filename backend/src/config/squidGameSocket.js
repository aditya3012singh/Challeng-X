// 🎮 squidGameSocket.js - WebSocket events for Squid Game

import SquidGameConfig from "../constants/squidGameConfig.js";
import SquidGameService from "../services/squidGame.service.js";

/**
 * Initialize Squid Game WebSocket handlers
 * @param {Object} io - Socket.io instance
 */
class SquidGameSocket {
  static initializeSquidGameSocket(io) {
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
       * Join as a host (receives all code streams)
       */
      socket.on("squid_game:join_host", (data) => {
        const { squidGameId } = data;
        socket.join(`tournament-${squidGameId}-host`);
        console.log(`👑 Host joined spectator room for tournament ${squidGameId}`);
      });

      /**
       * Sync code from player to host
       */
      socket.on("squid_game:code_sync", async (data) => {
        const { squidGameId, userId, username, code, language } = data;
        
        // 1. Persist to DB for crash recovery/reload
        try {
          await SquidGameService.updateParticipantDraft(squidGameId, userId, code, language);
        } catch (err) {
          // Non-critical, just log it
          console.error("❌ [Socket] Failed to sync code to DB:", err.message);
        }

        // 2. Emit only to the host room
        squidGameNamespace
          .to(`tournament-${squidGameId}-host`)
          .emit("squid_game:host_code_update", {
            userId,
            username,
            code,
            language,
            timestamp: new Date()
          });
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

          console.log(`📡 [Socket] Host triggered FORCE END for tournament ${squidGameId}`);
          console.log(`   - Players Eliminated: ${result.eliminatedCount}`);
          console.log(`   - Players Remaining: ${result.remainingPlayers}`);

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
       * Start next round
       * Event: squid_game:next_round
       */
      socket.on("squid_game:next_round", async (data) => {
        const { squidGameId } = data;

        try {
          const round = await SquidGameService.startNextRound(squidGameId);

          // Broadcast round start
          SquidGameSocket.broadcastRoundStart(io, squidGameId, round);

          console.log(`🎮 Next round started for tournament ${squidGameId}`);
        } catch (error) {
          socket.emit("error", {
            message: "Failed to start next round",
            error: error.message
          });
        }
      });

      /**
       * Disqualify a player
       * Event: squid_game:disqualify_player
       */
      socket.on("squid_game:disqualify_player", async (data) => {
        const { squidGameId, userId } = data;

        try {
          await SquidGameService.disqualifyParticipant(squidGameId, userId);

          // Notify participant they are OUT
          squidGameNamespace
            .to(`tournament-${squidGameId}`)
            .emit(SquidGameConfig.SQUID_GAME_CONFIG.WEBSOCKET_EVENTS.PLAYER_ELIMINATED, {
              userId,
              reason: "DISQUALIFIED",
              timestamp: new Date()
            });

          console.log(`🚫 Player ${userId} disqualified in tournament ${squidGameId}`);
        } catch (error) {
          socket.emit("error", {
            message: "Failed to disqualify player",
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
  static broadcastLeaderboardUpdate(io, squidGameId, leaderboard) {
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
  static broadcastRoundStart(io, squidGameId, round) {
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
}

export default SquidGameSocket;
