import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding sample test cases...");
    const problems = await prisma.problem.findMany({
        include: { testcases: true }
    });

    for (const problem of problems) {
        if (problem.testcases.length > 0) {
            // Mark up to first 3 test cases as sample
            const sampleIds = problem.testcases.slice(0, 3).map(tc => tc.id);

            await prisma.testCase.updateMany({
                where: { id: { in: sampleIds } },
                data: { isSample: true }
            });
            console.log(`✅ Problem "${problem.title}": Marked ${sampleIds.length} cases as Samples.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
