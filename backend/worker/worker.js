import { Worker } from "bullmq";
import IORedis from "ioredis";

import JudgeService from "../src/services/judge.service.js";
import SubmissionService from "../src/services/submission.service.js";
import BattleService from "../src/services/battle.service.js";

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

// Redis Publisher to send events to main server without using WebSockets
const publisher = new IORedis(process.env.REDIS_URL);
console.log("✅ Worker connected to Redis Pub/Sub");

const worker = new Worker(
    "submissionQueue",
    async (job) => {
        const { submissionId, battleId, userId, type } = job.data;
        console.log(`📦 Job ${job.id} picked up — submissionId=${submissionId} type=${type || "SUBMIT"} lang=${job.data.language ?? "?"}`);

        try {
            const submission = await SubmissionService.getSubmissionWithProblemAndUser(submissionId);
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

            await SubmissionService.updateSubmissionStatus(submissionId, { status: "RUNNING" });

            console.log(`⏱  [${submission.language}] Starting ${type} — ${total} test case(s)`);

            // RUN type disable early_exit to get full feedback on all sample cases
            const { results, stopped_at } = await JudgeService.runTestCases(
                submission.language,
                submission.code,
                testcases.map(tc => tc.input),
                !isRun, // earlyExit = true for SUBMIT, false for RUN
                (progress) => {
                    // Publish progress to Redjs channel
                    publisher.publish("worker_events", JSON.stringify({
                        event: "submissionProgress",
                        data: {
                            submissionId,
                            userId: userId || submission.user.id,
                            battleId: battleId || submission.battleId || null,
                            index: progress.index,
                            total,
                            passed: progress.passed
                        }
                    }));
                }
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
                await SubmissionService.updateSubmissionStatus(submissionId, {
                    status: firstFailedIndex === -1 ? "PASSED" : "FAILED",
                    passedTests: stopped_at,
                    totalTests: total,
                    executionTimeMs
                });

                publisher.publish("worker_events", JSON.stringify({
                    event: "submissionResult",
                    data: {
                        submissionId,
                        userId: userId || submission.user.id,
                        battleId: battleId || submission.battleId || null,
                        status: firstFailedIndex === -1 ? "PASSED" : "FAILED",
                        type: "RUN",
                        testCaseResults: runDetails,
                        executionTimeMs
                    }
                }));
                return;
            }

            // SUBMIT logic (standard early-exit check)
            if (firstFailedIndex !== -1) {
                const failed = runDetails[firstFailedIndex];

                await SubmissionService.updateSubmissionStatus(submissionId, {
                    status: "FAILED",
                    passedTests: firstFailedIndex,
                    totalTests: submission.problem.testcases.length,
                    executionTimeMs
                });

                publisher.publish("worker_events", JSON.stringify({
                    event: "submissionResult",
                    data: {
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
                    }
                }));

                return;
            }

            // All test cases passed for SUBMIT
            await SubmissionService.updateSubmissionStatus(submissionId, {
                status: "PASSED",
                passedTests: total,
                totalTests: total,
                executionTimeMs
            });

            const beatsPercentile = await SubmissionService.calculateBeatsPercentile(
                submission.problemId,
                submission.language,
                executionTimeMs
            );

            // Handle Battle Finish within the Worker (DB layer constraint)
            let battleFinished = false;
            let battleWinnerId = null;
            if (battleId) {
                try {
                    const finishResult = await BattleService.finishBattleService(battleId, userId || submission.user.id);
                    if (finishResult) {
                        battleFinished = true;
                        battleWinnerId = userId || submission.user.id;
                        console.log(`🏆 Battle ${battleId} finished in DB by worker. Winner: ${battleWinnerId}.`);
                    }
                } catch (err) {
                    console.error(`❌ Worker finishBattleService error: ${err.message}`);
                }
            }

            publisher.publish("worker_events", JSON.stringify({
                event: "submissionResult",
                data: {
                    submissionId,
                    userId: userId || submission.user.id,
                    battleId: battleId || submission.battleId || null,
                    status: "PASSED",
                    type: "SUBMIT",
                    passedTests: total,
                    totalTests: total,
                    executionTimeMs,
                    beatsPercentile
                }
            }));

            // Notify clients that the battle is over via pub/sub
            if (battleFinished) {
                publisher.publish("worker_events", JSON.stringify({
                    event: "battleFinished",
                    data: {
                        battleId,
                        winnerId: battleWinnerId
                    }
                }));
            }

        } catch (err) {
            console.error(`💥 Job ${job.id} processor error:`, err.message);
            // Re-throw so BullMQ marks it as failed (fires worker.on("failed"))
            throw err;
        }
    },
    {
        connection,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || "10", 10),
        lockDuration: 60000, // 60 seconds (prevents stalled job issues)
    }
);

worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log("🚀 Worker started, waiting for jobs... (concurrency: 5)");
