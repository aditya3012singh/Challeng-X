import structuredLogger from "../../core/logger/structuredLogger.js";

/**
 * Centralized Error Handler Middleware
 * 
 * Prevents leakage of internal architecture, stack traces, and raw database errors
 * to the client by sending a generic 500 message for unhandled exceptions.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "An error occurred";

    // 🛡️ Map Prisma database errors to clean client response codes
    if (err.code) {
        switch (err.code) {
            case "P2002": // Unique constraint failed (e.g. duplicate username or email)
                statusCode = 409;
                const target = err.meta?.target ? ` (${err.meta.target.join(", ")})` : "";
                message = `A record with this unique field already exists${target}.`;
                break;
            case "P2025": // Record to update/delete/find not found
                statusCode = 404;
                message = "The requested record was not found.";
                break;
            case "P2003": // Foreign key constraint failed
                statusCode = 400;
                message = "Database relationship integrity violation.";
                break;
            default:
                break;
        }
    }

    // 📊 Log the error structured with its traceId automatically bound via AsyncLocalStorage
    structuredLogger.error(`[❌ ERROR] ${req.method} ${req.originalUrl}`, {
        errorMessage: err.message,
        errorStack: err.stack,
        prismaCode: err.code,
        statusCode
    });

    if (statusCode === 500) {
        // Hide the actual error details from the client for 500s
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later."
        });
    }

    // Allow 4xx/operational errors to pass their messages safely to the client
    return res.status(statusCode).json({
        success: false,
        message
    });
};

export default errorHandler;
