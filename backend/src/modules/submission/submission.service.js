import SubmissionRepository from "./submission.repository.js";

/**
 * SubmissionService - Domain Logic Layer
 * Contains only business logic and calculations
 * - Percentile calculation
 * - Data enrichment
 * - Submission queries (delegated to Repository)
 * 
 * Orchestration (validation, enqueue, events) → SubmissionOrchestrator
 * Data access (Prisma) → SubmissionRepository
 */
class SubmissionService {

  static async calculateBeatsPercentile(problemId, language, executionTimeMs) {
    if (!executionTimeMs || executionTimeMs === 0) return 0;

    // Get all successful submissions for this problem and language
    const successfulSubmissions = await SubmissionRepository.findSuccessfulSubmissionsForProblem(problemId, language);

    if (successfulSubmissions.length <= 1) return 100;

    // Calculate how many people we beat (everyone who took longer)
    const slowerCount = successfulSubmissions.filter(s => s.executionTimeMs > executionTimeMs).length;
    const percentile = (slowerCount / successfulSubmissions.length) * 100;

    return Math.round(percentile);
  }

  static async getSubmissionById(submissionId) {
    const submission = await SubmissionRepository.findSubmissionByIdWithProblem(submissionId);

    if (!submission) return null;

    let beatsPercentile = 0;
    if (submission.status === "PASSED") {
      beatsPercentile = await this.calculateBeatsPercentile(
        submission.problemId,
        submission.language,
        submission.executionTimeMs
      );
    }

    return {
      ...submission,
      beatsPercentile,
      squidGameId: submission.squidGameId
    };
  }

  /**
   * Used by worker to fetch submission details along with problem testcases and user id
   */
  static async getSubmissionWithProblemAndUser(submissionId) {
    return await SubmissionRepository.findSubmissionWithProblemAndUser(submissionId);
  }

  /**
   * Used by worker to update status, passed tests, and execution time
   */
  static async updateSubmissionStatus(submissionId, data) {
    return await SubmissionRepository.updateSubmissionStatus(submissionId, data);
  }
}

export default SubmissionService;
