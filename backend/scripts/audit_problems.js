import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProblems() {
    const problems = await prisma.problem.findMany({
        include: {
            testcases: true,
        },
    });

    console.log(`Found ${problems.length} total problems in Database.\n`);

    problems.forEach(p => {
        console.log(`[${p.difficulty}] ${p.title}`);
        console.log(`  Constraints: ${p.constraints ? '✅ Present' : '❌ MISSING!'}`);
        console.log(`  Test Cases: ${p.testcases.length} total (${p.testcases.filter(tc => !tc.isHidden || tc.isSample).length} sample)`);

        if (p.testcases.length === 0) {
            console.log(`  🚨 WARNING: Problem has NO test cases!\n`);
        } else {
            // Check for malformed data
            let badTc = p.testcases.find(tc => !tc.input.trim() || !tc.output.trim());
            if (badTc) {
                console.log(`  🚨 WARNING: Problem has malformed (empty) testcases!\n`);
            } else {
                console.log(`  ✅ Test cases appear well-formed.\n`);
            }
        }
    });

    await prisma.$disconnect();
}

checkProblems().catch(e => {
    console.error(e);
    process.exit(1);
});
