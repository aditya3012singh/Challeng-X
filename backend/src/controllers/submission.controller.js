// • Accept code submission
// • Trigger judge
// • Return result

import SubmissionService from "../services/submission.service.js";

class SubmissionController {
  static async submitCode(req, res) {
  try {

    const { code, language, battleId, problemId } = req.body;

    const userId = req.user.id; // from auth middleware

    const result = await SubmissionService.processSubmission({
      userId,
    //   battleId,
      problemId,
      code,
      language,
      status:"QUEUED"
    });

  res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  }

  static async getSubmissionStatus(req, res) {
    try {
      const { id } = req.params;
      const result = await SubmissionService.getSubmissionById(id);
      
      if (!result) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default SubmissionController;
