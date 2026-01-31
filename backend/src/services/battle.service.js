// Controls battle rules:

import prisma from "../config/db.js";

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
            problem: true,
        }
    });
    return battle;
}

export async function finishBattleService(battleId, winnerId){
    const battle = await prisma.battle.update({
        where: { id: battleId },
        data: {
            status: "FINISHED",
            endedAt: new Date(),
            winnerId,
        }
    });
    return battle;
}

