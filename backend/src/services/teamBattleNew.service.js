
import Database from "../config/db.js";
import BattleCode from "../utils/battleCode.js";
import Logger from "../utils/logger.js";
import SocketServer from "../socket/socketServer.js";

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
      const battleCode = await BattleCode.generateBattleCode();

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

      // NOTIFY TEAM MEMBERS (Except the leader who is already creating it)
      if (SocketServer.io) {
        team1.members.forEach(member => {
          if (member.userId !== userId) {
            SocketServer.io.to(`user_${member.userId}`).emit("team_battle_invite", {
              battleId: teamBattle.id,
              battleCode: teamBattle.battleCode,
              teamName: team1.name,
              type: "CREATED"
            });
          }
        });
      }

      Logger.info(`Team battle created by user ${userId}: ${teamBattle.id}`);

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
      Logger.error(`Error creating team battle: ${error.message}`);
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
      Logger.error(`Error fetching available battles: ${error.message}`);
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
      if (team2.members.length < teamBattle.maxTeamSize) {
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
          status: "ONGOING", 
        },
      });

      // AUTOMATIC PAIRING LOGIC
      Logger.info(`Pairing members for battle ${teamBattle.id}`);
      const matches = await this.pairTeamMembers(
        teamBattle.id,
        teamBattle.team1.members,
        team2.members,
        teamBattle.maxTeamSize
      );

      // NOTIFY ALL MEMBERS (Both teams)
      if (SocketServer.io) {
        const allMembers = [...teamBattle.team1.members, ...team2.members];
        allMembers.forEach(member => {
          SocketServer.io.to(`user_${member.userId}`).emit("team_battle_invite", {
            battleId: teamBattle.id,
            battleCode: teamBattle.battleCode,
            teamName: member.teamId === teamBattle.team1Id ? teamBattle.team1.name : team2.name,
            type: "JOINED"
          });
        });
      }

      Logger.info(`User ${userId} joined battle ${teamBattle.id} with Team2 ${team2Id}. ${matches.length} matches created.`);

      // Return battle with matches
      return await this.getTeamBattleService(teamBattle.id);
    } catch (error) {
      Logger.error(`Error joining battle: ${error.message}`);
      throw error;
    }
  }

  // Helper to pair team members and create individual matches 
  static async pairTeamMembers(battleId, team1Members, team2Members, maxTeamSize) {
    try {
      const matches = [];

      // Get random problems for each match
      const problems = await Database.client.problem.findMany({
        take: maxTeamSize,
        orderBy: { createdAt: "desc" },
      });

      if (problems.length < maxTeamSize) {
        throw new Error(`Not enough problems available (need ${maxTeamSize}, found ${problems.length})`);
      }

      // Pairing logic: simple indexed pairing
      for (let i = 0; i < maxTeamSize; i++) {
        const p1 = team1Members[i];
        const p2 = team2Members[i];

        if (!p1 || !p2) continue;

        const match = await Database.client.teamBattleMatch.create({
          data: {
            teamBattleId: battleId,
            player1Id: p1.userId,
            player2Id: p2.userId,
            problemId: problems[i].id,
            status: "WAITING",
          },
        });
        matches.push(match);
      }

      return matches;
    } catch (error) {
      Logger.error(`Error pairing team members: ${error.message}`);
      throw error;
    }
  }

  // Get team battle by battle code or ID
  static async getTeamBattleService(identifier) {
    try {
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
      Logger.error("Error fetching team battle:", error);
      throw error;
    }
  }

  // Start team battle
  static async startTeamBattleService(battleCode) {
    try {
      const teamBattle = await Database.client.teamBattle.update({
        where: { battleCode },
        data: {
          status: "ONGOING",
          startedAt: new Date(),
        },
      });

      await Database.client.teamBattleMatch.updateMany({
        where: { teamBattleId: teamBattle.id },
        data: {
          status: "ONGOING",
          startedAt: new Date(),
        },
      });

      const updatedBattle = await this.getTeamBattleService(battleCode);
      Logger.info(`Team battle started: ${battleCode}`);
      return updatedBattle;
    } catch (error) {
      Logger.error("Error starting team battle:", error);
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
      });
      return activeBattles;
    } catch (error) {
      Logger.error("Error fetching active team battles:", error);
      throw error;
    }
  }

  // Get battle details by ID
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
      Logger.error(`Error fetching battle details: ${error.message}`);
      throw error;
    }
  }

  // Cancel a battle
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

      await Database.client.teamBattle.delete({
        where: { id: battleId },
      });

      Logger.info(`Battle ${battleId} cancelled by user ${userId}`);
      return { success: true, message: "Battle cancelled successfully" };
    } catch (error) {
      Logger.error(`Error cancelling battle: ${error.message}`);
      throw error;
    }
  }
}

export default TeamBattleNewService;
