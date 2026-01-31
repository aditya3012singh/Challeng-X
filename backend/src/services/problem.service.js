
// create problems service

import redis from "../cache/redis.client.js";
import prisma from "../config/db.js"

export async function createProblemService(data) {
    const problem = await prisma.problem.create({
        data:{
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            timeLimitMs: data.timeLimitMs || 2000,
            // memoryLimitMb: data.memoryLimitMb || 256,
        }
    })
    await redis.del("problems:all");
    return problem;
}

export async function getAllProblemsService() {
    const key= "problems:all";

    const cached = await redis.get(key);

    if(cached){
        return JSON.parse(cached);
    }   

    const problems= await prisma.problem.findMany({
        select: {
            id: true,
            title: true,
            difficulty: true,
        }
    });
    await redis.set(key, JSON.stringify(problems), 'EX', 3600); 
    return problems;
}

export async function getProblemByIdService(problemId) {
    const key= `problem:${problemId}`;

    const cached = await redis.get(key);
    if(cached){
        return JSON.parse(cached);
    }

    const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: {
            testcases: true,
        }
    });
    await redis.set(key, JSON.stringify(problem), 'EX', 3600); 
    return problem;
}