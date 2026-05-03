/**
 * Judge Service - Code Execution Engine
 * 
 * Handles code execution using warm container pools
 * Extracted from main backend for independent scaling
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to runners directory
const RUNNERS_DIR = env.CODEARENA_RUNNERS_PATH || path.resolve(__dirname, '../../runners');
logger.info(`[Judge] RUNNERS_DIR = ${RUNNERS_DIR}`);

// Convert Windows path to Docker-compatible path
function toDockerPath(p) {
    return p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1');
}

// Language configurations
const LANGUAGE_CONFIG = {
    java: {
        image: 'codearena-java',
        runnerCmd: ['python3', '-u', '/runners/java_runner.py'],
    },
    cpp: {
        image: 'codearena-cpp',
        runnerCmd: ['python3', '-u', '/runners/cpp_runner.py'],
    },
};

/**
 * Warm Container - Persistent Docker container for code execution
 */
class WarmContainer {
    constructor(language, config) {
        this.language = language;
        this.config = config;
        this.busy = false;
        this._buffer = '';
        this._pendingResolve = null;
        this._pendingReject = null;
        this._startContainer();
    }

    _startContainer() {
        const runnersMount = toDockerPath(RUNNERS_DIR);

        this._proc = spawn('docker', [
            'run', '--rm',
            '-i',
            '--network', 'none',
            '--memory', '512m',
            '--pids-limit', '512',
            '--cpus', '2.0',
            '-v', `${runnersMount}:/runners:ro`,
            this.config.image,
            ...this.config.runnerCmd,
        ]);

        // Handle stdout
        this._proc.stdout.on('data', (data) => {
            this._buffer += data.toString();
            let idx;
            while ((idx = this._buffer.indexOf('\n')) !== -1) {
                const line = this._buffer.slice(0, idx).trim();
                this._buffer = this._buffer.slice(idx + 1);
                if (!line) continue;

                try {
                    const msg = JSON.parse(line);

                    if (msg.type === 'progress' && this._onProgress) {
                        this._onProgress(msg);
                    } else if (msg.type === 'finished' && this._pendingResolve) {
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
                        this._pendingResolve({ error: 'Container returned invalid JSON' });
                        this._pendingResolve = null;
                    }
                }
            }
        });

        // Handle stderr
        this._proc.stderr.on('data', (data) => {
            const errOut = data.toString().trim();
            if (errOut) {
                logger.error(`[Judge] ${this.language} container stderr:`, errOut);
            }
        });

        this._proc.on('spawn', () => {
            logger.info(`[Judge] ${this.language} container spawned`);
        });

        this._proc.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                logger.warn(`[Judge] ${this.language} container exited (code ${code}) — restarting`);
            }
            this._buffer = '';
            if (this._pendingResolve) {
                this._pendingResolve({ error: 'Container exited unexpectedly' });
                this._pendingResolve = null;
            }
            setTimeout(() => this._startContainer(), 1000);
        });

        this._proc.on('error', (err) => {
            logger.error(`[Judge] Failed to start ${this.language} container:`, err.message);
            if (err.code === 'ENOENT') {
                logger.error('[Judge] Docker command not found. Please ensure Docker is installed.');
            }
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
                        results: [{ error: 'Time Limit Exceeded (60s batch hard kill)' }],
                        stopped_at: 0,
                    });
                    this._pendingResolve = null;
                    this._onProgress = null;
                    try { this._proc.kill('SIGKILL'); } catch { }
                }
            }, env.JUDGE_TIMEOUT_MS);

            const origResolve = this._pendingResolve;
            this._pendingResolve = (result) => {
                clearTimeout(killer);
                origResolve(result);
            };

            this._proc.stdin.write(JSON.stringify({ code, inputs, early_exit: earlyExit }) + '\n');
        });
    }
}

/**
 * Warm Container Pool - Manages multiple containers for concurrent execution
 */
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

    shutdown() {
        for (const c of this._pool) {
            try { c._proc.kill('SIGKILL'); } catch { }
        }
    }
}

// Initialize pools
let dockerAvailable = false;
try {
    execSync('docker --version', { stdio: 'ignore' });
    dockerAvailable = true;
} catch (e) {
    logger.warn('[Judge] Docker not found in PATH. Judge containers will not be available.');
}

if (dockerAvailable) {
    try {
        logger.info('[Judge] Cleaning up stale codearena containers...');
        const allImages = Object.values(LANGUAGE_CONFIG).map((c) => c.image);
        for (const image of allImages) {
            try {
                const ids = execSync(`docker ps -a -q --filter "ancestor=${image}"`, { stdio: ['pipe', 'pipe', 'pipe'] })
                    .toString().trim().split('\n').filter(Boolean);
                if (ids.length > 0) {
                    logger.info(`[Judge] Removing ${ids.length} stale ${image} container(s)...`);
                    execSync(`docker rm -f ${ids.join(' ')}`, { stdio: 'pipe' });
                }
            } catch {
                // Individual image sweep failed — not fatal
            }
        }
        logger.info('[Judge] Stale container cleanup complete.');
    } catch (e) {
        logger.warn('[Judge] Cleanup step failed (non-fatal):', e.message);
    }
}

logger.info(`[Judge] Starting runner pools (Size: ${env.JUDGE_POOL_SIZE})...`);
const pools = {};
for (const lang of Object.keys(LANGUAGE_CONFIG)) {
    logger.info(`[Judge] Initializing pool for: ${lang}`);
    pools[lang] = new WarmContainerPool(lang, env.JUDGE_POOL_SIZE);
}
logger.info('[Judge] All runner pools initialized.');

// Cleanup on exit
const shutdown = () => {
    logger.info('[Judge] Shutting down warm container pools...');
    for (const pool of Object.values(pools)) pool.shutdown();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('exit', shutdown);

/**
 * Judge Service - Public API
 */
class JudgeService {
    /**
     * Run code against test cases
     * @param {string} language - Programming language
     * @param {string} code - Source code
     * @param {Array} inputs - Test case inputs
     * @param {boolean} earlyExit - Stop on first failure
     * @param {Function} onProgress - Progress callback
     * @returns {Promise<{results, stopped_at}>}
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

    /**
     * Get health status
     */
    static getHealth() {
        return {
            status: 'healthy',
            service: env.JUDGE_SERVICE_NAME,
            pools: Object.entries(pools).reduce((acc, [lang, pool]) => {
                acc[lang] = {
                    size: pool._pool.length,
                    busy: pool._pool.filter(c => c.busy).length,
                    available: pool._pool.filter(c => !c.busy).length,
                    waiting: pool._waitQueue.length,
                };
                return acc;
            }, {}),
            timestamp: new Date().toISOString(),
        };
    }
}

export default JudgeService;
