import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function injectTestCases() {
    const problem = await prisma.problem.findFirst({
        where: { title: "Sum of Two Numbers" }
    });

    if (!problem) {
        console.log("Problem not found.");
        process.exit(1);
    }

    console.log(`Injecting 50 heavy test cases for: ${problem.title}`);

    const testCasesData = [];

    for (let i = 0; i < 50; i++) {
        const a = getRandomInt(-1000, 1000);
        const b = getRandomInt(-1000, 1000);

        testCasesData.push({
            problemId: problem.id,
            input: `${a} ${b}\n`,
            output: `${a + b}\n`,
            isHidden: true,
            isSample: false
        });
    }

    const result = await prisma.testCase.createMany({
        data: testCasesData
    });

    console.log(`Successfully injected ${result.count} hidden test cases into the Postgres/SQLite database.`);
    process.exit(0);
}

injectTestCases().catch(e => {
    console.error(e);
    process.exit(1);
});
