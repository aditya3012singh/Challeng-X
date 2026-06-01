import { getPool, shutdownPools } from "./runCode.handler.js";
import logger from "../../utils/logger.js";

/**
 * gRPC Judge Service Implementation
 */
class JudgeServiceImpl {
    /**
     * Run code against test cases
     * @param {object} call - gRPC call object
     * @param {object} callback - gRPC callback
     */
    runCode(call, callback) {
        const { submissionId, language, code, inputs, earlyExit } = call.request;

        logger.info(`[Judge] Processing submission ${submissionId} for language ${language}`);

        const pool = getPool(language);
        if (!pool) {
            return callback(null, {
                results: [{ error: `Unsupported language: ${language}` }],
                stoppedAt: 0,
                executionTimeMs: 0,
                error: `Unsupported language: ${language}`,
            });
        }

        const t0 = Date.now();

        pool.runCode(code, inputs, earlyExit)
            .then((result) => {
                const executionTimeMs = Date.now() - t0;

                // Convert results to gRPC format
                const grpcResults = result.results.map((res) => ({
                    output: res.output || '',
                    error: res.error || '',
                    passed: !res.error,
                }));

                callback(null, {
                    results: grpcResults,
                    stoppedAt: result.stopped_at,
                    executionTimeMs,
                    error: '',
                });
            })
            .catch((error) => {
                const executionTimeMs = Date.now() - t0;
                logger.error(`[Judge] Error executing code for ${submissionId}:`, error);

                callback(null, {
                    results: [{ error: error.message || 'Execution failed' }],
                    stoppedAt: 0,
                    executionTimeMs,
                    error: error.message || 'Execution failed',
                });
            });
    }
}

export default JudgeServiceImpl;
