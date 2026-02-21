import Database from "../config/db.js";
import OutputComparer from "../utils/compareOutput.js";
import JudgeService from "./judge.service.js";
import SocketEmitter from "../config/socket.js";
import { submissionQueue } from "../queues/submission.queue.js";
import BattleService from "./battle.service.js";

/**
 * Process a code submission
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.problemId
 * @param {string} params.code
 * @param {string} params.language
 * @param {string} [params.battleId] - Optional battleId for battle submissions
 * @param {string} [params.type] - RUN or SUBMIT
 */
class SubmissionService {
  static async processSubmission({ userId, problemId, code, language, battleId, type = "SUBMIT" }) {
    // 1. If SUBMIT in a battle, check and increment attempts
    if (battleId && type === "SUBMIT") {
      const remainingAttempts = await BattleService.getRemainingAttempts(battleId, userId);
      if (remainingAttempts <= 0) {
        throw new Error("No attempts remaining. You have already submitted 3 times.");
      }
      await BattleService.incrementBattleAttempt(battleId, userId);
    }

    // 2. Create submission with the specified type
    const submission = await Database.client.submission.create({
      data: {
        userId,
        problemId,
        code,
        language,
        status: "QUEUED",
        type
      }
    });

    // 3. Add to queue with 'type' flag
    await submissionQueue.add('processSubmission', {
      submissionId: submission.id,
      battleId: battleId || null,
      userId,
      status: "QUEUED",
      type
    });

    return {
      submissionId: submission.id,
      status: "QUEUED",
      message: type === "RUN" ? "Run started..." : "Final submission queued..."
    };
  }

  static async getSubmissionById(submissionId) {
    const submission = await Database.client.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        status: true,
        passedTests: true,
        totalTests: true,
        executionTimeMs: true,
        createdAt: true,
        language: true,
      }
    });

    return submission;
  }
}

export default SubmissionService;
