import { Worker } from "bullmq";
import IORedis from "ioredis";

import JudgeService from "../src/services/judge.service.js";
import { io as ioClient } from "socket.io-client";
import Database from "../src/config/db.js";

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

// Socket.IO client to emit events back to the main server
const socket = ioClient(`http://localhost:${process.env.PORT || 4000}`);

socket.on("connect", () => {
    console.log("✅ Worker connected to Socket.IO server");
});

const worker = new Worker(
    "submissionQueue",
    async (job) => {
        const { submissionId, battleId, userId } = job.data;

        const submission = await Database.client.submission.findUnique({
            where: { id: submissionId },
            include: {
                problem: { include: { testcases: true } },
                user: { select: { id: true } }
            }
        });
        if (!submission) throw new Error("Submission not found");

        await Database.client.submission.update({
            where: { id: submissionId },
            data: { status: "RUNNING" }
        });


        let passed = 0;
        let total = submission.problem.testcases.length;
        const startTime = Date.now();

        for (let tc of submission.problem.testcases) {
            const result = await JudgeService.runCode(submission.language, submission.code, tc.input);
            if (result.error || result.output.trim() !== tc.output.trim()) {
                await Database.client.submission.update({
                    where: { id: submissionId },
                    data: {
                        status: "ERROR",
                        passedTests: passed,
                        totalTests: total,
                        executionTimeMs: Date.now() - startTime
                    }
                });

                // Emit failure event — server will forward to battle room
                socket.emit("submissionResult", {
                    submissionId,
                    userId: userId || submission.user.id,
                    battleId: battleId || submission.battleId || null,
                    status: "ERROR",
                    passedTests: passed,
                    totalTests: total
                });

                return;
            }
            passed++;
        }

        const executionTime = Date.now() - startTime;

        await Database.client.submission.update({
            where: { id: submissionId },
            data: {
                status: "PASSED",
                passedTests: passed,
                totalTests: total,
                executionTimeMs: executionTime
            }
        });

        // Emit success event — server will call finishBattleService
        socket.emit("submissionResult", {
            submissionId,
            userId: userId || submission.user.id,
            battleId: battleId || submission.battleId || null,
            status: "PASSED",
            passedTests: passed,
            totalTests: total,
            executionTimeMs: executionTime
        });

    },
    {
        connection,
        concurrency: 5,
    }
);

worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log("🚀 Worker started, waiting for jobs... (concurrency: 5)");
