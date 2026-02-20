import { Worker } from "bullmq";
import IORedis from "ioredis";

import JudgeService from "../src/services/judge.service.js";
import { io as ioClient } from "socket.io-client";
import Database from "../src/config/db.js";

const connection = new IORedis(process.env.REDIS_URL);

// Socket.IO client to emit events back to the main server
const socket = ioClient(`http://localhost:${process.env.PORT || 4000}`);

socket.on("connect", () => {
    console.log("✅ Worker connected to Socket.IO server");
});

const worker = new Worker(
    "submissionQueue",
    async (job) => {
        const { submissionId } = job.data;

        const submission = await Database.client.submission.findUnique({
            where: { id: submissionId },
            include: { 
                problem: { include: { testCases: true } },
                user: { select: { id: true } }
            }
        });
        if (!submission) throw new Error("Submission not found");

        await Database.client.submission.update({
            where: { id: submissionId },
            data: { status: "RUNNING" }
        });

        let passed = 0;
        let total = submission.problem.testCases.length;
        const startTime = Date.now();

        for (let tc of submission.problem.testCases) {
            const result = await JudgeService.runCode(submission.language, submission.code, tc.input);
            if (result.error || result.output.trim() !== tc.expectedOutput.trim()) {
                const updatedSubmission = await Database.client.submission.update({
                    where: { id: submissionId },
                    data: { 
                        status: "ERROR",
                        passedTests: passed,
                        totalTests: total,
                        executionTimeMs: Date.now() - startTime
                    }
                });

                // Emit failure event
                socket.emit("submissionResult", {
                    submissionId,
                    userId: submission.userId,
                    battleId: submission.battleId,
                    status: "ERROR",
                    passedTests: passed,
                    totalTests: total
                });

                return;
            }
            passed++;
        }

        const executionTime = Date.now() - startTime;

        const updatedSubmission = await Database.client.submission.update({
            where: { id: submissionId },
            data: { 
                status: "PASSED", 
                passedTests: passed, 
                totalTests: total,
                executionTimeMs: executionTime
            }
        });

        // Emit success event
        socket.emit("submissionResult", {
            submissionId,
            userId: submission.userId,
            battleId: submission.battleId,
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
