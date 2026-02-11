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
      language
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  }
}

export default SubmissionController;
