// • Accept code submission
// • Trigger judge
// • Return result

import { processSubmission } from "../services/submission.service.js";

export async function submitCode(req, res) {
  try {

    const { code, language, battleId, problemId } = req.body;

    const userId = req.user.id; // from auth middleware

    const result = await processSubmission({
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
