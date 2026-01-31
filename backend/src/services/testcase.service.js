// Manages:

import prisma from "../config/db.js";

// • Fetch testcases
// • Generate random ones (later)

export async function addTestcaseService(problemId, testcases) {
    const testCase = await prisma.testCase.createMany({
        data: testcases.map(tc => ({
            problemId: problemId,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden || true,
        }))
    });

    await redis.del(`problem:${problemId}`);

    return testCase;
}