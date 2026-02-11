// Manages:

import RedisClient from "../cache/redis.client.js";
import Database from "../config/db.js";

// • Fetch testcases
// • Generate random ones (later)

class TestcaseService {
    static async addTestcaseService(problemId, testcases) {
    const testCase = await Database.client.testCase.createMany({
        data: testcases.map(tc => ({
            problemId: problemId,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden || true,
        }))
    });

    await RedisClient.client.del(`problem:${problemId}`);

    return testCase;
    }
}

export default TestcaseService;