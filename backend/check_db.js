
import Database from "./src/config/db.js";

async function checkSubmissions() {
    try {
        const lastSubmissions = await Database.client.submission.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { username: true } },
                problem: { select: { title: true } }
            }
        });

        console.log("Last 10 submissions:");
        lastSubmissions.forEach(s => {
            console.log(`[${s.createdAt.toISOString()}] ${s.user.username} - ${s.problem.title} - ${s.status} (${s.type}) - squidGameId: ${s.squidGameId}`);
        });

        const queuedCount = await Database.client.submission.count({
            where: { status: 'QUEUED' }
        });
        console.log(`\nTotal QUEUED submissions: ${queuedCount}`);

        const runningCount = await Database.client.submission.count({
            where: { status: 'RUNNING' }
        });
        console.log(`Total RUNNING submissions: ${runningCount}`);

    } catch (error) {
        console.error("Error checking submissions:", error);
    } finally {
        await Database.client.$disconnect();
    }
}

checkSubmissions();
