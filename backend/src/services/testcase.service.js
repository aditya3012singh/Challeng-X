// Manages:

import prisma from "../config/db.js";

// • Fetch testcases
// • Generate random ones (later)

export async function addTestcaseService(problemId, testcases) {
    return prisma.testCase.createMany({
        data: testcases.map(tc => ({
            problemId: problemId,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden || true,
        }))
    });
}