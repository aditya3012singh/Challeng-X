import { spawn } from "child_process";
import logger from "../../utils/logger.js";

/**
 * Warm Container - Persistent Docker container for code execution
 */
export class WarmContainer {
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
        this._proc = spawn("docker", [
            "run",
            "-i",
            "--memory", "512m",
            "--pids-limit", "512",
            "--cpus", "2.0",
            "-v", "/runners:/runners:ro",
            this.config.image,
            ...this.config.runnerCmd,
        ]);

        // Handle stdout
        this._proc.stdout.on("data", (data) => {
            this._buffer += data.toString();
            let idx;
            while ((idx = this._buffer.indexOf("\n")) !== -1) {
                const line = this._buffer.slice(0, idx).trim();
                this._buffer = this._buffer.slice(idx + 1);
                if (!line) continue;

                try {
                    const msg = JSON.parse(line);

                    if (msg.type === "progress" && this._onProgress) {
                        this._onProgress(msg);
                    } else if (msg.type === "finished" && this._pendingResolve) {
                        const resolve = this._pendingResolve;
                        this._pendingResolve = null;
                        this._pendingReject = null;
                        this._onProgress = null;
                        resolve(msg);
                    } else if (!msg.type && this._pendingResolve) {
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

        // Handle stderr
        this._proc.stderr.on("data", (data) => {
            const errOut = data.toString().trim();
            if (errOut) {
                logger.error(`[Judge] ${this.language} container stderr:`, errOut);
            }
        });

        this._proc.on("spawn", () => {
            logger.info(`[Judge] ${this.language} container spawned`);
        });

        this._proc.on("exit", (code) => {
            if (code !== 0 && code !== null) {
                logger.warn(`[Judge] ${this.language} container exited (code ${code}) — restarting`);
            }
            this._buffer = "";
            if (this._pendingResolve) {
                this._pendingResolve({ error: "Container exited unexpectedly" });
                this._pendingResolve = null;
            }
            setTimeout(() => this._startContainer(), 1000);
        });

        this._proc.on("error", (err) => {
            logger.error(`[Judge] Failed to start ${this.language} container:`, err.message);
        });

        logger.info(`[Judge] Warm ${this.language} container initialization started`);
    }

    /**
     * Run code against test inputs
     */
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
