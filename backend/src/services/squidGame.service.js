// 🎮 squidGame.service.js - Squid Game Battle Tournament

import Database from "../config/db.js";
import SquidGameConfig from "../constants/squidGameConfig.js";
import SocketEmitter from "../config/socket.js";
import SquidGameSocket from "../config/squidGameSocket.js";
import SubmissionService from "./submission.service.js";
import S3Service from "./s3.service.js";
import AIService from "./ai.service.js";

class SquidGameService {

  /**
   * Generate a unique 6-digit join code
   */
  static async generateJoinCode() {
    let joinCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      joinCode = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await Database.client.squidGame.findUnique({
        where: { joinCode }
      });
      if (!existing) isUnique = true;
      attempts++;
    }
    if (!isUnique) {
      // Fallback: just use timestamp if somehow random fails multiple times
      joinCode = Date.now().toString().slice(-6);
    }
    return joinCode;
  }

  /**
   * Create a new Squid Game tournament
   * @param {string} name - Tournament name
   * @param {string} hostId - Creator/host user ID
   * @param {number} maxPlayers - Max players (default 50)
   * @returns {Promise<Object>} Created tournament
   */
  static async createSquidGameTournament(name, hostId, maxPlayers = 50) {
    const joinCode = await this.generateJoinCode();
    const squidGame = await Database.client.squidGame.create({
      data: {
        name,
        joinCode,
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
   * @param {string} joinCode - Tournament 6-digit code or UUID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated tournament
   */
  static async joinSquidGameTournament(codeOrId, userId) {
    // Check if tournament exists and is in REGISTRATION phase
    let squidGame = await Database.client.squidGame.findUnique({
      where: { joinCode: codeOrId },
      include: { participants: true }
    });

    if (!squidGame) {
      // Fallback to UUID
      squidGame = await Database.client.squidGame.findUnique({
        where: { id: codeOrId },
        include: { participants: true }
      });
    }

    if (!squidGame) {
      throw new Error("Tournament not found");
    }

    const squidGameId = squidGame.id;

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
   * Update participant's latest code draft
   */
  static async updateParticipantDraft(squidGameId, userId, code, language) {
    return await Database.client.squidGameParticipant.update({
      where: {
        squidGameId_userId: { squidGameId, userId }
      },
      data: {
        lastCode: code,
        lastLanguage: language
      }
    });
  }

  /**
   * Get tournament status
   */
  static async getSquidGameStatus(squidGameId, userId = null) {
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

    // If userId provided, find their specific participant record and latest submission for the current round
    let myStatus = null;
    if (userId) {
      const myParticipant = squidGame.participants.find(p => p.userId === userId);
      if (myParticipant) {
        const lastSubmission = await Database.client.squidGameSubmission.findFirst({
          where: {
            participantId: myParticipant.id,
            roundId: squidGame.roundProblems.find(rp => rp.roundNumber === squidGame.currentRound)?.id
          },
          orderBy: { submittedAt: 'desc' }
        });

        myStatus = {
          participant: {
            id: myParticipant.id,
            status: myParticipant.status,
            totalScore: myParticipant.totalScore,
            lastCode: myParticipant.lastCode,
            lastLanguage: myParticipant.lastLanguage
          },
          lastSubmission: lastSubmission ? {
            code: lastSubmission.code,
            language: lastSubmission.language,
            status: lastSubmission.status,
            submittedAt: lastSubmission.submittedAt
          } : null
        };
      }
    }

    return {
      ...squidGame,
      myStatus
    };
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

    // Update status to mark as started, but let startNextRound handle the first round initialization
    const updated = await Database.client.squidGame.update({
      where: { id: squidGameId },
      data: {
        status: "ROUND_ENDED",
        currentRound: 0,
        startedAt: new Date()
      }
    });

    // Start round 1 (this will increment currentRound to 1)
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

    console.log(`🎮 [Service] Starting Next Round for Tournament ${squidGameId}`);
    console.log(`   - Current Round: ${squidGame.currentRound}`);
    console.log(`   - Active Players: ${squidGame.participants.length}`);

    const nextRoundNum = squidGame.currentRound + 1;

    if (nextRoundNum > squidGame.totalRounds) {
      throw new Error("All rounds completed");
    }

    const difficultyConfig = SquidGameConfig.DIFFICULTY_PROGRESSION[nextRoundNum - 1];

    // Get problem for this round
    const problem = await Database.client.problem.findFirst({
      where: { difficulty: difficultyConfig.difficulty }
    });

    if (!problem) {
      throw new Error(`No ${difficultyConfig.difficulty} problems available`);
    }

    // Update tournament status and increment round
    await Database.client.squidGame.update({
      where: { id: squidGameId },
      data: {
        status: "ROUND_ACTIVE",
        currentRound: nextRoundNum
      }
    });

    // Clear drafts for all active participants for the new round
    await Database.client.squidGameParticipant.updateMany({
      where: {
        squidGameId,
        status: "ACTIVE"
      },
      data: {
        lastCode: null,
        lastLanguage: null
      }
    });

    // Create round record
    const round = await Database.client.squidGameRound.create({
      data: {
        squidGameId,
        roundNumber: nextRoundNum,
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
    
    // Pre-cache hidden test cases asynchronously to speed up the first round submission
    S3Service.fetchHiddenTestCases(problem.id).catch(err => 
      console.error(`[Pre-cache] SquidGame failed for problem ${problem.id}:`, err.message)
    );
    
    // Broadcast round start to all participants
    if (SocketEmitter.io) {
      SquidGameSocket.broadcastRoundStart(SocketEmitter.io, squidGameId, round);
      
      // 🎙️ AI Game Master Intro
      this.broadcastGameMasterMessage(squidGameId, "ROUND_START", {
        roundNumber: nextRoundNum,
        totalRounds: squidGame.totalRounds,
        activePlayers: squidGame.participants.length,
        difficulty: problem.difficulty
      });
    }

    return round;
  }

  /**
   * Submit a solution for Squid Game round (Initiates real judging)
   */
  static async submitSquidGameSolution(
    squidGameId,
    userId,
    code,
    language,
    type = "SUBMIT"
  ) {
    // 1. Get current round and problem
    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId }
    });

    if (!squidGame) throw new Error("Tournament not found");

    const round = await Database.client.squidGameRound.findFirst({
      where: {
        squidGameId,
        roundNumber: squidGame.currentRound
      }
    });

    if (!round) throw new Error("Round not found");

    // 2. Queue the submission via the standard SubmissionService
    // This will trigger the judge worker
    return await SubmissionService.processSubmission({
      userId,
      problemId: round.problemId,
      code,
      language,
      squidGameId,
      type
    });
  }

  /**
   * Process the final result from the judge (called by server listener)
   */
  static async handleSquidGameResult(data) {
    const { squidGameId, userId, code, language, status, executionTimeMs, passedTests, totalTests, score: maybeScore } = data;

    // 1. Get current round
    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId }
    });

    const round = await Database.client.squidGameRound.findFirst({
      where: {
        squidGameId,
        roundNumber: squidGame.currentRound
      }
    });

    // 2. Calculate score (if not already provided)
    const score = maybeScore || this.calculateScore(
      status,
      executionTimeMs,
      passedTests,
      totalTests
    );

    // 3. Get participant
    const participant = await Database.client.squidGameParticipant.findUnique({
      where: {
        squidGameId_userId: { squidGameId, userId }
      }
    });

    if (!participant) return;

    // 4. Create internal SquidGameSubmission record for history/round tracking
    await Database.client.squidGameSubmission.create({
      data: {
        roundId: round.id,
        participantId: participant.id,
        code: code || "// Redacted",
        language: language || (participant.language) || "java",
        status,
        score,
        executionTimeMs,
        testCasesPassed: passedTests,
        totalTestCases: totalTests,
        submittedAt: new Date()
      }
    });

    // 5. Update participant total score
    const roundScores = [...(participant.roundScores || []), score];
    const totalScore = roundScores.reduce((a, b) => a + b, 0);

    await Database.client.squidGameParticipant.update({
      where: { id: participant.id },
      data: {
        roundScores,
        totalScore
      }
    });

    // 6. Broadcast updated leaderboard
    const leaderboard = await this.getSquidGameLeaderboard(squidGameId);
    if (SocketEmitter.io) {
      SquidGameSocket.broadcastLeaderboardUpdate(SocketEmitter.io, squidGameId, leaderboard);
    }

    return { score, totalScore };
  }

  /**
   * End current round and eliminate players
   * Uses configuration from SquidGameConfig
   */
  static async endRoundAndEliminate(squidGameId) {
    const tempSquidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId }
    });

    if (!tempSquidGame) throw new Error("Tournament not found");

    const config = SquidGameConfig.DIFFICULTY_PROGRESSION[tempSquidGame.currentRound - 1];
    const eliminationPercentage = config?.eliminationPercentage || 0.5;

    console.log(`🏆 [Service] Ending Round ${tempSquidGame.currentRound} for ${squidGameId}`);
    console.log(`   - Elimination Target: ${eliminationPercentage * 100}%`);

    const squidGame = await Database.client.squidGame.findUnique({
      where: { id: squidGameId },
      include: {
        participants: {
          where: { status: "ACTIVE" },
          include: {
            submissions: {
              where: {
                round: {
                  roundNumber: tempSquidGame.currentRound
                }
              }
            }
          }
        },
        roundProblems: {
          where: {
            roundNumber: tempSquidGame.currentRound
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

      // 🎙️ AI Game Master Victory Speech
      this.broadcastGameMasterMessage(squidGameId, "TOURNAMENT_WINNER", {
        winner: winner.username,
        finalScore: winner.score
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

    // Move to ROUND_ENDED status (waits for host to click Next Round)
    await Database.client.squidGame.update({
      where: { id: squidGameId },
      data: {
        status: "ROUND_ENDED"
      }
    });

    // 🎙️ AI Game Master Elimination Comment
    this.broadcastGameMasterMessage(squidGameId, "ELIMINATION_PHASE", {
      eliminatedCount: toEliminate,
      remainingCount: remaining,
      roundNumber: squidGame.currentRound
    });

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
   * Returns a plain array of participants sorted by score
   */
  static async getSquidGameLeaderboard(squidGameId) {
    const participants = await Database.client.squidGameParticipant.findMany({
      where: { squidGameId },
      include: {
        user: {
          select: { username: true }
        }
      },
      orderBy: { totalScore: "desc" }
    });

    return participants.map((p, idx) => ({
      rank: idx + 1,
      userId: p.userId,
      username: p.user.username,
      score: p.totalScore,
      status: p.status,
      roundsSurvived: p.roundsEliminated
    }));
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

  /**
   * Disqualify a participant (Host only)
   */
  static async disqualifyParticipant(squidGameId, userId) {
    const participant = await Database.client.squidGameParticipant.findUnique({
      where: {
        squidGameId_userId: { squidGameId, userId }
      }
    });

    if (!participant) throw new Error("Participant not found");

    const updatedParticipant = await Database.client.squidGameParticipant.update({
      where: { id: participant.id },
      data: {
        status: "ELIMINATED",
        eliminatedAt: new Date()
      }
    });

    // Broadcast updated leaderboard
    const leaderboard = await this.getSquidGameLeaderboard(squidGameId);
    if (SocketEmitter.io) {
      SquidGameSocket.broadcastLeaderboardUpdate(SocketEmitter.io, squidGameId, leaderboard);
    }

    return updatedParticipant;
  }

  /**
   * Generate and broadcast an AI Game Master message
   */
  static async broadcastGameMasterMessage(squidGameId, type, context) {
    try {
      const message = await AIService.generateGameMasterComment(type, context);
      if (SocketEmitter.io) {
        SocketEmitter.io.to(`squidgame_${squidGameId}`).emit("game_master_broadcast", {
          message,
          type
        });
        console.log(`🎙️ [AI Game Master] Broadcasted: "${message}"`);
      }
    } catch (err) {
      console.error("AI Game Master Broadcast Error:", err.message);
    }
  }
}

export default SquidGameService;
