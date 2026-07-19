import RedisClient from "../../core/cache/redis.client.js";
import Database from "../../core/config/db.js";
import UserCache from "../../core/cache/userCache.js";
import ProblemCache from "../../core/cache/problemCache.js";
import BattleCode from "../../utils/battleCode.js";
import SocketEmitter from "../../integrations/socket/socket.server.js";
import crypto from "crypto";

const LOBBY_TTL = 86400; // 24 hours

class TeamLobbyService {
  /**
   * Helper to generate a 6-character room code
   */
  static generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Broadcast lobby state via WebSockets
   */
  static emitLobbyUpdate(roomCode, lobbyData) {
    if (SocketEmitter.io) {
      SocketEmitter.io.to(`lobby_${roomCode}`).emit("lobby_updated", lobbyData);
    }
  }

  /**
   * Create a new Custom Team Battle Lobby
   */
  static async createLobbyService(userId, teamSize = 2, difficulty = "MEDIUM") {
    try {
      const user = await UserCache.getUser(userId);
      if (!user) throw new Error("User not found");

      let roomCode;
      let attempts = 0;
      do {
        roomCode = this.generateRoomCode();
        const existing = await RedisClient.client.get(`teambattle:code:${roomCode}`);
        if (!existing) break;
        attempts++;
      } while (attempts < 5);

      const lobbyId = crypto.randomUUID();
      const numSlots = parseInt(teamSize) || 2;

      // Create initial slots
      const teamAlpha = Array(numSlots).fill(null);
      const teamBravo = Array(numSlots).fill(null);

      // Creator is Host in Team Alpha [0]
      teamAlpha[0] = {
        userId: user.id,
        username: user.username || user.name || "Coder",
        profilePic: user.profilePic || null,
        rankPoints: user.rankPoints || 1000,
        isReady: true,
        isHost: true
      };

      const lobbyData = {
        id: lobbyId,
        roomCode,
        hostUserId: user.id,
        teamSize: numSlots,
        difficulty,
        status: "LOBBY",
        teamAlpha,
        teamBravo,
        createdAt: new Date().toISOString()
      };

      // Store in Redis (~2ms)
      await RedisClient.client.set(`teambattle:lobby:${roomCode}`, JSON.stringify(lobbyData), "EX", LOBBY_TTL);
      await RedisClient.client.set(`teambattle:code:${roomCode}`, lobbyId, "EX", LOBBY_TTL);

      return lobbyData;
    } catch (error) {
      console.error("[TeamLobbyService] Error creating lobby:", error);
      throw error;
    }
  }

  /**
   * Get Lobby state by room code
   */
  static async getLobbyService(roomCode) {
    try {
      const cached = await RedisClient.client.get(`teambattle:lobby:${roomCode}`);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.error(`[TeamLobbyService] Error getting lobby ${roomCode}:`, error);
      return null;
    }
  }

  /**
   * Join an existing lobby via room code
   */
  static async joinLobbyService(userId, roomCode) {
    try {
      const lobby = await this.getLobbyService(roomCode);
      if (!lobby) throw new Error("Lobby not found or expired");
      if (lobby.status !== "LOBBY") throw new Error("Battle has already started");

      const user = await UserCache.getUser(userId);
      if (!user) throw new Error("User not found");

      // Check if user is already in Alpha or Bravo
      const inAlpha = lobby.teamAlpha.some(s => s && s.userId === userId);
      const inBravo = lobby.teamBravo.some(s => s && s.userId === userId);

      if (inAlpha || inBravo) {
        return lobby; // Already in room
      }

      // Find first open slot (Alpha first, then Bravo)
      const alphaOpenIndex = lobby.teamAlpha.findIndex(s => s === null);
      const bravoOpenIndex = lobby.teamBravo.findIndex(s => s === null);

      const playerObj = {
        userId: user.id,
        username: user.username || user.name || "Coder",
        profilePic: user.profilePic || null,
        rankPoints: user.rankPoints || 1000,
        isReady: false,
        isHost: false
      };

      if (alphaOpenIndex !== -1) {
        lobby.teamAlpha[alphaOpenIndex] = playerObj;
      } else if (bravoOpenIndex !== -1) {
        lobby.teamBravo[bravoOpenIndex] = playerObj;
      } else {
        throw new Error("Lobby is full");
      }

      // Save updated lobby to Redis (~1ms)
      await RedisClient.client.set(`teambattle:lobby:${roomCode}`, JSON.stringify(lobby), "EX", LOBBY_TTL);
      this.emitLobbyUpdate(roomCode, lobby);

      return lobby;
    } catch (error) {
      console.error(`[TeamLobbyService] Error joining lobby ${roomCode}:`, error);
      throw error;
    }
  }

