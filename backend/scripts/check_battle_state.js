import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const battles = await prisma.battle.findMany({
        where: { status: 'ONGOING' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { submissions: true }
    });

    if (battles.length === 0) {
        console.log("No ongoing battles found.");
        return;
    }

    battles.forEach((battle, bIdx) => {
        console.log(`--- Battle ${bIdx + 1} ---`);
        console.log(`ID: ${battle.id}`);
        console.log(`Status: ${battle.status}`);
        console.log(`Attempts P1: ${battle.attemptsPlayer1}`);
        console.log(`Attempts P2: ${battle.attemptsPlayer2}`);
        console.log(`Submissions: ${battle.submissions.length}`);

        battle.submissions.forEach((s, sIdx) => {
            console.log(`  S${sIdx + 1}: ID=${s.id.slice(0, 8)}, Type=${s.type}, Status=${s.status}, CreatedAt=${s.createdAt.toISOString()}`);
        });
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
