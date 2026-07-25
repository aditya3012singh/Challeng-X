import Database from "./db.js";
import logger from "../logger/logger.js";

/**
 * DBWrapper
 * Centralized DB transaction and single-query executor.
 * Intercepts slow queries, automates deadlock/serialization retries, and maps raw database errors.
 */
class DBWrapper {
    /**
     * Executes a single database query with performance logging and error mapping.
     * @param {string} queryName - Descriptive name for logging / tracing
     * @param {function} queryFn - Callback function receiving db client and returning a promise
     * @returns {Promise<any>}
     */
    static async execute(queryName, queryFn) {
        const start = Date.now();
        try {
            const result = await queryFn(Database.client);
            const duration = Date.now() - start;
            if (duration > 200) {
                logger.warn(`🐢 [DB Slow Query] ${queryName} took ${duration}ms`);
            } else {
                logger.debug(`[DB Query] ${queryName} took ${duration}ms`);
            }
            return result;
        } catch (err) {
            logger.error(`❌ [DB Query Error] ${queryName} failed: ${err.message}`);
            throw this.mapError(err);
        }
    }

    /**
     * Runs a transaction block with automatic retry logic for transient write conflicts.
     * @param {string} txName - Descriptive name for logging
     * @param {function} txFn - Callback function receiving transactional client and returning a promise
     * @param {number} maxRetries - Maximum number of retry attempts for conflicts (default: 3)
     * @returns {Promise<any>}
     */
    static async transaction(txName, txFn, maxRetries = 3) {
        let attempt = 0;
        while (attempt < maxRetries) {
            attempt++;
            const start = Date.now();
            try {
                const result = await Database.client.$transaction(async (tx) => {
                    return await txFn(tx);
                });
                const duration = Date.now() - start;
                if (duration > 500) {
                    logger.warn(`🐢 [DB Slow Transaction] ${txName} took ${duration}ms`);
                } else {
                    logger.debug(`[DB Transaction] ${txName} completed in ${duration}ms`);
                }
                return result;
            } catch (err) {
                // Check if the error is a retryable transient database error:
                // Prisma Code P2034: Transaction failed due to write conflict or deadlock
                // Or standard PostgreSQL deadlock messages
                const isRetryable = err.code === "P2034" || 
                                    (err.message && err.message.toLowerCase().includes("deadlock")) ||
                                    (err.message && err.message.toLowerCase().includes("conflict"));

                if (isRetryable && attempt < maxRetries) {
                    const backoff = attempt * 150; // Exponential backoff: 150ms, 300ms...
                    logger.warn(`🔄 [DB Conflict] ${txName} failed (Attempt ${attempt}/${maxRetries}). Retrying in ${backoff}ms...`);
                    await new Promise(res => setTimeout(res, backoff));
                    continue;
                }
                
                logger.error(`❌ [DB Transaction Failure] ${txName} failed: ${err.message}`);
                throw this.mapError(err);
            }
        }
    }

    /**
     * Maps database engine errors (Prisma) to standard clean application exceptions
     * @param {Error} err 
     * @returns {Error}
     */
    static mapError(err) {
        if (!err) return err;

        // Prisma unique constraint violation (e.g. duplicate username/email)
        if (err.code === "P2002") {
            const fields = err.meta?.target || "unknown fields";
            const customErr = new Error(`Conflict: Unique constraint failed on fields (${fields})`);
            customErr.statusCode = 409;
            customErr.code = "UNIQUE_CONSTRAINT_VIOLATION";
            customErr.meta = err.meta;
            customErr.originalCode = err.code;
            return customErr;
        }

        // Prisma record to update/delete not found
        if (err.code === "P2025") {
            const customErr = new Error(`Not Found: Database record does not exist.`);
            customErr.statusCode = 404;
            customErr.code = "RECORD_NOT_FOUND";
            return customErr;
        }

        // Prisma foreign key constraint failed
        if (err.code === "P2003") {
            const customErr = new Error(`Bad Request: Foreign key constraint violation.`);
            customErr.statusCode = 400;
            customErr.code = "FOREIGN_KEY_VIOLATION";
            return customErr;
        }

        return err;
    }
}

export default DBWrapper;
