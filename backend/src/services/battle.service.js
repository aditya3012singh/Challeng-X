// Controls battle rules:

import redis from "../cache/redis.client.js";
import prisma from "../config/db.js";
import { updateRanks } from "./ranking.service.js";

// • Start timer
// • Assign problem
// • End match
// • Decide winner

export async function createBattleRandomQuestionService(player1Id){

    const problems = await prisma.problem.findMany();
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];

    const battle = await prisma.battle.create({
        data: {
            player1Id,
            problemId: randomProblem.id,
            status: "WAITING",
        }
    });

    return battle;
}

export async function createBattleWithSelectedQuestionService(player1Id, problemId){
    const battle = await prisma.battle.create({
        data: {
            player1Id,
            problemId,
            status: "WAITING",
        }
    });
    console.log("Battle created with selected question:", battle);
    return battle;
}

export async function joinBattleService(battleId, player2Id){

    const battleExists = await prisma.battle.findUnique({
        where: { id: battleId }
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

    const battle = await prisma.battle.update({
        where: { id: battleId },
        data: {
            player2Id,
            status: "ONGOING",
            startedAt: new Date(),
        }
    });
    return battle;
}

export async function getBattle(battleId){
    const battle = await prisma.battle.findUnique({
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

export async function finishBattleService(battleId, winnerId){
    const battle= await prisma.battle.findUnique({
        where: { id: battleId },
    });

    const loserId = (battle.player1Id === winnerId) ? battle.player2Id : battle.player1Id;

    await updateRanks(winnerId, loserId);

    const battleResult = await prisma.battle.update({
        where: { id: battleId },
        data: {
            status: "FINISHED",
            endedAt: new Date(),
            winnerId,
        }
    });
    await redis.flushall(); 
    return battleResult;
}

export async function getBattleHistory(userId, page = 1, limit = 10) {

  const skip = (page - 1) * limit;

  const battles = await prisma.battle.findMany({
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

  const total = await prisma.battle.count({
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
