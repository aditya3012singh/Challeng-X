import Database from "../config/db.js";
import { compareOutput } from "../utils/compareOutput.js";
import JudgeService from "./judge.service.js";
import { emitToBattle } from "../config/socket.js";
/**
 * Process a code submission
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.problemId
 * @param {string} params.code
 * @param {string} params.language
 * @param {string} [params.battleId] - Optional battleId for battle submissions
 */
class SubmissionService {
  static async processSubmission({ userId, problemId, code, language, battleId }) {
  // Create submission with PENDING status
  const submission = await Database.client.submission.create({
    data: {
      userId,
      problemId,
      code,
      language,
      status: "PENDING",
    }
  });

  const testcases = await Database.client.testCase.findMany({ where: { problemId } });
  console.log("Testcases fetched:", testcases.length);

  let allPassed = true;

  for (let tc of testcases) {
    const result = await JudgeService.runCode(language, code, tc.input);
    console.log("Judge result:", result);
    if (result.error) {
      await Database.client.submission.update({
        where: { id: submission.id },
        data: { status: "ERROR" }
      });
      return { status: "ERROR", error: result.error };
    }

    console.log("Output:", result.output);

    const passed = compareOutput(result.output, tc.output);
    if (!passed) {
      allPassed = false;
      break;
    }
  }

  const finalStatus = allPassed ? "PASSED" : "FAILED";

  await Database.client.submission.update({
    where: { id: submission.id },
    data: { status: finalStatus }
  });

  // Emit socket event if this is a battle submission
  if (battleId) {
    emitToBattle(battleId, "submissionResult", {
      userId,
      status: finalStatus
    });
  }

  return { status: finalStatus };
  }
}

export default SubmissionService;
