import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const count = await prisma.problem.count();
    const problems = await prisma.problem.findMany({
        select: { title: true, difficulty: true }
    });
    console.log(`Total Problems: ${count}`);
    console.log("Problems List:");
    problems.forEach(p => console.log(`- [${p.difficulty}] ${p.title}`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
