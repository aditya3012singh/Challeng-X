import env from "../src/core/config/env.js";
import { Worker } from "bullmq";
import AIService from "../src/modules/ai/ai.service.js";
import IORedis from "ioredis";

import GrpcJudgeClient from "../src/integrations/judge/grpcJudgeClient.js";
import SubmissionService from "../src/modules/submission/submission.service.js";
import BattleService from "../src/modules/battle/battle.service.js";
import TestcaseCache from "../src/core/cache/testcaseCache.js";
import UserCache from "../src/core/cache/userCache.js";
import ProblemCache from "../src/core/cache/problemCache.js";
import logger from "../src/core/logger/logger.js";
import eventBus from "../src/core/events/eventBus.js";
import { EventTypes } from "../src/core/events/eventTypes.js";
import { recordJobCompletion, updateQueueDepth, recordSubmission } from "../src/core/metrics/prometheus.js";

process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 50, 2000),
};

const connection = env.REDIS_URL 
    ? new IORedis(env.REDIS_URL, redisOptions) 
    : new IORedis({ ...redisOptions, host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD });

// Redis Publisher to send events to main server
const publisher = env.REDIS_URL 
    ? new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null }) 
    : new IORedis({ ...redisOptions, host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD });

logger.info("✅ Worker connected to Redis Pub/Sub");

