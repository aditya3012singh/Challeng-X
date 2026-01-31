// judge.service.js
import axios from "axios";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = "YOUR_RAPIDAPI_KEY"; // optional if using free hosted API without key

// Map language to Judge0 language IDs
// Example: 71 = Python 3
const languageMap = {
  python: 71,
  javascript: 63,
  cpp: 54,
  java: 62,
  // add more as needed
};

export async function runCode(language, code, input) {
  const language_id = languageMap[language];
  if (!language_id) return { error: `Language ${language} not supported` };

  try {
    // Create submission
    const submissionResponse = await axios.post(
      `${JUDGE0_URL}?base64_encoded=false&wait=true`,
      {
        source_code: code,
        stdin: input,
        language_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Host": JUDGE0_HOST,
          "X-RapidAPI-Key": JUDGE0_KEY,
        },
      }
    );
    console.log("Judge0 response:", submissionResponse.data);
    const { stdout, stderr, compile_output, message } = submissionResponse.data;

    if (stderr || compile_output || message) {
      return { error: stderr || compile_output || message };
    }
    console.log("Judge0 outpt:", stdout);
    return { output: stdout };
  } catch (err) {
    return { error: err.message };
  }
}
