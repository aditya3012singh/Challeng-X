// uses docker images for different languages to sandbox code execution

// MOST IMPORTANT PART

// It:

// • Writes code to file
// • Runs Docker container
// • Feeds testcases
// • Captures output
// • Compares expected output

// Returns:

// PASS / FAIL + time.

// import { exec } from "child_process";

import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const TEMP_DIR = path.join(process.cwd(), "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

export function runCode(language, code, input) {
  return new Promise((resolve) => {
    const id = Date.now();
    const codePath = path.join(TEMP_DIR, `${id}.py`);
    const inputPath = path.join(TEMP_DIR, `${id}.txt`);

    // Write UTF-8 without BOM
    fs.writeFileSync(codePath, code, { encoding: "utf8" });
    fs.writeFileSync(inputPath, input, { encoding: "utf8" });

    // Windows path -> Linux path for Docker
    const dockerTempDir = path.resolve(TEMP_DIR)
      .replace(/\\/g, "/")
      .replace(/^([A-Za-z]):/, '/$1');

    const args = [
      "run",
      "--rm",
      "--network", "none",
      "-v", `${dockerTempDir}:/app`,
      "python-runner",
      "bash",
      "-c",
      `cat /app/${id}.txt | python3 /app/${id}.py`
    ];


    const proc = spawn("docker", args);

    let output = "";
    let error = "";

    proc.stdout.on("data", (data) => (output += data.toString()));
    proc.stderr.on("data", (data) => (error += data.toString()));

    proc.on("close", () => {
      // Cleanup
      try { fs.unlinkSync(codePath); } catch {}
      try { fs.unlinkSync(inputPath); } catch {}

      if (error) return resolve({ error: error.trim() });
      resolve({ output: output.trim() });
    });
  });
}
