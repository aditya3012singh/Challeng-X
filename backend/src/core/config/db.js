import { PrismaClient } from "@prisma/client";
import structuredLogger from "../logger/structuredLogger.js";
import { recordDbQuery, recordDbError } from "../metrics/index.js";

const SLOW_QUERY_THRESHOLD_MS = Number(process.env.PRISMA_SLOW_QUERY_THRESHOLD_MS || 200);

const basePrisma = new PrismaClient();

// Integrate native Prisma Client Extensions to intercept all model operations transparently
export const prismaExtended = basePrisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const modelName = model || "unknown";
                const start = Date.now();
                let success = false;
                
                try {
                    const result = await query(args);
                    success = true;
                    return result;
                } catch (error) {
                    structuredLogger.error(`Prisma Query Failed: ${modelName}.${operation}`, {
                        model: modelName,
                        operation,
                        error: error.message
                    });
                    throw error;
                } finally {
                    const duration = Date.now() - start;
                    
                    // Automatically record metrics at client level (avoids manual query wrappers)
                    recordDbQuery(modelName, success ? "success" : "error", duration);
                    if (!success) {
                        recordDbError(modelName, "unknown");
                    }
                    
                    if (duration > SLOW_QUERY_THRESHOLD_MS) {
                        structuredLogger.warn(`🐢 [DB Slow Query] ${modelName}.${operation} took ${duration}ms`, {
                            model: modelName,
                            operation,
                            durationMs: duration
                        });
                    } else {
                        structuredLogger.debug(`[DB Query] ${modelName}.${operation} took ${duration}ms`, {
                            model: modelName,
                            operation,
                            durationMs: duration
                        });
                    }
                }
            }
        }
    }
});

basePrisma.$connect()
  .then(() => {
    structuredLogger.info('Successfully connected to Postgres database via Prisma.');
  })
  .catch((err) => {
    structuredLogger.error('Prisma Connection Failed', { error: err.message });
  });

class Database {
    static client = prismaExtended;
}

export default Database;
