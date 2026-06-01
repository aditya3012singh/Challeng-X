import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import env from "../../core/config/env.js";
import logger from "../../core/logger/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * gRPC Judge Client Service
 */
class GrpcJudgeClient {
    constructor() {
        this.client = null;
        this.isReady = false;
        this._loadProto();
    }

    /**
     * Load gRPC proto file
     */
    _loadProto() {
        const protoPath = path.join(__dirname, "judge.proto");
        const packageDefinition = protoLoader.loadSync(protoPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        this.proto = grpc.loadPackageDefinition(packageDefinition);
    }

    /**
     * Create gRPC client
     */
    _createClient() {
        const host = env.JUDGE_GRPC_HOST || "localhost";
        const port = env.JUDGE_GRPC_PORT || 50051;

        this.client = new grpc.Client(
            `${host}:${port}`,
            grpc.credentials.createInsecure()
        );

        this.judgeService = this.proto.judge.JudgeService;
        this.isReady = true;

        logger.info(`[GrpcJudgeClient] Connected to gRPC server at ${host}:${port}`);
    }

    /**
     * Get gRPC client (lazy initialization)
     */
    _getClient() {
        if (!this.isReady) {
            this._createClient();
        }
        return this.client;
    }

    /**
     * Check if error is retryable
     * @param {object} error - gRPC error object
     * @returns {boolean} - true if error is retryable
     */
    _isRetryableError(error) {
        // gRPC status codes
        const statusCodes = grpc.status;

        // Retryable status codes
        const retryableStatuses = [
            statusCodes.UNAVAILABLE,
            statusCodes.DEADLINE_EXCEEDED,
            statusCodes.RESOURCE_EXHAUSTED,
        ];

        // Check if error has a gRPC status code
        if (error.code && retryableStatuses.includes(error.code)) {
            logger.warn(`[GrpcJudgeClient] Retryable gRPC error for ${this._submissionId}: ${error.code}`);
            return true;
        }

        // Check if error message contains retryable status
        const errorMessage = error.message?.toLowerCase() || "";
        const retryableMessages = [
            "unavailable",
            "deadline exceeded",
            "resource exhausted",
            "connection refused",
            "connection reset",
            "broken pipe",
        ];

        const isRetryable = retryableMessages.some(msg => errorMessage.includes(msg));
        if (isRetryable) {
            logger.warn(`[GrpcJudgeClient] Retryable error (message-based) for ${this._submissionId}: ${error.message}`);
        }

        return isRetryable;
    }

    /**
     * Check if error is non-retryable (invalid request)
     * @param {object} error - gRPC error object
     * @returns {boolean} - true if error is non-retryable
     */
    _isNonRetryableError(error) {
        const statusCodes = grpc.status;

        // Non-retryable: INVALID_ARGUMENT
        if (error.code && error.code === statusCodes.INVALID_ARGUMENT) {
            logger.error(`[GrpcJudgeClient] Non-retryable error (INVALID_ARGUMENT) for ${this._submissionId}: ${error.message}`);
            return true;
        }

        // Non-retryable: invalid language, missing fields, etc.
        const errorMessage = error.message?.toLowerCase() || "";
        const nonRetryableMessages = [
            "invalid argument",
            "invalid language",
            "unsupported language",
            "not found",
            "permission denied",
        ];

        const isNonRetryable = nonRetryableMessages.some(msg => errorMessage.includes(msg));
        if (isNonRetryable) {
            logger.error(`[GrpcJudgeClient] Non-retryable error (message-based) for ${this._submissionId}: ${error.message}`);
        }

        return isNonRetryable;
    }

    /**
     * Run code against test cases via gRPC
     * @param {object} options - Execution options
     * @returns {Promise<{results, stopped_at, executionTimeMs}>}
     */
    async runCode(options) {
        const { submissionId, language, code, inputs, earlyExit } = options;
        this._submissionId = submissionId; // Store for error logging

        if (!this.isReady) {
            this._createClient();
        }

        const t0 = Date.now();

        return new Promise((resolve, reject) => {
            const client = this._getClient();

            // Create deadline: 30 seconds from now
            const deadline = new Date();
            deadline.setSeconds(deadline.getSeconds() + 30);

            client.makeUnaryRequest(
                "/judge.JudgeService/RunCode",
                (err, request) => {
                    if (err) {
                        return reject(err);
                    }
                    return request;
                },
                {
                    submissionId,
                    language,
                    code,
                    inputs,
                    earlyExit,
                },
                (err, response) => {
                    const executionTimeMs = Date.now() - t0;

                    if (err) {
                        logger.error(`[GrpcJudgeClient] gRPC error for ${submissionId}:`, err);

                        // Check if error is non-retryable (INVALID_ARGUMENT)
                        if (this._isNonRetryableError(err)) {
                            // Throw non-retryable error - BullMQ will mark job as failed
                            return reject(err);
                        }

                        // Check if error is retryable
                        if (this._isRetryableError(err)) {
                            // Throw retryable error - BullMQ will retry
                            return reject(err);
                        }

                        // Default: throw error for BullMQ to handle
                        return reject(err);
                    }

                    // Convert gRPC results to internal format
                    const results = response.results.map((res) => ({
                        output: res.output || null,
                        error: res.error || null,
                        passed: res.passed,
                    }));

                    resolve({
                        results,
                        stopped_at: response.stoppedAt,
                        executionTimeMs,
                    });
                },
                { deadline } // 30 second timeout
            );
        });
    }

    /**
     * Get health status
     */
    async getHealth() {
        if (!this.isReady) {
            return {
                status: "connecting",
                grpc: false,
                host: env.JUDGE_GRPC_HOST || "localhost",
                port: env.JUDGE_GRPC_PORT || 50051,
            };
        }

        try {
            // Try a simple ping
            const client = this._getClient();
            // Note: gRPC doesn't have a built-in ping, so we just check if client exists
            return {
                status: "healthy",
                grpc: true,
                host: env.JUDGE_GRPC_HOST || "localhost",
                port: env.JUDGE_GRPC_PORT || 50051,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: "unhealthy",
                grpc: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }

    /**
     * Close gRPC client connection
     */
    close() {
        if (this.client) {
            this.client.close();
            this.isReady = false;
            logger.info("[GrpcJudgeClient] gRPC client closed");
        }
    }
}

export default new GrpcJudgeClient();