const worker = new Worker(
    "submissionQueue",
    async (job) => {
        const { submissionId, battleId, squidGameId, contestId, userId, type } = job.data;
        const jobStartTime = Date.now();
        logger.info(`📦 Job ${job.id} picked up — subId=${submissionId} type=${type || "SUBMIT"}`);

        let submission = null;
        try {
            console.time(`Job-${job.id}-init`);
            submission = await SubmissionService.getSubmissionWithProblemAndUser(submissionId);
            if (!submission) throw new Error("Submission not found");
            if (!submission.problem) throw new Error("Submission has no associated problem");
            console.timeEnd(`Job-${job.id}-init`);

            // Cache user data for future requests
            await UserCache.cacheUser(submission.user);

            // Filter testcases based on type (RUN only uses sample cases)
            let testcases = submission.problem.testcases;
            const isRun = type === "RUN";
            if (isRun) {
                testcases = testcases.filter(tc => tc.isSample);
                // If no samples are marked, use the first one as a fallback so 'Run' doesn't stay empty
                if (testcases.length === 0 && submission.problem.testcases.length > 0) {
                    testcases = [submission.problem.testcases[0]];
                }
            } else {
                // For SUBMIT, we also pull the massive hidden test cases from S3 / Redis Cache
                console.time(`Job-${job.id}-fetch-s3`);
                const cloudTestcases = await TestcaseCache.getTestcases(submission.problem.id);
                // console.log("cloudTestcases", cloudTestcases); // Removed to avoid terminal lag
                console.timeEnd(`Job-${job.id}-fetch-s3`);
                // Filter out any db-based cases that are NOT sample cases if we are migrating entirely to S3
                testcases = testcases.filter(tc => tc.isSample);
                testcases = [...testcases, ...cloudTestcases];
            }

            const total = testcases.length;
            const t0 = Date.now();

            await SubmissionService.updateSubmissionStatus(submissionId, { status: "RUNNING" });

            logger.info(`⏱ [${submission.language}] Starting ${type} — ${total} test case(s)`);

            // Execute code via gRPC
            const { results, stopped_at, executionTimeMs } = await GrpcJudgeClient.runCode({
                submissionId,
                language: submission.language,
                code: submission.code,
                inputs: testcases.map(tc => tc.input),
                earlyExit: !isRun, // earlyExit = true for SUBMIT, false for RUN
            });

            console.log(`⏱  [${submission.language}] ${type} done in ${executionTimeMs}ms | passed=${stopped_at}/${total}`);

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

                // Emit SubmissionCompleted event (DUAL MODE - keeping all existing logic)
                eventBus.emitEvent(EventTypes.SUBMISSION_COMPLETED, {
                    submissionId,
                    userId: userId || submission.user.id,
                    problemId: submission.problemId,
                    status: firstFailedIndex === -1 ? "PASSED" : "FAILED",
                    executionTimeMs,
                    passedTests: stopped_at,
                    totalTests: total,
                    type: "RUN",
                    context: {
                        battleId: battleId || submission.battleId || null,
                        contestId: contestId || (submission.contest ? submission.contest.id : null),
                        squidGameId: squidGameId || (submission.squidGame ? submission.squidGame.id : null)
                    },
                    testCaseResults: runDetails
                });

                logger.info(`📡 [Worker] Publishing RUN result for subId=${submissionId} (userId=${userId || submission.user.id}, battleId=${battleId || submission.battleId || null})`);
                
                // Record submission metrics
                recordSubmission({
                    type: type || 'SUBMIT',
                    language: submission.language,
                    resultStatus: firstFailedIndex === -1 ? 'passed' : 'failed'
                });
                
                publisher.publish("worker_events", JSON.stringify({
                    event: "submission_result",
                    data: {
                        submissionId,
                        userId: userId || submission.user.id,
                        battleId: battleId || submission.battleId || null,
                        squidGameId: squidGameId || (submission.squidGame ? submission.squidGame.id : null),
                        contestId: contestId || (submission.contest ? submission.contest.id : null),
                        status: firstFailedIndex === -1 ? "PASSED" : "FAILED",
                        type: "RUN",
                        testCaseResults: runDetails,
                        executionTimeMs,
                        language: submission.language
                    }
                })).then(() => logger.info(`✅ [Worker] Published RUN result successfully`))
                  .catch(err => logger.error("Redis publish error RUN:", err));
                return;
            }

            // SUBMIT logic (standard early-exit check)
            if (firstFailedIndex !== -1) {
                const failed = runDetails[firstFailedIndex];

                await SubmissionService.updateSubmissionStatus(submissionId, {
                    status: "FAILED",
                    passedTests: firstFailedIndex,
                    totalTests: total,
                    executionTimeMs
                });

                // Emit SubmissionCompleted event (DUAL MODE - keeping all existing logic)
                eventBus.emitEvent(EventTypes.SUBMISSION_COMPLETED, {
                    submissionId,
                    userId: userId || submission.user.id,
                    problemId: submission.problemId,
                    status: "FAILED",
                    executionTimeMs,
                    passedTests: firstFailedIndex,
                    totalTests: total,
                    type: "SUBMIT",
                    context: {
                        battleId: battleId || submission.battleId || null,
                        contestId: contestId || (submission.contest ? submission.contest.id : null),
                        squidGameId: squidGameId || (submission.squidGame ? submission.squidGame.id : null)
                    },
                    failureDetails: {
                        failedTestCase: firstFailedIndex + 1,
                        input: failed.input,
                        expectedOutput: failed.expected,
                        actualOutput: failed.actual,
                        errorMessage: failed.error
                    }
                });

                console.log(`📡 [Worker] Publishing FAILED submit result for subId=${submissionId} (userId=${userId || submission.user.id})`);
                publisher.publish("worker_events", JSON.stringify({
                    event: "submission_result",
                    data: {
                        submissionId,
                        userId: userId || submission.user.id,
                        battleId: battleId || submission.battleId || null,
                        squidGameId: squidGameId || (submission.squidGame ? submission.squidGame.id : null),
                        contestId: contestId || (submission.contest ? submission.contest.id : null),
                        status: "FAILED",
                        type: "SUBMIT",
                        passedTests: firstFailedIndex,
                        totalTests: total,
                        failedTestCase: firstFailedIndex + 1,
                        input: failed.input,
                        expectedOutput: failed.expected,
                        actualOutput: failed.actual,
                        errorMessage: failed.error,
                        language: submission.language
                    }
                })).then(() => console.log(`✅ [Worker] Published FAILED result successfully`))
                  .catch(err => console.error("Redis publish error FAILED submit:", err));

                return;
            }

            // All test cases passed for SUBMIT
            console.log(`🧠 [Worker] Requesting Code Surgeon diagnostics for subId=${submissionId}...`);
            const aiFeedback = await AIService.generateCodeSurgeonReport(
                submission.problem, 
                submission.code, 
                submission.language, 
                "Success"
            );

            await SubmissionService.updateSubmissionStatus(submissionId, {
                status: "PASSED",
                passedTests: total,
                totalTests: total,
                executionTimeMs,
                aiFeedback
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
                console.time(`Job-${job.id}-battle-finish`);
                try {
                    const finishResult = await BattleService.finishBattleService(battleId, userId || submission.user.id);
                    if (finishResult) {
                        battleFinished = true;
                        battleWinnerId = userId || submission.user.id;
                        console.log(`🏆 Battle ${battleId} finished in DB by worker. Winner: ${battleWinnerId}.`);
                    } else {
                        console.log(`ℹ️ Battle ${battleId} already finished or record missing. Ignoring winner ${userId || submission.user.id}.`);
                    }
                } catch (err) {
                    console.error(`❌ Worker finishBattleService error: ${err.message}`);
                }
                console.timeEnd(`Job-${job.id}-battle-finish`);
            } else if (!squidGameId && !contestId && type === "SUBMIT") {
                // Solo Problem Reward
                const RewardService = (await import("../src/modules/reward/reward.service.js")).default;
                await RewardService.grantProblemRewards(userId || submission.user.id, submission.problemId);
            }

            // Emit SubmissionCompleted event (DUAL MODE - keeping all existing logic)
            eventBus.emitEvent(EventTypes.SUBMISSION_COMPLETED, {
                submissionId,
                userId: userId || submission.user.id,
                problemId: submission.problemId,
                status: "PASSED",
                executionTimeMs,
                passedTests: total,
                totalTests: total,
                type: "SUBMIT",
                context: {
                    battleId: battleId || submission.battleId || null,
                    contestId: contestId || (submission.contest ? submission.contest.id : null),
                    squidGameId: squidGameId || (submission.squidGame ? submission.squidGame.id : null)
                }
            });

            console.log(`📡 [Worker] Publishing PASSED submit result for subId=${submissionId} (userId=${userId || submission.user.id})`);
            
            // Record submission metrics
            recordSubmission({
                type: 'SUBMIT',
                language: submission.language,
                resultStatus: 'passed'
            });
            
            publisher.publish("worker_events", JSON.stringify({
                event: "submission_result",
                data: {
                    submissionId,
                    userId: userId || submission.user.id,
                    battleId: battleId || submission.battleId || null,
                    squidGameId: squidGameId || (submission.squidGame ? submission.squidGame.id : null),
                    contestId: contestId || (submission.contest ? submission.contest.id : null),
                    status: "PASSED",
                    type: "SUBMIT",
                    passedTests: total,
                    totalTests: total,
                    executionTimeMs,
                    beatsPercentile,
                    aiFeedback,
                    language: submission.language
                }
            })).then(() => console.log(`✅ [Worker] Published PASSED result successfully`))
              .catch(err => console.error("Redis publish error PASSED submit:", err));

            // Notify clients that the battle is over via pub/sub
            // NOTE: battle_end socket event is already emitted by finishBattleService
            // via eventBus → BATTLE_SOCKET_END → socket.listeners.js
            // Only publish for cross-process (worker → server) communication
            if (battleFinished) {
                console.log(`📡 Publishing battle_end event for ${battleId}`);
                publisher.publish("worker_events", JSON.stringify({
                    event: "battle_end",
                    data: {
                        battleId,
                        winnerId: battleWinnerId
                    }
                })).catch(err => console.error("Redis publish error BATTLE_END:", err));
            }

        } catch (err) {
            const jobDuration = Date.now() - jobStartTime;
            console.error(`💥 Job ${job.id} processor error:`, err.message);
            
            // Record job failure metrics
            recordJobCompletion({
                status: 'failed',
                language: submission?.problem?.languages?.[0] || 'unknown',
                duration: jobDuration,
                reason: err.message || 'unknown_error'
            });
            
            // Re-throw so BullMQ marks it as failed (fires worker.on("failed"))
            throw err;
        }
    },
    {
        connection,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || "10", 10),
        lockDuration: 300000, // 5 minutes lock (prevents stalled job issues for massive 200+ testcase runs)
    }
);

worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
    
    // Record successful job completion
    const jobData = job.data || {};
    recordJobCompletion({
        status: 'completed',
        language: jobData.language || 'unknown',
        duration: job.finishedOn - job.processedOn
    });
});

worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
    
    // Record failed job
    const jobData = job?.data || {};
    recordJobCompletion({
        status: 'failed',
        language: jobData.language || 'unknown',
        duration: job?.finishedOn - job?.processedOn,
        reason: err.message || 'unknown'
    });
});

console.log("🚀 Worker started, waiting for jobs... (concurrency: 5)");
