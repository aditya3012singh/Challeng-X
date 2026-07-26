// • Accept code submission
// • Trigger judge
// • Return result

import SubmissionOrchestrator from "./submission.orchestrator.js";

class SubmissionController {
  static async submitCode(req, res) {
    const { code, language, battleId, problemId, contestId } = req.validated.body;
    const userId = req.user.id; // from auth middleware

    const result = await SubmissionOrchestrator.processSubmission({
      userId,
      battleId,
      problemId,
      contestId,
      code,
      language,
      status: "QUEUED"
    });

    res.ok(result, "Code submission accepted and queued");
  }

  static async getSubmissionStatus(req, res) {
    const { id } = req.params;
    const result = await SubmissionOrchestrator.getSubmissionById(id);

    if (!result) {
      const err = new Error("Submission not found");
      err.statusCode = 404;
      throw err;
    }

    res.ok(result, "Submission details fetched successfully");
  }
}

export default SubmissionController;
