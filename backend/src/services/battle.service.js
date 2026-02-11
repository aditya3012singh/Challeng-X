// Controls battle rules:

import RedisClient from "../cache/redis.client.js";
import Database from "../config/db.js";
import RankingService from "./ranking.service.js";
import { emitToBattle } from "../config/socket.js";
import BattleCode from "../utils/battleCode.js";
// • Start timer
// • Assign problem
// • End match
// • Decide winner

class BattleService {
  static async createBattleRandomQuestionService(player1Id){

    const problems = await Database.client.problem.findMany();
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];

    const battleCode = await BattleCode.generateBattleCode();

    const battle = await Database.client.battle.create({
        data: {
            player1Id,
            problemId: randomProblem.id,
            status: "WAITING",
            battleCode,
        }
    });

    return battle;
  }

  static async createBattleWithSelectedQuestionService(player1Id, problemId){
    const battleCode = await BattleCode.generateBattleCode();

    const battle = await Database.client.battle.create({
        data: {
            player1Id,
            problemId,
            status: "WAITING",
            battleCode,
        }
    });
    
    return battle;
  }

  static async joinBattleService(battleCode, player2Id){

    const battleExists = await Database.client.battle.findUnique({
        where: { battleCode }
    });

    if(!battleExists){
        throw new Error("Battle not available");
    }

    if(battleExists.player1Id === player2Id){
        throw new Error("Cannot join your own battle");
    }

    if(battleExists.status !== "WAITING"){
        throw new Error("Battle already started");
    }

    if(battleExists.player2Id){
        throw new Error("Battle already has two players");
    }

    const battle = await Database.client.battle.update({
        where: { battleCode },
        data: {
            player2Id,
            status: "ONGOING",
            startedAt: new Date(),
        }
    });

    emitToBattle(battle.id, "playerJoined", {
      playerId: player2Id
    });

    emitToBattle(battle.id, "battleStarted", {
      startedAt: new Date()
    });

    return battle;
  }
//         throw new Error("Cannot join your own battle");
//     }

//     if(battleExists.status !== "WAITING"){
//         throw new Error("Battle already started");
//     }

//     if(battleExists.player2Id){
//         throw new Error("Battle already has two players");
//     }

//     const battle = await prisma.battle.update({
//         where: { id: battleId },
//         data: {
//             player2Id,
//             status: "ONGOING",
//             startedAt: new Date(),
//         }
//     });

//     emitToBattle(battleId, "playerJoined", {
//       playerId: player2Id
//     });

//     emitToBattle(battleId, "battleStarted", {
//       startedAt: new Date()
//     });

//     return battle;
// }

  static async getBattle(battleId){
    const battle = await Database.client.battle.findUnique({
        where: { id: battleId },
        include: {
            problem: {
              select:{
                id: true, title: true, difficulty: true, description: true, timeLimitMs: true, testcases: true
              }
            }
        }
    });
    return battle;
  }

  static async finishBattleService(battleId, winnerId){
    const battle= await Database.client.battle.findUnique({
        where: { id: battleId },
    });

    const loserId = (battle.player1Id === winnerId) ? battle.player2Id : battle.player1Id;

    await RankingService.updateRanks(winnerId, loserId);

    const battleResult = await Database.client.battle.update({
        where: { id: battleId },
        data: {
            status: "FINISHED",
            endedAt: new Date(),
            winnerId,
        }
    });
    emitToBattle(battleId, "battleFinished", {
      winnerId
    });

    await RedisClient.client.flushall(); 
    return battleResult;
  }

  static async getBattleHistory(userId, page = 1, limit = 10) {

  const skip = (page - 1) * limit;

  const battles = await Database.client.battle.findMany({
    where: {
      OR: [
        { player1Id: userId },
        { player2Id: userId }
      ],
      status: "FINISHED"
    },
    skip,
    take: limit,
    orderBy: {
      endedAt: "desc"
    },
    include: {
      problem: {
        select: {
          title: true,
          difficulty: true
        }
      },
      player1: {
        select: { username: true }
      },
      player2: {
        select: { username: true }
      }
    }
  });

  const total = await Database.client.battle.count({
    where: {
      OR: [
        { player1Id: userId },
        { player2Id: userId }
      ],
      status: "FINISHED"
    }
  });

  return {
    data: battles,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
  }
}

export default BattleService;
