// • Accept code submission
// • Trigger judge
// • Return result

import SubmissionOrchestrator from "./submission.orchestrator.js";

class SubmissionController {
  static async submitCode(req, res, next) {
    try {

      const { code, language, battleId, problemId, contestId } = req.body;

      const userId = req.user.id; // from auth middleware

      const result = await SubmissionOrchestrator.processSubmission({
        userId,
        //   battleId,
        problemId,
        contestId,
        code,
        language,
        status: "QUEUED"
      });

      res.status(200).json(result);

    } catch (err) {
      next(err);
    }
  }

  static async getSubmissionStatus(req, res, next) {
    try {
      const { id } = req.params;
      const result = await SubmissionOrchestrator.getSubmissionById(id);

      if (!result) {
        return res.status(404).json({ error: "Submission not found" });
      }

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default SubmissionController;
