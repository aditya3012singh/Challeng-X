import Database from "./src/config/db.js";

async function ensureGhostUser() {
    try {
        const ghost = await Database.client.user.upsert({
            where: { username: "CHALLENGX_GHOST" },
            update: {},
            create: {
                username: "CHALLENGX_GHOST",
                email: "ai-ghost@challengx.live",
                password: "system_reserved_ai_password_not_for_login",
                rankPoints: 1200,
                role: "USER"
            }
        });
        console.log("Ghost user ensured:", ghost.id);
        process.exit(0);
    } catch (err) {
        console.error("Error creating ghost user:", err);
        process.exit(1);
    }
}

ensureGhostUser();
