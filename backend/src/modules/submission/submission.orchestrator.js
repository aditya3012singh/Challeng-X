import { submissionQueue } from "../../core/queue/submission.queue.js";
import eventBus from "../../core/events/eventBus.js";
import { EventTypes } from "../../core/events/eventTypes.js";
import SubmissionRepository from "./submission.repository.js";
import SubmissionService from "./submission.service.js";
import logger from "../../core/logger/logger.js";

/**
 * SubmissionOrchestrator - Orchestration Layer
 * Handles cross-cutting concerns:
 * - Validation (battle attempts)
 * - Submission creation
 * - Queue operations
 * - Event publishing
 * 
 * Delegates business logic to SubmissionService
 * Delegates data access to SubmissionRepository
 */
class SubmissionOrchestrator {
  /**
   * Process a code submission (main entry point for controllers)
   * Orchestrates: validation → creation → enqueue → publish events
   * 
   * @param {object} params
   * @param {string} params.userId - User ID
   * @param {string} params.problemId - Problem ID
   * @param {string} params.code - Source code
   * @param {string} params.language - Programming language
   * @param {string} [params.battleId] - Optional battleId for battle submissions
   * @param {string} [params.squidGameId] - Optional squidGameId for squid game submissions
   * @param {string} [params.contestId] - Optional contestId for contest submissions
   * @param {string} [params.type] - RUN or SUBMIT (default: SUBMIT)
   * @returns {Promise<object>} Submission result with ID and status
   */
  static async processSubmission({ 
    userId, 
    problemId, 
    code, 
    language, 
    battleId, 
    squidGameId, 
    contestId, 
    type = "SUBMIT" 
  }) {
    return await SubmissionRepository.executeInTransaction(async (tx) => {
      // 1️⃣ VALIDATE: Check battle attempts if this is a battle submission
      if (battleId && type === "SUBMIT") {
        await this.validateBattleAttempts(battleId, userId, tx);
      }

      // 2️⃣ CREATE: Persist submission record
      const submission = await SubmissionRepository.createSubmission({
        userId,
        problemId,
        code,
        language,
        battleId,
        squidGameId,
        contestId,
        status: "QUEUED",
        type
      }, tx);

      // 3️⃣ ENQUEUE: Add to processing queue
      await this.enqueueSubmission(submission, battleId, squidGameId, contestId, userId, type);

      // 4️⃣ PUBLISH: Emit events for listeners
      await this.publishSubmissionEvents(submission, problemId, battleId, contestId, squidGameId, type);

      return {
        submissionId: submission.id,
        status: "QUEUED",
        message: type === "RUN" ? "Run started..." : "Final submission queued..."
      };
    });
  }

  /**
   * Validate battle attempts and increment if valid
   * 
   * @private
   */
  static async validateBattleAttempts(battleId, userId, tx) {
    // Try to find battle first, then team battle match
    let battle = await SubmissionRepository.findBattleById(battleId, tx);
    let isTeamMatch = false;

    if (!battle) {
      battle = await SubmissionRepository.findTeamBattleMatchById(battleId, tx);
      if (battle) isTeamMatch = true;
    }

    if (!battle) {
      throw new Error("Battle not found.");
    }

    // Check if user has attempts remaining
    const used = battle.player1Id === userId ? battle.attemptsPlayer1 : battle.attemptsPlayer2;
    if (used >= 10) {
      throw new Error("No attempts remaining. You have already submitted 10 times.");
    }

    // Increment attempt count
    const updateData = {};
    if (battle.player1Id === userId) {
      updateData.attemptsPlayer1 = { increment: 1 };
    } else {
      updateData.attemptsPlayer2 = { increment: 1 };
    }

    let updatedBattle;
    if (isTeamMatch) {
      updatedBattle = await SubmissionRepository.updateTeamBattleMatchAttempts(battleId, updateData, tx);
    } else {
      updatedBattle = await SubmissionRepository.updateBattleAttempts(battleId, updateData, tx);
    }

    // ✅ PHASE 3B: Emit BATTLE_ATTEMPT_UPDATED event (will be handled by Socket listener)
    eventBus.emitEvent(EventTypes.BATTLE_ATTEMPT_UPDATED, {
      battleId,
      player1Attempts: updatedBattle.attemptsPlayer1,
      player2Attempts: updatedBattle.attemptsPlayer2
    });

    logger.info(`📝 [Orchestrator] Battle attempt validated and incremented for user ${userId} in battle ${battleId}`);
  }

  /**
   * Add submission to processing queue
   * 
   * @private
   */
  static async enqueueSubmission(submission, battleId, squidGameId, contestId, userId, type) {
    try {
      await submissionQueue.add('processSubmission', {
        submissionId: submission.id,
        battleId: battleId || null,
        squidGameId: squidGameId || null,
        contestId: contestId || null,
        userId,
        status: "QUEUED",
        type
      });

      logger.info(`📤 [Orchestrator] Submission ${submission.id} enqueued for processing (${type})`);
    } catch (error) {
      logger.error(`❌ [Orchestrator] Failed to enqueue submission ${submission.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Publish submission-related events
   * 
   * @private
   */
  static async publishSubmissionEvents(submission, problemId, battleId, contestId, squidGameId, type) {
    try {
      // Emit SubmissionQueued event (DUAL MODE - keeping all existing logic)
      eventBus.emitEvent(EventTypes.SUBMISSION_QUEUED, {
        submissionId: submission.id,
        userId: submission.userId,
        problemId,
        battleId: battleId || null,
        contestId: contestId || null,
        squidGameId: squidGameId || null,
        type
      });

      logger.info(`📡 [Orchestrator] Submission ${submission.id} queued event published`);
    } catch (error) {
      logger.error(`❌ [Orchestrator] Failed to publish submission events for ${submission.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Get submission by ID (delegates to service for enrichment)
   * Used by controllers to fetch submission details with percentile
   * 
   * @param {string} submissionId - Submission ID
   * @returns {Promise<object>} Submission with beats percentile
   */
  static async getSubmissionById(submissionId) {
    return await SubmissionService.getSubmissionById(submissionId);
  }

  /**
   * Get submission with problem and user (delegates to repository)
   * Used by worker to fetch submission for processing
   * 
   * @param {string} submissionId - Submission ID
   * @returns {Promise<object>} Submission with problem testcases and user
   */
  static async getSubmissionWithProblemAndUser(submissionId) {
    return await SubmissionService.getSubmissionWithProblemAndUser(submissionId);
  }

  /**
   * Update submission status (delegates to service)
   * Used by worker to update submission after judge execution
   * 
   * @param {string} submissionId - Submission ID
   * @param {object} data - Status update data
   * @returns {Promise<object>} Updated submission
   */
  static async updateSubmissionStatus(submissionId, data) {
    return await SubmissionService.updateSubmissionStatus(submissionId, data);
  }
}

export default SubmissionOrchestrator;
