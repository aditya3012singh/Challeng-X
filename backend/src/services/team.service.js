// Team management service

import Database from "../config/db.js";
import { generateBattleCode } from "../utils/battleCode.js";

/**
 * Create a new team
 */
class TeamService {
  static async createTeamService(creatorId, teamName, maxTeamSize) {
  if (![2, 3, 4, 5].includes(maxTeamSize)) {
    throw new Error("Team size must be 2, 3, 4, or 5");
  }

  const teamCode = await generateBattleCode();

  const team = await Database.client.team.create({
    data: {
      name: teamName,
      teamCode,
      creatorId,
      members: {
        create: {
          userId: creatorId
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              rankPoints: true
            }
          }
        }
      }
    }
  });

  return team;
  }

/**
 * Get team details
 */
  static async getTeamService(teamId) {
  const team = await Database.client.team.findUnique({
    where: { id: teamId },
    include: {
      creator: {
        select: {
          id: true,
          username: true
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              rankPoints: true,
              wins: true,
              losses: true
            }
          }
        }
      }
    }
  });

  if (!team) {
    throw new Error("Team not found");
  }

  return team;
  }

/**
 * Get team by code
 */
  static async getTeamByCodeService(teamCode) {
  const team = await Database.client.team.findUnique({
    where: { teamCode },
    include: {
      creator: {
        select: {
          id: true,
          username: true
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              rankPoints: true
            }
          }
        }
      }
    }
  });

  if (!team) {
    throw new Error("Team not found");
  }

  return team;
  }

/**
 * Join a team
 */
  static async joinTeamService(teamCode, userId) {
  const team = await Database.client.team.findUnique({
    where: { teamCode },
    include: {
      members: true
    }
  });

  if (!team) {
    throw new Error("Team not found");
  }

  // Check if user is already in team
  const existingMember = await Database.client.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId: team.id
      }
    }
  });

  if (existingMember) {
    throw new Error("Already a member of this team");
  }

  // Check team size - need to know max size from somewhere
  // For now, assume max is 5
  if (team.members.length >= 5) {
    throw new Error("Team is full");
  }

  const member = await Database.client.teamMember.create({
    data: {
      userId,
      teamId: team.id
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          rankPoints: true
        }
      }
    }
  });

  return { message: "Joined team successfully", member };
  }

/**
 * Leave a team
 */
  static async leaveTeamService(teamId, userId) {
  const team = await Database.client.team.findUnique({
    where: { id: teamId },
    include: {
      members: true
    }
  });

  if (!team) {
    throw new Error("Team not found");
  }

  // Check if user is creator
  if (team.creatorId === userId && team.members.length > 1) {
    throw new Error("Creator cannot leave team while members exist. Disband the team instead.");
  }

  await Database.client.teamMember.delete({
    where: {
      userId_teamId: {
        userId,
        teamId
      }
    }
  });

  // If team is empty, delete it
  const remainingMembers = await Database.client.teamMember.count({
    where: { teamId }
  });

  if (remainingMembers === 0) {
    await Database.client.team.delete({ where: { id: teamId } });
  }

  return { message: "Left team successfully" };
  }

/**
 * Disband team (creator only)
 */
  static async disbandTeamService(teamId, userId) {
  const team = await Database.client.team.findUnique({
    where: { id: teamId }
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.creatorId !== userId) {
    throw new Error("Only team creator can disband the team");
  }

  // Delete all members first
  await Database.client.teamMember.deleteMany({
    where: { teamId }
  });

  // Delete team
  await Database.client.team.delete({
    where: { id: teamId }
  });

  return { message: "Team disbanded successfully" };
  }

/**
 * Get user's teams
 */
  static async getUserTeamsService(userId) {
    console.log("Fetching teams for user:", userId);
  const teams = await Database.client.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          creator: {
            select: {
              id: true,
              username: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  rankPoints: true
                }
              }
            }
          },
          teamBattlesAsTeam1: {
            where: { status: "ONGOING" },
            select: { id: true, battleCode: true, status: true },
            take: 1
          },
          teamBattlesAsTeam2: {
            where: { status: "ONGOING" },
            select: { id: true, battleCode: true, status: true },
            take: 1
          }
        }
      }
    }
  });

  console.log(teams.length, "teams found for user", userId);
  return teams.map(t => t.team);
  }
}

export default TeamService;
