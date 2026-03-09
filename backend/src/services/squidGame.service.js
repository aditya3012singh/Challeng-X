// 🎮 squidGame.service.js - Squid Game Battle Tournament

import Database from "../config/db.js";
import SquidGameConfig from "../constants/squidGameConfig.js";
import SocketServer from "../socket/socketServer.js";
import SquidGameSocket from "../config/squidGameSocket.js";

class SquidGameService {

  /**
   * Create a new Squid Game tournament
   * @param {string} name - Tournament name
   * @param {string} hostId - Creator/host user ID
   * @param {number} maxPlayers - Max players (default 50)
   * @returns {Promise<Object>} Created tournament
   */
  static async createSquidGameTournament(name, hostId, maxPlayers = 50) {
    const squidGame = await Database.client.squidGame.create({
      data: {
        name,
        hostId,
        maxPlayers,
        totalRounds: SquidGameConfig.DIFFICULTY_PROGRESSION.length,
        status: "REGISTRATION"
      },
      include: {
        participants: true
      }
    });

    return squidGame;
  }

  /**
   * Join a Squid Game tournament
   * @param {string} squidGameId - Tournament ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated tournament
   */
  static async joinSquidGameTournament(squidGameId, userId) {
    // Check if tournament exists and is in REGISTRATION phase
    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId },
      include: { participants: true }
    });

    if (!squidGame) {
      throw new Error("Tournament not found");
    }

    if (squidGame.status !== "REGISTRATION") {
      throw new Error("Tournament is not accepting new players");
    }

    if (squidGame.participants.length >= squidGame.maxPlayers) {
      throw new Error("Tournament is full");
    }

    // Check if user already joined
    const existing = await Database.client.squidGameParticipant.findUnique({
      where: {
        squidGameId_userId: {
          squidGameId,
          userId
        }
      }
    });

    if (existing) {
      throw new Error("User already joined this tournament");
    }

    // Add user as participant
    const participant = await Database.client.squidGameParticipant.create({
      data: {
        squidGameId,
        userId,
        status: "ACTIVE"
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    return {
      participant,
      totalPlayers: squidGame.participants.length + 1,
      maxPlayers: squidGame.maxPlayers
    };
  }

  /**
   * Get tournament status
   */
  static async getSquidGameStatus(squidGameId) {
    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        roundProblems: {
          include: {
            problem: true
          }
        }
      }
    });

    if (!squidGame) {
      throw new Error("Tournament not found");
    }

    return squidGame;
  }

  /**
   * Start the Squid Game tournament (host-only)
   */
  static async startSquidGameTournament(squidGameId, userId) {
    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId },
      include: { participants: true }
    });

    if (!squidGame) {
      throw new Error("Tournament not found");
    }

    // Only the host can start the tournament
    if (squidGame.hostId !== userId) {
      throw new Error("Only the tournament host can start the game");
    }

    if (squidGame.status !== "REGISTRATION") {
      throw new Error("Tournament is not in registration phase");
    }

    if (squidGame.participants.length < 2) {
      throw new Error("Not enough players to start tournament");
    }

    // Update status
    const updated = await Database.client.squidGame.update({
      where: { id: squidGameId },
      data: {
        status: "ROUND_ACTIVE",
        currentRound: 1,
        startedAt: new Date()
      }
    });

    // Start round 1
    await this.startNextRound(squidGameId);

    return updated;
  }

  /**
   * Start a new round
   */
  static async startNextRound(squidGameId) {
    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId },
      include: {
        participants: {
          where: { status: "ACTIVE" }
        }
      }
    });

    if (!squidGame) {
      throw new Error("Tournament not found");
    }

    const roundNumber = squidGame.currentRound;

    if (roundNumber > squidGame.totalRounds) {
      throw new Error("All rounds completed");
    }

    const difficultyConfig = SquidGameConfig.DIFFICULTY_PROGRESSION[roundNumber - 1];

    // Get problem for this round
    const problem = await Database.client.problem.findFirst({
      where: { difficulty: difficultyConfig.difficulty }
    });

    if (!problem) {
      throw new Error(`No ${difficultyConfig.difficulty} problems available`);
    }

    // Create round record
    const round = await Database.client.squidGameRound.create({
      data: {
        squidGameId,
        roundNumber,
        difficulty: difficultyConfig.difficulty,
        problemId: problem.id,
        timeLimit: difficultyConfig.timeLimit,
        playersAtStart: squidGame.participants.length,
        startedAt: new Date()
      },
      include: {
        problem: true
      }
    });

    // Broadcast round start to all participants
    if (SocketServer.io) {
      SquidGameSocket.broadcastRoundStart(SocketServer.io, squidGameId, round);
    }

    return round;
  }

  /**
   * Submit a solution for Squid Game round
   */
  static async submitSquidGameSolution(
    squidGameId,
    userId,
    code,
    language,
    status,
    executionTimeMs,
    testCasesPassed,
    totalTestCases
  ) {
    // Get current round
    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId }
    });

    if (!squidGame) {
      throw new Error("Tournament not found");
    }

    const roundId = (
      await Database.client.squidGameRound.findFirst({
        where: {
          squidGameId,
          roundNumber: squidGame.currentRound
        }
      })
    ).id;

    // Get participant
    const participant = await Database.client.squidGameParticipant.findUnique({
      where: {
        squidGameId_userId: { squidGameId, userId }
      }
    });

    if (!participant) {
      throw new Error("User not in tournament");
    }

    // Calculate score
    const score = this.calculateScore(
      status,
      executionTimeMs,
      testCasesPassed,
      totalTestCases
    );

    // Create submission
    const submission = await Database.client.squidGameSubmission.create({
      data: {
        roundId,
        participantId: participant.id,
        code,
        language,
        status,
        score,
        executionTimeMs,
        testCasesPassed,
        totalTestCases,
        submittedAt: new Date()
      }
    });

    // Update participant score
    const roundScores = [...(participant.roundScores || []), score];
    const totalScore = roundScores.reduce((a, b) => a + b, 0);

    await Database.client.squidGameParticipant.update({
      where: { id: participant.id },
      data: {
        roundScores,
        totalScore
      }
    });

    return submission;
  }

  /**
   * End current round and eliminate players
   * Eliminates bottom 50% or specified number
   */
  static async endRoundAndEliminate(squidGameId, eliminationPercentage = 0.5) {
    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId },
      include: {
        participants: {
          where: { status: "ACTIVE" },
          include: {
            submissions: {
              where: {
                round: {
                  roundNumber: squidGame.currentRound
                }
              }
            }
          }
        },
        roundProblems: {
          where: {
            roundNumber: squidGame.currentRound
          }
        }
      }
    });

    if (!squidGame) {
      throw new Error("Tournament not found");
    }

    const activePlayers = squidGame.participants;
    const currentRound = squidGame.roundProblems[0];

    // Calculate number to eliminate
    const toEliminate = Math.ceil(activePlayers.length * eliminationPercentage);

    // Get leaderboard for this round
    const leaderboard = activePlayers
      .map((p) => {
        const roundSubmission = p.submissions[0];
        return {
          participantId: p.id,
          userId: p.userId,
          username: p.user?.username || "Unknown",
          score: roundSubmission?.score || 0,
          status: roundSubmission?.status || "FAILED"
        };
      })
      .sort((a, b) => {
        // Sort by: PASSED first, then by score descending
        if (a.status === "PASSED" && b.status !== "PASSED") return -1;
        if (a.status !== "PASSED" && b.status === "PASSED") return 1;
        return b.score - a.score;
      });

    // Save leaderboard snapshot
    await Database.client.squidGameLeaderboard.create({
      data: {
        squidGameId,
        roundNumber: squidGame.currentRound,
        playerRankings: leaderboard.map((p, idx) => ({
          rank: idx + 1,
          ...p
        }))
      }
    });

    // Eliminate bottom players
    const toEliminateIds = leaderboard.slice(-toEliminate).map((p) => p.participantId);

    await Database.client.squidGameParticipant.updateMany({
      where: {
        id: { in: toEliminateIds }
      },
      data: {
        status: "ELIMINATED",
        eliminatedAt: new Date(),
        roundsEliminated: squidGame.currentRound
      }
    });

    // Update round with elimination count
    await Database.client.squidGameRound.update({
      where: { id: currentRound.id },
      data: {
        playersEliminated: toEliminate,
        endedAt: new Date()
      }
    });

    // Check if tournament is over (only 1 player left or all rounds done)
    const remaining = activePlayers.length - toEliminate;

    if (remaining === 1 || squidGame.currentRound === squidGame.totalRounds) {
      // Tournament complete
      const winner = leaderboard[0];

      await Database.client.squidGame.update({
        where: { id: squidGameId },
        data: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      });

      await Database.client.squidGameParticipant.update({
        where: { id: winner.participantId },
        data: {
          status: "WINNER"
        }
      });

      return {
        roundEnded: true,
        tournamentEnded: true,
        eliminatedCount: toEliminate,
        remainingPlayers: remaining,
        winner: winner.username,
        leaderboard
      };
    }

    // Move to next round
    await Database.client.squidGame.update({
      where: { id: squidGameId },
      data: {
        currentRound: squidGame.currentRound + 1
      }
    });

    // Start next round
    await this.startNextRound(squidGameId);

    return {
      roundEnded: true,
      tournamentEnded: false,
      eliminatedCount: toEliminate,
      remainingPlayers: remaining,
      nextRound: squidGame.currentRound + 1,
      leaderboard
    };
  }

  /**
   * Get tournament leaderboard
   */
  static async getSquidGameLeaderboard(squidGameId) {
    const leaderboards = await Database.client.squidGameLeaderboard.findMany({
      where: { squidGameId },
      orderBy: { roundNumber: "asc" }
    });

    if (leaderboards.length === 0) {
      // No snapshots yet, calculate from current state
      const participants = await Database.client.squidGameParticipant.findMany({
        where: { squidGameId },
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { totalScore: "desc" }
      });

      return {
        currentLeaderboard: participants.map((p, idx) => ({
          rank: idx + 1,
          userId: p.userId,
          username: p.user.username,
          totalScore: p.totalScore,
          status: p.status,
          roundsSurvived: p.roundsEliminated
        }))
      };
    }

    return {
      leaderboardHistory: leaderboards.map((l) => ({
        round: l.roundNumber,
        snapshot: l.playerRankings
      }))
    };
  }

  /**
   * Calculate score for a submission
   */
  static calculateScore(status, executionTimeMs, testCasesPassed, totalTestCases) {
    if (status === "FAILED" || status === "ERROR" || status === "TIMEOUT") {
      return 0;
    }

    if (status === "PASSED") {
      // Base score for passing all test cases
      let score = 100;

      // Bonus for fast execution (max 50 bonus points)
      const timeBonus = Math.max(0, 50 - Math.floor(executionTimeMs / 100));
      score += timeBonus;

      return score;
    }

    // Partial points for partial passes
    if (testCasesPassed > 0 && testCasesPassed < totalTestCases) {
      const passPercentage = testCasesPassed / totalTestCases;
      return Math.floor(50 * passPercentage); // Max 50 points for partial
    }

    return 0;
  }

  /**
   * Get user's tournament history
   */
  static async getUserSquidGameHistory(userId) {
    const participations = await Database.client.squidGameParticipant.findMany({
      where: { userId },
      include: {
        squidGame: true
      },
      orderBy: {
        joinedAt: "desc"
      }
    });

    return participations.map((p) => ({
      tournamentId: p.squidGameId,
      tournamentName: p.squidGame.name,
      status: p.status,
      totalScore: p.totalScore,
      roundsSurvived: p.roundsEliminated,
      joinedAt: p.joinedAt,
      eliminatedAt: p.eliminatedAt
    }));
  }
}

export default SquidGameService;
