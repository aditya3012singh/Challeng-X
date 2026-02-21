import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const battles = await prisma.battle.findMany({
        where: {
            problem: { title: { contains: 'Binary Search', mode: 'insensitive' } }
        },
        include: { submissions: true, problem: true },
        orderBy: { createdAt: 'desc' }
    });

    if (battles.length === 0) {
        console.log("No Binary Search battles found.");
        return;
    }

    battles.forEach((b, i) => {
        console.log(`--- Battle ${i + 1} ---`);
        console.log(`ID: ${b.id}`);
        console.log(`Attempts P1: ${b.attemptsPlayer1}`);
        console.log(`Attempts P2: ${b.attemptsPlayer2}`);
        console.log(`Submissions Count: ${b.submissions.length}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
