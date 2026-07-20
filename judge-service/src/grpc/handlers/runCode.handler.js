import { WarmContainerPool } from "../pool/containerPool.js";
import logger from "../../utils/logger.js";

// Language configuration
const LANGUAGE_CONFIG = {
    // java: {
    //     image: 'codearena-java',
    //     runnerCmd: ['python3', '-u', '/runners/java_runner.py'],
    // },
    // cpp: {
    //     image: 'codearena-cpp',
    //     runnerCmd: ['python3', '-u', '/runners/cpp_runner.py'],
    // },
    python: {
        image: 'codearena-python',
        runnerCmd: ['python3', '-u', '/runners/python_runner.py'],
    },
    // c: {
    //     image: 'codearena-c',
    //     runnerCmd: ['python3', '-u', '/runners/c_runner.py'],
    // },
    // javascript: {
    //     image: 'codearena-js',
    //     runnerCmd: ['node', '/runners/js_runner.mjs'],
    // },
};

// Container pools per language
const pools = {};

/**
 * Initialize container pools for all languages
 */
export function initializePools(poolSize) {
    for (const [lang, config] of Object.entries(LANGUAGE_CONFIG)) {
        pools[lang] = new WarmContainerPool(lang, config, poolSize);
        logger.info(`[Judge] Initialized pool for ${lang} with ${poolSize} containers`);
    }
}

/**
 * Get pool for a language
 */
export function getPool(language) {
    return pools[language];
}

/**
 * Get health status of all pools
 */
export function getPoolHealth() {
    const health = {};
    for (const [lang, pool] of Object.entries(pools)) {
        health[lang] = {
            size: pool._pool.length,
            busy: pool._pool.filter(c => c.busy).length,
            available: pool._pool.filter(c => !c.busy).length,
            waiting: pool._waitQueue.length,
        };
    }
    return health;
}

/**
 * Shutdown all pools
 */
export function shutdownPools() {
    for (const pool of Object.values(pools)) {
        pool.shutdown();
    }
}