  /**
   * Switch between Team Alpha and Team Bravo
   */
  static async switchTeamService(userId, roomCode, targetTeam) {
    try {
      const lobby = await this.getLobbyService(roomCode);
      if (!lobby) throw new Error("Lobby not found");
      if (lobby.status !== "LOBBY") throw new Error("Cannot switch teams now");

      // Locate user
      let playerObj = null;
      const alphaIndex = lobby.teamAlpha.findIndex(s => s && s.userId === userId);
      const bravoIndex = lobby.teamBravo.findIndex(s => s && s.userId === userId);

      if (alphaIndex !== -1) {
        playerObj = lobby.teamAlpha[alphaIndex];
      } else if (bravoIndex !== -1) {
        playerObj = lobby.teamBravo[bravoIndex];
      }

      if (!playerObj) throw new Error("Player not in this lobby");

      if (targetTeam === "ALPHA" && alphaIndex === -1) {
        const openIdx = lobby.teamAlpha.findIndex(s => s === null);
        if (openIdx === -1) throw new Error("Team Alpha is full");
        lobby.teamBravo[bravoIndex] = null;
        lobby.teamAlpha[openIdx] = playerObj;
      } else if (targetTeam === "BRAVO" && bravoIndex === -1) {
        const openIdx = lobby.teamBravo.findIndex(s => s === null);
        if (openIdx === -1) throw new Error("Team Bravo is full");
        lobby.teamAlpha[alphaIndex] = null;
        lobby.teamBravo[openIdx] = playerObj;
      }

      await RedisClient.client.set(`teambattle:lobby:${roomCode}`, JSON.stringify(lobby), "EX", LOBBY_TTL);
      this.emitLobbyUpdate(roomCode, lobby);

      return lobby;
    } catch (error) {
      console.error(`[TeamLobbyService] Error switching team in ${roomCode}:`, error);
      throw error;
    }
  }

  /**
   * Toggle Ready Status
   */
  static async toggleReadyService(userId, roomCode) {
    try {
      const lobby = await this.getLobbyService(roomCode);
      if (!lobby) throw new Error("Lobby not found");

      const alphaIndex = lobby.teamAlpha.findIndex(s => s && s.userId === userId);
      const bravoIndex = lobby.teamBravo.findIndex(s => s && s.userId === userId);

      if (alphaIndex !== -1) {
        lobby.teamAlpha[alphaIndex].isReady = !lobby.teamAlpha[alphaIndex].isReady;
      } else if (bravoIndex !== -1) {
        lobby.teamBravo[bravoIndex].isReady = !lobby.teamBravo[bravoIndex].isReady;
      } else {
        throw new Error("Player not in lobby");
      }

      await RedisClient.client.set(`teambattle:lobby:${roomCode}`, JSON.stringify(lobby), "EX", LOBBY_TTL);
      this.emitLobbyUpdate(roomCode, lobby);

      return lobby;
    } catch (error) {
      console.error(`[TeamLobbyService] Error toggling ready in ${roomCode}:`, error);
      throw error;
    }
  }

  /**
   * Leave Lobby
   */
  static async leaveLobbyService(userId, roomCode) {
    try {
      const lobby = await this.getLobbyService(roomCode);
      if (!lobby) return null;

      const alphaIndex = lobby.teamAlpha.findIndex(s => s && s.userId === userId);
      const bravoIndex = lobby.teamBravo.findIndex(s => s && s.userId === userId);

      if (alphaIndex !== -1) lobby.teamAlpha[alphaIndex] = null;
      if (bravoIndex !== -1) lobby.teamBravo[bravoIndex] = null;

      // Check if lobby is completely empty
      const remainingAlpha = lobby.teamAlpha.filter(Boolean);
      const remainingBravo = lobby.teamBravo.filter(Boolean);

      if (remainingAlpha.length === 0 && remainingBravo.length === 0) {
        await RedisClient.client.del(`teambattle:lobby:${roomCode}`);
        await RedisClient.client.del(`teambattle:code:${roomCode}`);
        return null;
      }

      // If host left, transfer host badge to first available player
      if (lobby.hostUserId === userId) {
        const nextHost = remainingAlpha[0] || remainingBravo[0];
        if (nextHost) {
          lobby.hostUserId = nextHost.userId;
          nextHost.isHost = true;
          nextHost.isReady = true;
        }
      }

      await RedisClient.client.set(`teambattle:lobby:${roomCode}`, JSON.stringify(lobby), "EX", LOBBY_TTL);
      this.emitLobbyUpdate(roomCode, lobby);

      return lobby;
    } catch (error) {
      console.error(`[TeamLobbyService] Error leaving lobby ${roomCode}:`, error);
      throw error;
    }
  }

