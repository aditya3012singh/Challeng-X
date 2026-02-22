/**
 * Warm container runner for JavaScript submissions — BATCHED protocol.
 * Runs each test case input in a separate Node child process.
 *
 * Input:  {"code": "...", "inputs": ["input1", "input2", ...], "early_exit": true}\n
 * Output: {"results": [{"output":"..."}, {"error":"..."}], "stopped_at": 0}\n
 */
const readline = require("readline");
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on("line", (line) => {
    line = line.trim();
    if (!line) return;

    let job;
    try {
        job = JSON.parse(line);
    } catch {
        process.stdout.write(
            JSON.stringify({ results: [{ error: "Invalid JSON input" }], stopped_at: 0 }) + "\n"
        );
        return;
    }

    const { code = "", inputs = [], early_exit = true } = job;
    const tmpFile = path.join(
        os.tmpdir(),
        `job_${Date.now()}_${Math.random().toString(36).slice(2)}.js`
    );

    // INITIAL PROGRESS SIGNAL
    process.stdout.write(JSON.stringify({ type: "start", total: inputs.length }) + "\n");

    const results = [];
    let stopped_at = inputs.length;

    try {
        fs.writeFileSync(tmpFile, code, "utf8");

        for (let i = 0; i < inputs.length; i++) {
            const result = spawnSync("node", [tmpFile], {
                input: inputs[i],
                timeout: 8000,
                encoding: "utf8",
                maxBuffer: 10 * 1024 * 1024,
            });

            if (result.error) {
                const msg =
                    result.error.code === "ETIMEDOUT"
                        ? "Time Limit Exceeded (8s)"
                        : result.error.message;
                results.push({ error: msg });
                // STREAMING PROGRESS (TIMEOUT/PROC ERROR)
                process.stdout.write(JSON.stringify({ type: "progress", index: i, passed: false, error: msg }) + "\n");
                stopped_at = i;
                if (early_exit) break;
            } else if (result.status !== 0) {
                const errorMsg = (result.stderr || "").trim() || "Runtime Error";
                results.push({ error: errorMsg });
                // STREAMING PROGRESS (RUNTIME ERROR)
                process.stdout.write(JSON.stringify({ type: "progress", index: i, passed: false, error: errorMsg }) + "\n");
                stopped_at = i;
                if (early_exit) break;
            } else {
                const output = (result.stdout || "").trim();
                results.push({ output });
                // STREAMING PROGRESS (SUCCESS)
                process.stdout.write(JSON.stringify({ type: "progress", index: i, passed: true }) + "\n");
            }
        }
    } catch (e) {
        results.push({ error: e.message });
        stopped_at = 0;
    } finally {
        try { fs.unlinkSync(tmpFile); } catch { }
    }

    // FINAL BATCH SIGNAL
    process.stdout.write(JSON.stringify({ type: "finished", results, stopped_at }) + "\n");
});
