
import Database from "../config/db.js";
import { generateBattleCode } from "../utils/battleCode.js";
import { logger } from "../utils/logger.js";

class TeamBattleNewService {
  // Generate a unique 6-character join code
  static generateJoinCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

// Create a new team battle by Team1 leader (waiting for Team2 to join)
  static async createTeamBattleByLeaderService(userId, team1Id, maxTeamSize) {
  try {
    // Validate team exists and user is the creator (leader)
    const team1 = await Database.client.team.findUnique({
      where: { id: team1Id },
      include: { 
        members: { 
          include: { user: true }
        } 
      },
    });

    if (!team1) {
      throw new Error("Team not found");
    }

    // Check if user is the creator (leader) of this team
    if (team1.creatorId !== userId) {
      throw new Error("Only team leaders can create battles");
    }

    // Generate unique join code
    let joinCode;
    let existingBattle;
    let attempts = 0;
    do {
      joinCode = this.generateJoinCode();
      existingBattle = await Database.client.teamBattle.findUnique({
        where: { joinCode },
      });
      attempts++;
    } while (existingBattle && attempts < 5);

    if (existingBattle) {
      throw new Error("Failed to generate unique join code");
    }

    // Generate unique battle code for reference
    const battleCode = await generateBattleCode();

    // Create the team battle (Team1 auto-joins)
    const teamBattle = await Database.client.teamBattle.create({
      data: {
        battleCode,
        joinCode,
        team1Id,
        createdByUserId: userId,
        maxTeamSize,
        status: "WAITING", // WAITING = Awaiting Team2 to join
      },
    });

    logger.info(`Team battle created by user ${userId}: ${teamBattle.id}`);

    return {
      id: teamBattle.id,
      joinCode: teamBattle.joinCode,
      battleCode: teamBattle.battleCode,
      team1Id: teamBattle.team1Id,
      maxTeamSize: teamBattle.maxTeamSize,
      status: "WAITING_FOR_TEAM2",
      createdAt: teamBattle.createdAt,
      message: "Battle created! Share this code with Team2: " + joinCode,
    };
  } catch (error) {
    logger.error(`Error creating team battle: ${error.message}`);
    throw error;
  }
  }

// Get available battles for Team2 to browse and join
  static async getAvailableBattlesService() {
  try {
    const availableBattles = await Database.client.teamBattle.findMany({
      where: {
        status: "WAITING", // Only battles waiting for Team2
        team2Id: null, // Team2 not yet joined
      },
      include: {
        team1: {
          include: {
            members: { include: { user: true } },
          },
        },
        createdBy: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return availableBattles.map(battle => ({
      id: battle.id,
      joinCode: battle.joinCode,
      team1Name: battle.team1?.name,
      createdBy: battle.createdBy?.username,
      maxTeamSize: battle.maxTeamSize,
      createdAt: battle.createdAt,
    }));
  } catch (error) {
    logger.error(`Error fetching available battles: ${error.message}`);
    throw error;
  }
  }

// Join a battle with join code (Team2 action)
  static async joinBattleWithCodeService(joinCode, userId, team2Id) {
  try {
    // Find battle by join code
    const teamBattle = await Database.client.teamBattle.findUnique({
      where: { joinCode },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        createdBy: { select: { username: true } },
      },
    });

    if (!teamBattle) {
      throw new Error("Invalid join code");
    }

    if (teamBattle.status !== "WAITING") {
      throw new Error("This battle is no longer available to join");
    }

    if (teamBattle.team2Id !== null) {
      throw new Error("Team2 has already joined this battle");
    }

    // Validate Team2 exists and user is the creator (leader)
    const team2 = await Database.client.team.findUnique({
      where: { id: team2Id },
      include: { 
        members: { 
          include: { user: true }
        } 
      },
    });

    if (!team2) {
      throw new Error("Team not found");
    }

    // Check if user is the creator (leader) of Team2
    if (team2.creatorId !== userId) {
      throw new Error("Only team leaders can join battles");
    }

    // Validate Team2 has required members
    const allTeam2Members = await Database.client.team.findUnique({
      where: { id: team2Id },
      include: { members: true },
    });

    if (allTeam2Members.members.length < teamBattle.maxTeamSize) {
      throw new Error(
        `Team2 must have at least ${teamBattle.maxTeamSize} members`
      );
    }

    // Update battle: Team2 joins
    const updatedBattle = await Database.client.teamBattle.update({
      where: { id: teamBattle.id },
      data: {
        team2Id,
        joinedByUserId: userId,
        status: "ONGOING", // Status changes to ONGOING when both teams joined
      },
    });

    logger.info(`User ${userId} joined battle ${teamBattle.id} with Team2 ${team2Id}`);

    return {
      id: updatedBattle.id,
      status: "READY_TO_START",
      message: "Team2 successfully joined! Battle is ready to start.",
      team1: teamBattle.team1,
      team2,
    };
  } catch (error) {
    logger.error(`Error joining battle: ${error.message}`);
    throw error;
  }
  }

// Create the old tournament-style team battle with individual matches (keeping for reference)
  static async createTeamBattleService(team1Id, team2Id, maxTeamSize) {
  try {
    // Validate teams exist and have correct size
    const [team1, team2] = await Promise.all([
      Database.client.team.findUnique({
        where: { id: team1Id },
        include: { members: { include: { user: true } } },
      }),
      Database.client.team.findUnique({
        where: { id: team2Id },
        include: { members: { include: { user: true } } },
      }),
    ]);

    if (!team1 || !team2) {
      throw new Error("One or both teams not found");
    }

    if (team1.members.length < maxTeamSize || team2.members.length < maxTeamSize) {
      throw new Error(
        `Both teams must have at least ${maxTeamSize} members to start battle`
      );
    }

    // Get random problems for each match (different for each pair)
    const problems = await prisma.problem.findMany({
      take: maxTeamSize,
      orderBy: { createdAt: "desc" },
    });

    if (problems.length < maxTeamSize) {
      throw new Error(
        `Not enough problems available (need ${maxTeamSize}, found ${problems.length})`
      );
    }

    // Generate unique battle code
    let battleCode;
    let existingBattle;
    let attempts = 0;
    do {
      battleCode = generateBattleCode();
      existingBattle = await Database.client.teamBattle.findUnique({
        where: { battleCode },
      });
      attempts++;
    } while (existingBattle && attempts < 5);

    if (existingBattle) {
      throw new Error("Failed to generate unique battle code");
    }

    // Create the team battle
    const teamBattle = await Database.client.teamBattle.create({
      data: {
        battleCode,
        team1Id,
        team2Id,
        createdByUserId: null,
        joinedByUserId: null,
        maxTeamSize,
        status: "WAITING",
      },
    });

    // Create individual matches between paired members
    const matches = [];
    for (let i = 0; i < maxTeamSize; i++) {
      const player1 = team1.members[i];
      const player2 = team2.members[i];

      const match = await Database.client.teamBattleMatch.create({
        data: {
          teamBattleId: teamBattle.id,
          player1Id: player1.userId,
          player2Id: player2.userId,
          problemId: problems[i].id,
          status: "WAITING",
        },
        include: {
          player1: true,
          player2: true,
          problem: true,
        },
      });

      matches.push(match);
    }

    const battleWithMatches = await Database.client.teamBattle.findUnique({
      where: { id: teamBattle.id },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        matches: {
          include: {
            player1: true,
            player2: true,
            problem: true,
          },
        },
      },
    });

    logger.info(`Tournament team battle created: ${teamBattle.battleCode} with ${maxTeamSize} matches`);
    return battleWithMatches;
  } catch (error) {
    logger.error("Error creating team battle:", error);
    throw error;
  }
  }

// Get team battle by battle code or ID
  static async getTeamBattleService(identifier) {
  try {
    // Try to find by ID first, then by battleCode
    const teamBattle = await Database.client.teamBattle.findFirst({
      where: {
        OR: [
          { id: identifier },
          { battleCode: identifier },
        ],
      },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        createdBy: { select: { id: true, username: true, email: true } },
        matches: {
          include: {
            player1: true,
            player2: true,
            problem: true,
          },
        },
        submissions: { include: { submittedBy: true } },
      },
    });

    if (!teamBattle) {
      throw new Error("Team battle not found");
    }

    return teamBattle;
  } catch (error) {
    logger.error("Error fetching team battle:", error);
    throw error;
  }
  }

// Get team battles for a team
  static async getTeamBattlesService(teamId) {
  try {
    const teamBattles = await Database.client.teamBattle.findMany({
      where: {
        OR: [{ team1Id: teamId }, { team2Id: teamId }],
      },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        matches: {
          include: {
            player1: true,
            player2: true,
            problem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return teamBattles;
  } catch (error) {
    logger.error("Error fetching team battles:", error);
    throw error;
  }
  }

// Start team battle
  static async startTeamBattleService(battleCode) {
  try {
    // Update main battle status
    const teamBattle = await Database.client.teamBattle.update({
      where: { battleCode },
      data: {
        status: "ONGOING",
        startedAt: new Date(),
      },
    });

    // Update all matches to started
    await Database.client.teamBattleMatch.updateMany({
      where: { teamBattleId: teamBattle.id },
      data: {
        status: "ONGOING",
        startedAt: new Date(),
      },
    });

    const updatedBattle = await this.getTeamBattleService(battleCode);
    logger.info(`Team battle started: ${battleCode}`);
    return updatedBattle;
  } catch (error) {
    logger.error("Error starting team battle:", error);
    throw error;
  }
  }

// Submit solution for individual match
  static async submitMatchSolutionService(
  battleCode,
  matchId,
  userId,
  code,
  language,
  output
) {
  try {
    const teamBattle = await Database.client.teamBattle.findUnique({
      where: { battleCode },
      include: { matches: true },
    });

    if (!teamBattle) {
      throw new Error("Team battle not found");
    }

    const match = await Database.client.teamBattleMatch.findUnique({
      where: { id: matchId },
      include: { player1: true, player2: true, problem: true },
    });

    if (!match) {
      throw new Error("Match not found");
    }

    if (match.teamBattleId !== teamBattle.id) {
      throw new Error("Match does not belong to this battle");
    }

    // Determine which player submitted
    let isPlayer1 = false;
    if (userId === match.player1Id) {
      isPlayer1 = true;
    } else if (userId === match.player2Id) {
      isPlayer1 = false;
    } else {
      throw new Error("User is not part of this match");
    }

    // Update match with submission
    const updatedMatch = await Database.client.teamBattleMatch.update({
      where: { id: matchId },
      data: {
        ...(isPlayer1
          ? { player1Submission: code, player1Language: language, player1Output: output }
          : { player2Submission: code, player2Language: language, player2Output: output }),
      },
      include: {
        player1: true,
        player2: true,
        problem: true,
      },
    });

    // Record submission for history
    await Database.client.teamBattleSubmission.create({
      data: {
        teamBattleId: teamBattle.id,
        submittedById: userId,
        code,
        language,
        output,
        status: "PASSED", // You can add actual test case validation here
      },
    });

    logger.info(`Solution submitted for match ${matchId} by user ${userId}`);
    return updatedMatch;
  } catch (error) {
    logger.error("Error submitting match solution:", error);
    throw error;
  }
  }

// Determine match winner (both submitted, compare who finished first or output correctness)
  static async determineMatchWinnerService(matchId, winnerId) {
  try {
    const match = await Database.client.teamBattleMatch.update({
      where: { id: matchId },
      data: {
        winnerId,
        status: "FINISHED",
        completedAt: new Date(),
      },
      include: {
        player1: true,
        player2: true,
        problem: true,
        teamBattle: {
          include: {
            team1: true,
            team2: true,
          },
        },
      },
    });

    // Update team win counts
    const isTeam1Winner =
      match.teamBattle.team1.members?.some((m) => m.userId === winnerId);

    if (isTeam1Winner) {
      await Database.client.teamBattle.update({
        where: { id: match.teamBattleId },
        data: {
          team1Wins: { increment: 1 },
        },
      });
    } else {
      await Database.client.teamBattle.update({
        where: { id: match.teamBattleId },
        data: {
          team2Wins: { increment: 1 },
        },
      });
    }

    logger.info(`Match ${matchId} won by user ${winnerId}`);
    return match;
  } catch (error) {
    logger.error("Error determining match winner:", error);
    throw error;
  }
  }

// Complete team battle (check if all matches are done and determine overall winner)
  static async completeTeamBattleService(battleCode) {
  try {
    const teamBattle = await Database.client.teamBattle.findUnique({
      where: { battleCode },
      include: {
        matches: true,
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
      },
    });

    if (!teamBattle) {
      throw new Error("Team battle not found");
    }

    // Check if all matches are complete
    const allComplete = teamBattle.matches.every((m) => m.status === "FINISHED");
    if (!allComplete) {
      throw new Error("Not all matches are complete");
    }

    // Determine overall winner based on wins
    let winnerTeamId;
    if (teamBattle.team1Wins > teamBattle.team2Wins) {
      winnerTeamId = teamBattle.team1Id;
    } else if (teamBattle.team2Wins > teamBattle.team1Wins) {
      winnerTeamId = teamBattle.team2Id;
    } else {
      // Tie - could implement tiebreaker logic here
      throw new Error("Battle ended in a tie - tiebreaker needed");
    }

    // Update battle status
    const completedBattle = await Database.client.teamBattle.update({
      where: { battleCode },
      data: {
        status: "FINISHED",
        completedAt: new Date(),
        winnerTeamId,
      },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        matches: {
          include: {
            player1: true,
            player2: true,
          },
        },
      },
    });

    // Award ranking points to winning team
    const winningTeam = winnerTeamId === teamBattle.team1Id ? teamBattle.team1 : teamBattle.team2;
    const losingTeam = winnerTeamId === teamBattle.team1Id ? teamBattle.team2 : teamBattle.team1;

    const pointsPerMember = 20;
    for (const member of winningTeam.members) {
      await Database.client.user.update({
        where: { id: member.userId },
        data: {
          rankPoints: { increment: pointsPerMember },
          wins: { increment: 1 },
        },
      });
    }

    const deductPerMember = 5;
    for (const member of losingTeam.members) {
      await Database.client.user.update({
        where: { id: member.userId },
        data: {
          rankPoints: { decrement: deductPerMember },
          losses: { increment: 1 },
        },
      });
    }

    logger.info(`Team battle completed: ${battleCode}, Winner: Team ${winnerTeamId}`);
    return completedBattle;
  } catch (error) {
    logger.error("Error completing team battle:", error);
    throw error;
  }
  }

// Get active team battles
  static async getActiveTeamBattlesService() {
  try {
    const activeBattles = await Database.client.teamBattle.findMany({
      where: {
        status: {
          in: ["WAITING", "ONGOING"],
        },
      },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        matches: {
          include: {
            player1: true,
            player2: true,
            problem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return activeBattles;
  } catch (error) {
    logger.error("Error fetching active team battles:", error);
    throw error;
  }
  }
// Get battle details by ID (for new join-code flow)
  static async getBattleDetailsService(battleId) {
  try {
    const battle = await Database.client.teamBattle.findUnique({
      where: { id: battleId },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        createdBy: { select: { username: true } },
        matches: {
          include: {
            player1: { select: { id: true, username: true } },
            player2: { select: { id: true, username: true } },
            problem: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!battle) {
      throw new Error("Battle not found");
    }

    return battle;
  } catch (error) {
    logger.error(`Error fetching battle details: ${error.message}`);
    throw error;
  }
  }

// Cancel a battle (only by creator before Team2 joins)
  static async cancelBattleService(battleId, userId) {
  try {
    const battle = await Database.client.teamBattle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      throw new Error("Battle not found");
    }

    if (battle.createdByUserId !== userId) {
      throw new Error("Only the battle creator can cancel the battle");
    }

    if (battle.team2Id !== null) {
      throw new Error("Cannot cancel battle once Team2 has joined");
    }

    const cancelledBattle = await Database.client.teamBattle.delete({
      where: { id: battleId },
    });

    logger.info(`Battle ${battleId} cancelled by user ${userId}`);
    return {
      success: true,
      message: "Battle cancelled successfully",
    };
  } catch (error) {
    logger.error(`Error cancelling battle: ${error.message}`);
    throw error;
  }
  }
}

export default TeamBattleNewService;