import JudgeApp from "./app.js";

JudgeApp.start().catch((err) => {
    console.error("[Judge] Failed to start:", err);
    process.exit(1);
});
