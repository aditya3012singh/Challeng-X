
import prisma from "../config/db.js";
import { generateBattleCode } from "../utils/battleCode.js";
import { logger } from "../utils/logger.js";

// Create a new team battle
export const createTeamBattleService = async (team1Id, team2Id, problemId, maxTeamSize) => {
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

    // Check if problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new Error("Problem not found");
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
        problemId,
        maxTeamSize,
        status: "waiting", // waiting, started, completed
        currentRound: 1,
      },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        problem: true,
      },
    });

    logger.info(`Team battle created: ${teamBattle.battleCode}`);
    return teamBattle;
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
        problem: true,
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
        problem: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return teamBattles;
  } catch (error) {
    logger.error("Error fetching team battles:", error);
    throw error;
  }
};

// Start team battle (change status from waiting to started)
export const startTeamBattleService = async (battleCode) => {
  try {
    const teamBattle = await prisma.teamBattle.update({
      where: { battleCode },
      data: {
        status: "started",
        startedAt: new Date(),
      },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        problem: true,
      },
    });

    logger.info(`Team battle started: ${battleCode}`);
    return teamBattle;
  } catch (error) {
    logger.error("Error starting team battle:", error);
    throw error;
  }
};

// Submit solution for team battle
export const submitTeamBattleSolutionService = async (
  battleCode,
  userId,
  code,
  language,
  output
) => {
  try {
    const teamBattle = await prisma.teamBattle.findUnique({
      where: { battleCode },
      include: {
        team1: { include: { members: true } },
        team2: { include: { members: true } },
      },
    });

    if (!teamBattle) {
      throw new Error("Team battle not found");
    }

    if (teamBattle.status !== "started") {
      throw new Error("Team battle has not started");
    }

    // Check if user is part of the battle
    const userTeamId = teamBattle.team1.members.some((m) => m.userId === userId)
      ? teamBattle.team1Id
      : teamBattle.team2.members.some((m) => m.userId === userId)
      ? teamBattle.team2Id
      : null;

    if (!userTeamId) {
      throw new Error("User is not part of this team battle");
    }

    // Create submission
    const submission = await prisma.teamBattleSubmission.create({
      data: {
        teamBattleId: teamBattle.id,
        submittedById: userId,
        code,
        language,
        output,
        status: "pending",
      },
      include: { submittedBy: true },
    });

    logger.info(
      `Submission created for team battle ${battleCode} by user ${userId}`
    );
    return submission;
  } catch (error) {
    logger.error("Error submitting team battle solution:", error);
    throw error;
  }
};

// Get team battle submissions
export const getTeamBattleSubmissionsService = async (battleCode) => {
  try {
    const teamBattle = await prisma.teamBattle.findUnique({
      where: { battleCode },
    });

    if (!teamBattle) {
      throw new Error("Team battle not found");
    }

    const submissions = await prisma.teamBattleSubmission.findMany({
      where: { teamBattleId: teamBattle.id },
      include: { submittedBy: true },
      orderBy: { createdAt: "asc" },
    });

    return submissions;
  } catch (error) {
    logger.error("Error fetching team battle submissions:", error);
    throw error;
  }
};

// End team battle and determine winner
export const completeTeamBattleService = async (battleCode, winnerTeamId) => {
  try {
    const teamBattle = await prisma.teamBattle.update({
      where: { battleCode },
      data: {
        status: "completed",
        winnerTeamId,
        completedAt: new Date(),
      },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        problem: true,
      },
    });

    // Update ranking points for winning team members
    const winningTeam =
      winnerTeamId === teamBattle.team1Id ? teamBattle.team1 : teamBattle.team2;
    const losingTeam =
      winnerTeamId === teamBattle.team1Id ? teamBattle.team2 : teamBattle.team1;

    // Award points to winning team (more than 1v1 since it's harder)
    const pointsPerMember = 25;
    for (const member of winningTeam.members) {
      await prisma.user.update({
        where: { id: member.userId },
        data: {
          rankPoints: {
            increment: pointsPerMember,
          },
        },
      });
    }

    // Deduct small amount from losing team
    const deductPerMember = 5;
    for (const member of losingTeam.members) {
      await prisma.user.update({
        where: { id: member.userId },
        data: {
          rankPoints: {
            decrement: deductPerMember,
          },
        },
      });
    }

    logger.info(`Team battle completed: ${battleCode}, Winner: Team ${winnerTeamId}`);
    return teamBattle;
  } catch (error) {
    logger.error("Error completing team battle:", error);
    throw error;
  }
};

// Get active team battles (waiting or started)
export const getActiveTeamBattlesService = async () => {
  try {
    const activeBattles = await prisma.teamBattle.findMany({
      where: {
        status: {
          in: ["waiting", "started"],
        },
      },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        problem: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return activeBattles;
  } catch (error) {
    logger.error("Error fetching active team battles:", error);
    throw error;
  }
};
