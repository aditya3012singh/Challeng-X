import { WarmContainer } from "./warmContainer.js";
import logger from "../../utils/logger.js";

/**
 * Warm Container Pool - Manages multiple containers for concurrent execution
 */
export class WarmContainerPool {
    constructor(language, config, size) {
        this.language = language;
        this._pool = Array.from({ length: size }, () =>
            new WarmContainer(language, config)
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
            try { c._proc.kill("SIGKILL"); } catch { }
        }
    }
}
