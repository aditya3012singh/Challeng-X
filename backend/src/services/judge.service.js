/**
 * judge.service.js — Warm Container Pool
 *
 * Containers are started ONCE when the worker boots (one per slot per language).
 * Each container runs a persistent runner script that reads JSON jobs from stdin
 * and writes JSON results to stdout.  No cold-start overhead per test case.
 *
 * Protocol:
 *   stdin  → {"code": "...", "input": "..."}\n
 *   stdout ← {"output": "..."}\n  or  {"error": "..."}\n
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// backend/src/services/ → go up 2 levels → backend/ → runners/
const RUNNERS_DIR = path.resolve(__dirname, "../../runners");
console.log(`[judge] RUNNERS_DIR = ${RUNNERS_DIR}`);

// Convert a Windows absolute path to a Docker-compatible /drive/... path
function toDockerPath(p) {
  return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, "/$1");
}

// Number of warm containers per language — match worker concurrency
const POOL_SIZE = parseInt(process.env.JUDGE_POOL_SIZE || "3", 10);

// ─── Language definitions ────────────────────────────────────────────────────
const LANGUAGE_CONFIG = {
  python: {
    image: "codearena-python",
    runnerCmd: ["python3", "-u", "/runners/python_runner.py"],
  },
  js: {
    image: "codearena-js",
    runnerCmd: ["node", "/runners/js_runner.js"],
  },
  c: {
    image: "codearena-c",
    runnerCmd: ["python3", "-u", "/runners/c_runner.py"],
  },
  cpp: {
    image: "codearena-cpp",
    runnerCmd: ["python3", "-u", "/runners/cpp_runner.py"],
  },
};

// ─── WarmContainer ──────────────────────────────────────────────────────────
class WarmContainer {
  constructor(language, config) {
    this.language = language;
    this.config = config;
    this.busy = false;
    this._buffer = "";
    this._pendingResolve = null;
    this._pendingReject = null;
    this._startContainer();
  }

  _startContainer() {
    const runnersMount = toDockerPath(RUNNERS_DIR);

    this._proc = spawn("docker", [
      "run", "--rm",
      "-i",                        // keep stdin open
      "--network", "none",
      "--memory", "128m",
      "-v", `${runnersMount}:/runners:ro`,
      this.config.image,
      ...this.config.runnerCmd,
    ]);

    // Accumulate stdout until we see a newline (one JSON response per job)
    this._proc.stdout.on("data", (data) => {
      this._buffer += data.toString();
      const idx = this._buffer.indexOf("\n");
      if (idx !== -1 && this._pendingResolve) {
        const line = this._buffer.slice(0, idx).trim();
        this._buffer = this._buffer.slice(idx + 1);
        const resolve = this._pendingResolve;
        this._pendingResolve = null;
        this._pendingReject = null;
        try {
          resolve(JSON.parse(line));
        } catch {
          resolve({ error: "Container returned invalid JSON" });
        }
      }
    });

    // Suppress stderr noise from docker / runner internals
    this._proc.stderr.on("data", () => { });

    this._proc.on("exit", (code) => {
      console.warn(`🔄 [judge] ${this.language} container exited (code ${code}) — restarting in 500ms`);
      this._buffer = "";
      if (this._pendingResolve) {
        this._pendingResolve({ error: "Container exited unexpectedly" });
        this._pendingResolve = null;
        this._pendingReject = null;
      }
      // Restart the container so the slot stays usable
      setTimeout(() => this._startContainer(), 500);
    });

    console.log(`🟢 [judge] Warm ${this.language} container ready`);
  }

  /** Send a batched job (all test case inputs at once) and wait for one JSON response. */
  run(code, inputs) {
    return new Promise((resolve, reject) => {
      this._pendingResolve = resolve;
      this._pendingReject = reject;

      // Hard timeout — kills the container process if the runner stalls
      const killer = setTimeout(() => {
        if (this._pendingResolve) {
          this._pendingResolve({
            results: [{ error: "Time Limit Exceeded (15s hard kill)" }],
            stopped_at: 0,
          });
          this._pendingResolve = null;
          this._pendingReject = null;
          try { this._proc.kill("SIGKILL"); } catch { }
        }
      }, 15_000);

      // Wrap resolve so we always clear the timer
      const origResolve = this._pendingResolve;
      this._pendingResolve = (result) => {
        clearTimeout(killer);
        origResolve(result);
      };

      this._proc.stdin.write(JSON.stringify({ code, inputs, early_exit: true }) + "\n");
    });
  }
}

// ─── WarmContainerPool ──────────────────────────────────────────────────────
class WarmContainerPool {
  constructor(language, size) {
    this.language = language;
    this._pool = Array.from({ length: size }, () =>
      new WarmContainer(language, LANGUAGE_CONFIG[language])
    );
    this._waitQueue = [];
  }

  _acquire() {
    const free = this._pool.find((c) => !c.busy);
    if (free) {
      free.busy = true;
      return Promise.resolve(free);
    }
    // All slots busy — put caller in queue, will be resolved by _release()
    return new Promise((resolve) => this._waitQueue.push(resolve));
  }

  _release(container) {
    container.busy = false;
    if (this._waitQueue.length > 0) {
      const next = this._waitQueue.shift();
      container.busy = true;
      next(container);
    }
  }

  async runCode(code, inputs) {
    const container = await this._acquire();
    try {
      return await container.run(code, inputs);
    } finally {
      this._release(container);
    }
  }

  /** Kill all containers in the pool (called on process exit). */
  shutdown() {
    for (const c of this._pool) {
      try { c._proc.kill("SIGKILL"); } catch { }
    }
  }
}

// ─── Initialise pools at module load ────────────────────────────────────────
// Containers start immediately and stay warm for the lifetime of the worker.
const pools = {};
for (const lang of Object.keys(LANGUAGE_CONFIG)) {
  pools[lang] = new WarmContainerPool(lang, POOL_SIZE);
}

// Clean up containers when the worker process exits
const shutdown = () => {
  console.log("🛑 [judge] Shutting down warm container pools...");
  for (const pool of Object.values(pools)) pool.shutdown();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("exit", shutdown);

// ─── Public API ─────────────────────────────────────────────────────────────
class JudgeService {
  /**
   * Run `code` against ALL test case `inputs` in a single warm-container job.
   * Returns: { results: [{output}|{error}, ...], stopped_at: number }
   *   results[i].output → test case i passed
   *   results[i].error  → test case i failed (compilation/runtime/TLE)
   *   stopped_at        → index of first failure (= inputs.length if all passed)
   */
  static async runTestCases(language, code, inputs) {
    const pool = pools[language];
    if (!pool) {
      return {
        results: [{ error: `Unsupported language: ${language}` }],
        stopped_at: 0,
      };
    }
    return pool.runCode(code, inputs);
  }
}

export default JudgeService;
