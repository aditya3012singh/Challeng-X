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


const LANGUAGE_CONFIG = {
  python: {
    image: "codearena-python",
    ext: "py",
    run: (id) => `cat /app/${id}.txt | python3 /app/${id}.py`
  },
  js: {
    image: "codearena-js",
    ext: "js",
    run: (id) => `cat /app/${id}.txt | node /app/${id}.js`
  },
  c: {
    image: "codearena-c",
    ext: "c",
    run: (id) => `gcc /app/${id}.c -o /app/${id} && cat /app/${id}.txt | /app/${id}`
  },
  cpp: {
    image: "codearena-cpp",
    ext: "cpp",
    run: (id) => `g++ /app/${id}.cpp -o /app/${id} && cat /app/${id}.txt | /app/${id}`
  }
  // Add Java support here if needed
};

class JudgeService {
  static runCode(language, code, input) {
    return new Promise((resolve) => {
      const lang = LANGUAGE_CONFIG[language];
      if (!lang) return resolve({ error: "Unsupported language" });

      const id = Date.now() + Math.floor(Math.random() * 10000);
      const codePath = path.join(TEMP_DIR, `${id}.${lang.ext}`);
      const inputPath = path.join(TEMP_DIR, `${id}.txt`);

      fs.writeFileSync(codePath, code, { encoding: "utf8" });
      fs.writeFileSync(inputPath, input, { encoding: "utf8" });

      const dockerTempDir = path.resolve(TEMP_DIR)
        .replace(/\\/g, "/")
        .replace(/^([A-Za-z]):/, '/$1');

      const args = [
        "run",
        "--rm",
        "--network", "none",
        "-v", `${dockerTempDir}:/app`,
        lang.image,
        "bash",
        "-c",
        lang.run(id)
      ];

      const proc = spawn("docker", args);

      let output = "";
      let error = "";

      proc.stdout.on("data", (data) => (output += data.toString()));
      proc.stderr.on("data", (data) => (error += data.toString()));

      proc.on("close", () => {
        try { fs.unlinkSync(codePath); } catch {}
        try { fs.unlinkSync(inputPath); } catch {}

        if (error) return resolve({ error: error.trim() });
        resolve({ output: output.trim() });
      });
    });
  }
}

export default JudgeService;
