import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const submissionId = "12e49ab0-ebb6-4422-aa64-a29dc9b56a63";
    const sub = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: { battle: true }
    });

    if (!sub) {
        console.log("Submission not found in DB.");
        return;
    }

    console.log("Submission Details:");
    console.log(`ID: ${sub.id}`);
    console.log(`Type: ${sub.type}`);
    console.log(`Status: ${sub.status}`);
    console.log(`Battle ID: ${sub.battleId}`);
    if (sub.battle) {
        console.log(`Battle Attempts P1: ${sub.battle.attemptsPlayer1}`);
        console.log(`Battle Attempts P2: ${sub.battle.attemptsPlayer2}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
