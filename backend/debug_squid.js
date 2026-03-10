
import Database from "./src/config/db.js";

async function debugSquidSubmissions() {
    try {
        const lastSubmissions = await Database.client.submission.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { username: true } }
            }
        });

        console.log("--- Latest Submissions ---");
        lastSubmissions.forEach(s => {
            console.log(`[${s.createdAt.toISOString()}] ID: ${s.id} User: ${s.user.username} Status: ${s.status} Type: ${s.type} SquidGameId: ${s.squidGameId}`);
        });

        const lastSquidSubmissions = await Database.client.squidGameSubmission.findMany({
            take: 5,
            orderBy: { submittedAt: 'desc' },
            include: {
                participant: {
                    include: { user: { select: { username: true } } }
                }
            }
        });

        console.log("\n--- Latest SquidGameSubmissions ---");
        lastSquidSubmissions.forEach(s => {
            console.log(`[${s.submittedAt.toISOString()}] Participant: ${s.participant.user.username} Status: ${s.status} Score: ${s.score} SquidGameId: ${s.participant.squidGameId}`);
        });

    } catch (error) {
        console.error("Debug failed:", error);
    } finally {
        await Database.client.$disconnect();
    }
}

debugSquidSubmissions();
