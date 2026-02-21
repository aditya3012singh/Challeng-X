import Database from "../config/db.js";
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
    return await Database.client.$transaction(async (tx) => {
      // 1. If SUBMIT in a battle, check and increment attempts
      if (battleId && type === "SUBMIT") {
        const battle = await tx.battle.findUnique({
          where: { id: battleId },
          select: { player1Id: true, player2Id: true, attemptsPlayer1: true, attemptsPlayer2: true }
        });

        if (!battle) throw new Error("Battle not found.");

        const used = battle.player1Id === userId ? battle.attemptsPlayer1 : battle.attemptsPlayer2;
        if (used >= 3) {
          throw new Error("No attempts remaining. You have already submitted 3 times.");
        }

        // Increment attempt count
        const updateData = {};
        if (battle.player1Id === userId) {
          updateData.attemptsPlayer1 = { increment: 1 };
        } else {
          updateData.attemptsPlayer2 = { increment: 1 };
        }

        const updatedBattle = await tx.battle.update({
          where: { id: battleId },
          data: updateData
        });

        // Notify listeners about the attempt update (outside transaction ideally, but we'll do it after)
        // We'll use a post-transaction hook or just emit here since it's non-blocking
        SocketEmitter.emitToBattle(battleId, "attemptsUpdated", {
          player1Attempts: updatedBattle.attemptsPlayer1,
          player2Attempts: updatedBattle.attemptsPlayer2
        });
      }

      // 2. Create submission
      const submission = await tx.submission.create({
        data: {
          userId,
          problemId,
          code,
          language,
          battleId,
          status: "QUEUED",
          type
        }
      });

      // 3. Add to queue
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
    });
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
