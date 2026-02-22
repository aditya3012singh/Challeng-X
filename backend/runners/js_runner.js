/**
 * Warm container runner for JavaScript submissions — BATCHED protocol.
 * Runs each test case input in a separate Node child process.
 *
 * Input:  {"code": "...", "inputs": ["input1", "input2", ...], "early_exit": true}\n
 * Output: {"results": [{"output":"..."}, {"error":"..."}], "stopped_at": 0}\n
 */
import readline from "readline";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

async function runTestCase(i, input, tmpFile) {
    return new Promise((resolve) => {
        const child = spawn("node", [tmpFile], {
            timeout: 8000,
        });

        let stdout = "";
        let stderr = "";

        child.stdin.write(input);
        child.stdin.end();

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("error", (err) => {
            resolve({
                index: i,
                passed: false,
                error: err.code === "ETIMEDOUT" ? "Time Limit Exceeded (8s)" : err.message
            });
        });

        child.on("close", (code) => {
            if (code !== 0) {
                resolve({
                    index: i,
                    passed: false,
                    error: stderr.trim() || "Runtime Error"
                });
            } else {
                resolve({
                    index: i,
                    passed: true,
                    output: stdout.trim()
                });
            }
        });
    });
}

rl.on("line", async (line) => {
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

    const results = new Array(inputs.length);
    let stopped_at = inputs.length;
    let passed_count = 0;

    try {
        fs.writeFileSync(tmpFile, code, "utf8");

        const CONCURRENCY = 8;
        const queue = [...inputs.keys()];
        const active = new Set();

        const runNext = async () => {
            if (queue.length === 0) return;

            // If early_exit and we already found a failure, stop spawning
            if (early_exit && stopped_at < inputs.length) return;

            const i = queue.shift();
            const promise = runTestCase(i, inputs[i], tmpFile);
            active.add(promise);

            const res = await promise;
            active.delete(promise);

            results[res.index] = res;
            if (res.passed) {
                passed_count++;
                process.stdout.write(JSON.stringify({
                    type: "progress",
                    index: res.index,
                    passed: true,
                    passed_so_far: passed_count
                }) + "\n");
            } else {
                process.stdout.write(JSON.stringify({
                    type: "progress",
                    index: res.index,
                    passed: false,
                    error: res.error,
                    passed_so_far: passed_count
                }) + "\n");

                if (res.index < stopped_at) {
                    stopped_at = res.index;
                }
            }

            await runNext();
        };

        // Start initial workers
        const initialWorkers = [];
        for (let j = 0; j < Math.min(CONCURRENCY, inputs.length); j++) {
            initialWorkers.push(runNext());
        }
        await Promise.all(initialWorkers);

    } catch (e) {
        results[0] = { error: e.message, index: 0 };
        stopped_at = 0;
    } finally {
        try { fs.unlinkSync(tmpFile); } catch { }
    }

    // Truncate if early_exit
    let finalResults = results;
    if (early_exit && stopped_at < inputs.length) {
        finalResults = results.slice(0, stopped_at + 1);
    }

    // Format final results
    const formatted_results = finalResults
        .filter(r => r !== undefined)
        .map(r => r.passed ? { output: r.output } : { error: r.error });

    // FINAL BATCH SIGNAL
    process.stdout.write(JSON.stringify({ type: "finished", results: formatted_results, stopped_at }) + "\n");
});
