
import prisma from "../config/db.js";
import { generateBattleCode } from "../utils/battleCode.js";
import { logger } from "../utils/logger.js";

// Create a new tournament-style team battle with individual matches
export const createTeamBattleService = async (team1Id, team2Id, maxTeamSize) => {
  try {
    // Validate teams exist and have correct size
    const [team1, team2] = await Promise.all([
      prisma.team.findUnique({
        where: { id: team1Id },
        include: { members: { include: { user: true } } },
      }),
      prisma.team.findUnique({
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
      existingBattle = await prisma.teamBattle.findUnique({
        where: { battleCode },
      });
      attempts++;
    } while (existingBattle && attempts < 5);

    if (existingBattle) {
      throw new Error("Failed to generate unique battle code");
    }

    // Create the team battle
    const teamBattle = await prisma.teamBattle.create({
      data: {
        battleCode,
        team1Id,
        team2Id,
        maxTeamSize,
        status: "WAITING",
      },
    });

    // Create individual matches between paired members
    const matches = [];
    for (let i = 0; i < maxTeamSize; i++) {
      const player1 = team1.members[i];
      const player2 = team2.members[i];

      const match = await prisma.teamBattleMatch.create({
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

    const battleWithMatches = await prisma.teamBattle.findUnique({
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
};

// Get team battle by battle code
export const getTeamBattleService = async (battleCode) => {
  try {
    const teamBattle = await prisma.teamBattle.findUnique({
      where: { battleCode },
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
};

// Get team battles for a team
export const getTeamBattlesService = async (teamId) => {
  try {
    const teamBattles = await prisma.teamBattle.findMany({
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
};

// Start team battle
export const startTeamBattleService = async (battleCode) => {
  try {
    // Update main battle status
    const teamBattle = await prisma.teamBattle.update({
      where: { battleCode },
      data: {
        status: "ONGOING",
        startedAt: new Date(),
      },
    });

    // Update all matches to started
    await prisma.teamBattleMatch.updateMany({
      where: { teamBattleId: teamBattle.id },
      data: {
        status: "ONGOING",
        startedAt: new Date(),
      },
    });

    const updatedBattle = await getTeamBattleService(battleCode);
    logger.info(`Team battle started: ${battleCode}`);
    return updatedBattle;
  } catch (error) {
    logger.error("Error starting team battle:", error);
    throw error;
  }
};

// Submit solution for individual match
export const submitMatchSolutionService = async (
  battleCode,
  matchId,
  userId,
  code,
  language,
  output
) => {
  try {
    const teamBattle = await prisma.teamBattle.findUnique({
      where: { battleCode },
      include: { matches: true },
    });

    if (!teamBattle) {
      throw new Error("Team battle not found");
    }

    const match = await prisma.teamBattleMatch.findUnique({
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
    const updatedMatch = await prisma.teamBattleMatch.update({
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
    await prisma.teamBattleSubmission.create({
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
};

// Determine match winner (both submitted, compare who finished first or output correctness)
export const determineMatchWinnerService = async (matchId, winnerId) => {
  try {
    const match = await prisma.teamBattleMatch.update({
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
      await prisma.teamBattle.update({
        where: { id: match.teamBattleId },
        data: {
          team1Wins: { increment: 1 },
        },
      });
    } else {
      await prisma.teamBattle.update({
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
};

// Complete team battle (check if all matches are done and determine overall winner)
export const completeTeamBattleService = async (battleCode) => {
  try {
    const teamBattle = await prisma.teamBattle.findUnique({
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
    const completedBattle = await prisma.teamBattle.update({
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
      await prisma.user.update({
        where: { id: member.userId },
        data: {
          rankPoints: { increment: pointsPerMember },
          wins: { increment: 1 },
        },
      });
    }

    const deductPerMember = 5;
    for (const member of losingTeam.members) {
      await prisma.user.update({
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
};

// Get active team battles
export const getActiveTeamBattlesService = async () => {
  try {
    const activeBattles = await prisma.teamBattle.findMany({
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
};
