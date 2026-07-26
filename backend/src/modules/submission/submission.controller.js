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

    res.status(200).json(result);
  }

  static async getSubmissionStatus(req, res) {
    const { id } = req.params;
    const result = await SubmissionOrchestrator.getSubmissionById(id);

    if (!result) {
      const err = new Error("Submission not found");
      err.statusCode = 404;
      throw err;
    }
    
    res.status(200).json(result);
  }
}

export default SubmissionController;
