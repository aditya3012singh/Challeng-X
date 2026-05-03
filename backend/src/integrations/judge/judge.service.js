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

import env from "../../core/config/env.js";
import { spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// backend/src/services/ → go up 2 levels → backend/ → runners/
const RUNNERS_DIR = env.CODEARENA_RUNNERS_PATH || path.resolve(__dirname, "../../runners");
console.log(`[judge] RUNNERS_DIR = ${RUNNERS_DIR}`);

// Convert a Windows absolute path to a Docker-compatible /drive/... path
function toDockerPath(p) {
  return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, "/$1");
}

// Number of warm containers per language — match worker concurrency
const POOL_SIZE = env.JUDGE_POOL_SIZE;

// ─── Language definitions ────────────────────────────────────────────────────
const LANGUAGE_CONFIG = {
  java: {
    image: "codearena-java",
    runnerCmd: ["python3", "-u", "/runners/java_runner.py"],
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
      "--memory", "512m",
      "--pids-limit", "512",       // Prevent fork bomb CPU/host extraction
      "--cpus", "2.0",             // Prevent infinite loop monopolizing CPU
      "-v", `${runnersMount}:/runners:ro`,
      this.config.image,
      ...this.config.runnerCmd,
    ]);

    // Accumulate stdout until we see a newline (one JSON message per line)
    this._proc.stdout.on("data", (data) => {
      this._buffer += data.toString();
      let idx;
      while ((idx = this._buffer.indexOf("\n")) !== -1) {
        const line = this._buffer.slice(0, idx).trim();
        this._buffer = this._buffer.slice(idx + 1);
        if (!line) continue;

        try {
          const msg = JSON.parse(line);

          // Handle progress messages vs final finished message
          if (msg.type === "progress" && this._onProgress) {
            this._onProgress(msg);
          } else if (msg.type === "finished" && this._pendingResolve) {
            const resolve = this._pendingResolve;
            this._pendingResolve = null;
            this._pendingReject = null;
            this._onProgress = null;
            resolve(msg);
          } else if (!msg.type && this._pendingResolve) {
            // Fallback for older/simpler runner output
            const resolve = this._pendingResolve;
            this._pendingResolve = null;
            this._pendingReject = null;
            this._onProgress = null;
            resolve(msg);
          }
        } catch {
          if (this._pendingResolve) {
            this._pendingResolve({ error: "Container returned invalid JSON" });
            this._pendingResolve = null;
          }
        }
      }
    });

    // Capture stderr for debugging
    this._proc.stderr.on("data", (data) => {
      const errOut = data.toString().trim();
      if (errOut) {
        console.error(`🔴 [judge] ${this.language} container stderr:`, errOut);
      }
    });

    this._proc.on("spawn", () => {
      console.log(`🚀 [judge] ${this.language} container process spawned`);
    });

    this._proc.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.warn(`🔄 [judge] ${this.language} container exited (code ${code}) — restarting`);
      }
      this._buffer = "";
      if (this._pendingResolve) {
        this._pendingResolve({ error: "Container exited unexpectedly" });
        this._pendingResolve = null;
      }
      setTimeout(() => this._startContainer(), 1000);
    });

    this._proc.on("error", (err) => {
        console.error(`❌ [judge] Failed to start ${this.language} container:`, err.message);
        if (err.code === 'ENOENT') {
            console.error("🛑 [judge] 'docker' command not found. Please ensure Docker is installed and in your PATH.");
        }
    });

    console.log(`🟢 [judge] Warm ${this.language} container initialization attempt started`);
  }

  /** Send a batched job and wait for 'finished' JSON. onProgress is called for each test case. */
  run(code, inputs, earlyExit = true, onProgress = null) {
    return new Promise((resolve, reject) => {
      this._pendingResolve = resolve;
      this._pendingReject = reject;
      this._onProgress = onProgress;

      const killer = setTimeout(() => {
        if (this._pendingResolve) {
          this._pendingResolve({
            results: [{ error: "Time Limit Exceeded (60s batch hard kill)" }],
            stopped_at: 0,
          });
          this._pendingResolve = null;
          this._onProgress = null;
          try { this._proc.kill("SIGKILL"); } catch { }
        }
      }, 60_000);

      const origResolve = this._pendingResolve;
      this._pendingResolve = (result) => {
        clearTimeout(killer);
        origResolve(result);
      };

      this._proc.stdin.write(JSON.stringify({ code, inputs, early_exit: earlyExit }) + "\n");
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

  async runCode(code, inputs, earlyExit = true, onProgress = null) {
    const container = await this._acquire();
    try {
      return await container.run(code, inputs, earlyExit, onProgress);
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

// Kill ALL stale codearena containers from previous worker crashes before starting fresh pools.
// We match by image name (ancestor) for every language, running a single rm -f sweep.
// This prevents zombie containers from building up across restarts.
// Check if docker is available before trying to clean up
let dockerAvailable = false;
try {
    execSync("docker --version", { stdio: "ignore" });
    dockerAvailable = true;
} catch (e) {
    console.warn("⚠️  [judge] Docker not found in PATH. Judge containers will not be available.");
}

if (dockerAvailable) {
    try {
      console.log("🧹 [judge] Cleaning up stale codearena containers...");
  const allImages = Object.values(LANGUAGE_CONFIG).map((c) => c.image);
  for (const image of allImages) {
    try {
      // -a catches stopped/exited containers too; --rm containers show as running until the daemon cleans up
      const ids = execSync(`docker ps -a -q --filter "ancestor=${image}"`, { stdio: ["pipe", "pipe", "pipe"] })
        .toString().trim().split("\n").filter(Boolean);
      if (ids.length > 0) {
        console.log(`🗑  [judge] Removing ${ids.length} stale ${image} container(s)...`);
        execSync(`docker rm -f ${ids.join(" ")}`, { stdio: "pipe" });
      }
    } catch {
      // individual image sweep failed — not fatal
    }
  }
  console.log("✅ [judge] Stale container cleanup complete.");
} catch (e) {
  console.warn("⚠️  [judge] Cleanup step failed (non-fatal):", e.message);
}
}

console.log(`🏗️  [judge] Starting runner pools (Size: ${POOL_SIZE})...`);
const pools = {};
for (const lang of Object.keys(LANGUAGE_CONFIG)) {
  console.log(`⏱️  [judge] Initializing pool for: ${lang}`);
  pools[lang] = new WarmContainerPool(lang, POOL_SIZE);
}
console.log("✅ [judge] All runner pools initialized.");

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
  static async runTestCases(language, code, inputs, earlyExit = true, onProgress = null) {
    const pool = pools[language];
    if (!pool) {
      return {
        results: [{ error: `Unsupported language: ${language}` }],
        stopped_at: 0,
      };
    }
    return pool.runCode(code, inputs, earlyExit, onProgress);
  }
}

export default JudgeService;
