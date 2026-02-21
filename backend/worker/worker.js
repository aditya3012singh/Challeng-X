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
        const { submissionId, battleId, userId, type } = job.data;
        console.log(`📦 Job ${job.id} picked up — submissionId=${submissionId} type=${type || "SUBMIT"} lang=${job.data.language ?? "?"}`);

        try {
            const submission = await Database.client.submission.findUnique({
                where: { id: submissionId },
                include: {
                    problem: { include: { testcases: true } },
                    user: { select: { id: true } }
                }
            });
            if (!submission) throw new Error("Submission not found");
            if (!submission.problem) throw new Error("Submission has no associated problem");

            // Filter testcases based on type (RUN only uses sample cases)
            let testcases = submission.problem.testcases;
            const isRun = type === "RUN";
            if (isRun) {
                testcases = testcases.filter(tc => tc.isSample);
                // If no samples are marked, use the first one as a fallback so 'Run' doesn't stay empty
                if (testcases.length === 0 && submission.problem.testcases.length > 0) {
                    testcases = [submission.problem.testcases[0]];
                }
            }

            const total = testcases.length;
            const t0 = Date.now();

            await Database.client.submission.update({
                where: { id: submissionId },
                data: { status: "RUNNING" }
            });

            console.log(`⏱  [${submission.language}] Starting ${type} — ${total} test case(s)`);

            // RUN type disable early_exit to get full feedback on all sample cases
            const { results, stopped_at } = await JudgeService.runTestCases(
                submission.language,
                submission.code,
                testcases.map(tc => tc.input),
                !isRun // earlyExit = true for SUBMIT, false for RUN
            );

            const judgeMs = Date.now() - t0;
            const executionTimeMs = judgeMs;

            console.log(`⏱  [${submission.language}] ${type} done in ${judgeMs}ms | passed=${stopped_at}/${total}`);

            // Process results
            const runDetails = [];
            let firstFailedIndex = -1;

            for (let i = 0; i < testcases.length; i++) {
                const tc = testcases[i];
                const res = results[i];
                const actual = res?.output?.trim() ?? "";
                const expected = tc.output?.trim() ?? "";
                const error = res?.error || null;
                const passed = !error && actual === expected;

                if (!passed && firstFailedIndex === -1) {
                    firstFailedIndex = i;
                }

                runDetails.push({
                    input: tc.input,
                    expected,
                    actual: error ? null : actual,
                    error,
                    passed
                });
            }

            if (isRun) {
                // Return full details for 'RUN' (all sample cases for the tabbed UI)
                await Database.client.submission.update({
                    where: { id: submissionId },
                    data: { status: firstFailedIndex === -1 ? "PASSED" : "FAILED", passedTests: stopped_at, totalTests: total, executionTimeMs }
                });

                socket.emit("submissionResult", {
                    submissionId,
                    userId: userId || submission.user.id,
                    battleId: battleId || submission.battleId || null,
                    status: firstFailedIndex === -1 ? "PASSED" : "FAILED",
                    type: "RUN",
                    testCaseResults: runDetails,
                    executionTimeMs
                });
                return;
            }

            // SUBMIT logic (standard early-exit check)
            if (firstFailedIndex !== -1) {
                const failed = runDetails[firstFailedIndex];

                await Database.client.submission.update({
                    where: { id: submissionId },
                    data: { status: "FAILED", passedTests: firstFailedIndex, totalTests: submission.problem.testcases.length, executionTimeMs }
                });

                socket.emit("submissionResult", {
                    submissionId,
                    userId: userId || submission.user.id,
                    battleId: battleId || submission.battleId || null,
                    status: "FAILED",
                    type: "SUBMIT",
                    passedTests: firstFailedIndex,
                    totalTests: submission.problem.testcases.length,
                    failedTestCase: firstFailedIndex + 1,
                    input: failed.input,
                    expectedOutput: failed.expected,
                    actualOutput: failed.actual,
                    errorMessage: failed.error,
                });

                return;
            }

            // All test cases passed for SUBMIT
            await Database.client.submission.update({
                where: { id: submissionId },
                data: { status: "PASSED", passedTests: total, totalTests: total, executionTimeMs }
            });

            socket.emit("submissionResult", {
                submissionId,
                userId: userId || submission.user.id,
                battleId: battleId || submission.battleId || null,
                status: "PASSED",
                type: "SUBMIT",
                passedTests: total,
                totalTests: total,
                executionTimeMs
            });

        } catch (err) {
            console.error(`💥 Job ${job.id} processor error:`, err.message);
            // Re-throw so BullMQ marks it as failed (fires worker.on("failed"))
            throw err;
        }
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
