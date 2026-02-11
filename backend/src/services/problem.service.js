
// create problems service

import RedisClient from "../cache/redis.client.js";
import Database from "../config/db.js"

class ProblemService {
    static async createProblemService(data) {
    const problem = await Database.client.problem.create({
        data:{
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            timeLimitMs: data.timeLimitMs || 2000,
            // memoryLimitMb: data.memoryLimitMb || 256,
        }
    })
    await RedisClient.client.del("problems:all");
    return problem;
    }

    static async getAllProblemsService() {
    const key= "problems:all";

    const cached = await RedisClient.client.get(key);

    if(cached){
        return JSON.parse(cached);
    }   

    const problems= await Database.client.problem.findMany({
        select: {
            id: true,
            title: true,
            difficulty: true,
        }
    });
    await RedisClient.client.set(key, JSON.stringify(problems), 'EX', 3600); 
    return problems;
    }

    static async getProblemByIdService(problemId) {
    const key= `problem:${problemId}`;

    const cached = await RedisClient.client.get(key);
    if(cached){
        return JSON.parse(cached);
    }

    const problem = await Database.client.problem.findUnique({
        where: { id: problemId },
        include: {
            testcases: true,
        }
    });
    await RedisClient.client.set(key, JSON.stringify(problem), 'EX', 3600); 
    return problem;
    }
}

export default ProblemService;