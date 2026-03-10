
import Database from "./src/config/db.js";

async function verifyIds() {
    try {
        const tournaments = await Database.client.squidGame.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true }
        });

        console.log("--- Tournaments in DB ---");
        tournaments.forEach(t => {
            console.log(`ID: "${t.id}" Name: ${t.name}`);
        });

        const submissions = await Database.client.submission.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, squidGameId: true, userId: true }
        });

        console.log("\n--- Latest Submissions ---");
        submissions.forEach(s => {
            console.log(`ID: ${s.id} SquidGameId: "${s.squidGameId}" UserId: ${s.userId}`);
        });

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        await Database.client.$disconnect();
    }
}

verifyIds();
