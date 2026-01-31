
// create problems service

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
    return problem;
}

export async function getAllProblemsService() {
    return await prisma.problem.findMany({
        select: {
            id: true,
            title: true,
            difficulty: true,
        }
    });
}

export async function getProblemByIdService(problemId) {
    return await prisma.problem.findUnique({
        where: { id: problemId },
        include: {
            testcases: true,
        }
    });
}