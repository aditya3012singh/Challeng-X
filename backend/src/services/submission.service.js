import prisma from "../config/db.js";
import { compareOutput } from "../utils/compareOutput.js";
import { runCode } from "./judge.service.js";

/**
 * Process a code submission
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.problemId
 * @param {string} params.code
 * @param {string} params.language
 */
export async function processSubmission({ userId, problemId, code, language }) {
  // Create submission with PENDING status
  const submission = await prisma.submission.create({
    data: {
      userId,
      problemId,
      code,
      language,
      status: "PENDING",
    }
  });

  const testcases = await prisma.testCase.findMany({ where: { problemId } });
  console.log("Testcases fetched:", testcases.length);

  let allPassed = true;

  for (let tc of testcases) {
    const result = await runCode(language, code, tc.input);
    console.log("Judge result:", result);
    if (result.error) {
      await prisma.submission.update({
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

  await prisma.submission.update({
    where: { id: submission.id },
    data: { status: finalStatus }
  });

  return { status: finalStatus };
}