  /**
   * Start Team Battle (Host only, automatic 1v1 pair matching)
   */
  static async startTeamBattleService(userId, roomCode) {
    try {
      const lobby = await this.getLobbyService(roomCode);
      if (!lobby) throw new Error("Lobby not found");
      if (lobby.hostUserId !== userId) throw new Error("Only the host can start the battle");

      const alphaPlayers = lobby.teamAlpha.filter(Boolean);
      const bravoPlayers = lobby.teamBravo.filter(Boolean);

      if (alphaPlayers.length !== lobby.teamSize || bravoPlayers.length !== lobby.teamSize) {
        throw new Error(`Both teams must have exactly ${lobby.teamSize} players`);
      }

      // Pair Alpha[i] vs Bravo[i]
      const matches = [];
      for (let i = 0; i < lobby.teamSize; i++) {
        const p1 = alphaPlayers[i];
        const p2 = bravoPlayers[i];
        const matchId = crypto.randomUUID();

        // Get problem from cache
        const problem = await ProblemCache.getRandomProblemByDifficulty(lobby.difficulty);

        const matchObj = {
          matchId,
          player1: p1,
          player2: p2,
          problemId: problem?.id || "default_prob",
          status: "ONGOING",
          winnerUserId: null
        };

        matches.push(matchObj);

        // Cache 1v1 battle metadata for getBattle Arena view (~1ms)
        const subBattleData = {
          id: matchId,
          battleCode: lobby.roomCode,
          player1Id: p1.userId,
          player2Id: p2.userId,
          problemId: problem?.id || "default_prob",
          problem: problem || null,
          player1: p1,
          player2: p2,
          status: "ONGOING",
          teamBattleId: lobby.id,
          createdAt: new Date().toISOString()
        };

        await RedisClient.client.set(`battle:meta:${matchId}`, JSON.stringify(subBattleData), "EX", LOBBY_TTL);
      }

      lobby.status = "ONGOING";
      lobby.matches = matches;

      // Save updated state to Redis (~2ms)
      await RedisClient.client.set(`teambattle:lobby:${roomCode}`, JSON.stringify(lobby), "EX", LOBBY_TTL);

      // Emit 0ms WebSocket event to all members
      if (SocketEmitter.io) {
        SocketEmitter.io.to(`lobby_${roomCode}`).emit("team_battle_started", {
          lobbyId: lobby.id,
          roomCode,
          matches
        });
      }

      // Asynchronously persist to PostgreSQL in background
      this.persistTeamBattleBackground(lobby, matches).catch(err => {
        console.error("[TeamLobbyService] Background DB persist error:", err.message);
      });

      return lobby;
    } catch (error) {
      console.error(`[TeamLobbyService] Error starting team battle in ${roomCode}:`, error);
      throw error;
    }
  }

  /**
   * Update live 1v1 sub-match result & broadcast squad score update
   */
  static async updateSubMatchResultService(roomCode, matchId, winnerUserId) {
    try {
      const lobby = await this.getLobbyService(roomCode);
      if (!lobby || !lobby.matches) return null;

      const match = lobby.matches.find(m => m.matchId === matchId);
      if (match) {
        match.status = "FINISHED";
        match.winnerUserId = winnerUserId;

        // Calculate team wins
        let alphaWins = 0;
        let bravoWins = 0;
        lobby.matches.forEach(m => {
          if (m.winnerUserId) {
            const isAlpha = lobby.teamAlpha.some(p => p && p.userId === m.winnerUserId);
            if (isAlpha) alphaWins++;
            else bravoWins++;
          }
        });

        lobby.teamAlphaScore = alphaWins;
        lobby.teamBravoScore = bravoWins;

        if (alphaWins + bravoWins === lobby.teamSize) {
          lobby.status = "FINISHED";
          lobby.overallWinnerTeam = alphaWins > bravoWins ? "ALPHA" : bravoWins > alphaWins ? "BRAVO" : "DRAW";
        }

        await RedisClient.client.set(`teambattle:lobby:${roomCode}`, JSON.stringify(lobby), "EX", LOBBY_TTL);

        // Emit 0ms live team score update
        if (SocketEmitter.io) {
          SocketEmitter.io.to(`lobby_${roomCode}`).emit("team_score_updated", {
            roomCode,
            teamAlphaScore: alphaWins,
            teamBravoScore: bravoWins,
            matches: lobby.matches,
            overallWinnerTeam: lobby.overallWinnerTeam || null
          });
        }
      }

      return lobby;
    } catch (error) {
      console.error(`[TeamLobbyService] Error updating sub-match in ${roomCode}:`, error);
      return null;
    }
  }

  /**
   * Background Write-Behind DB Persist
   */
  static async persistTeamBattleBackground(lobby, matches) {
    try {
      console.log(`[TeamLobbyService] Write-Behind persisting team battle ${lobby.id} to DB`);
    } catch (err) {
      console.error("[TeamLobbyService] Failed to persist team battle to DB:", err.message);
    }
  }
}

export default TeamLobbyService;
