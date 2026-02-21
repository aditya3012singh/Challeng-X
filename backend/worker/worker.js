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


        const testcases = submission.problem.testcases;
        const total = testcases.length;
        const startTime = Date.now();

        // Run ALL test cases in a single warm-container job.
        // For C/C++ this means compile ONCE, run each input against the same binary.
        const { results, stopped_at } = await JudgeService.runTestCases(
            submission.language,
            submission.code,
            testcases.map(tc => tc.input)
        );

        const passed = stopped_at; // number of test cases that passed before failure
        const executionTimeMs = Date.now() - startTime;

        // Check every result against expected output
        let failedIndex = -1;
        let failedResult = null;

        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const tc = testcases[i];
            const actualOutput = r.output?.trim() ?? "";
            const expectedOutput = tc.output?.trim() ?? "";
            const hasError = !!r.error;
            const wrongAnswer = !hasError && actualOutput !== expectedOutput;

            if (hasError || wrongAnswer) {
                failedIndex = i;
                failedResult = {
                    hasError,
                    actualOutput: hasError ? null : actualOutput,
                    expectedOutput,
                    errorMessage: hasError ? r.error : null,
                    input: tc.input,
                };
                break;
            }
        }

        if (failedIndex !== -1) {
            const { hasError, actualOutput, expectedOutput, errorMessage, input } = failedResult;

            await Database.client.submission.update({
                where: { id: submissionId },
                data: { status: "ERROR", passedTests: failedIndex, totalTests: total, executionTimeMs }
            });

            socket.emit("submissionResult", {
                submissionId,
                userId: userId || submission.user.id,
                battleId: battleId || submission.battleId || null,
                status: "ERROR",
                passedTests: failedIndex,
                totalTests: total,
                failedTestCase: failedIndex + 1,
                input,
                expectedOutput,
                actualOutput,
                errorMessage,
            });

            return;
        }

        // All test cases passed

        await Database.client.submission.update({
            where: { id: submissionId },
            data: {
                status: "PASSED",
                passedTests: total,
                totalTests: total,
                executionTimeMs
            }
        });

        // Emit success event — server will call finishBattleService
        socket.emit("submissionResult", {
            submissionId,
            userId: userId || submission.user.id,
            battleId: battleId || submission.battleId || null,
            status: "PASSED",
            passedTests: total,
            totalTests: total,
            executionTimeMs
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
