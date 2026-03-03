import logger from "../utils/logger.js";

/**
 * Centralized Error Handler Middleware
 * 
 * Prevents leakage of internal architecture, stack traces, and raw database errors
 * to the client by sending a generic 500 message for unhandled exceptions.
 */
const errorHandler = (err, req, res, next) => {
    // Log the actual error to the server console so developers can debug
    logger.error(`[❌ ERROR] ${req.method} ${req.originalUrl}`);
    logger.error(err.stack || err.message || err);

    // If it's a known operational error with a specific status code (e.g. from validation)
    const statusCode = err.statusCode || 500;

    if (statusCode === 500) {
        // Hide the actual error details from the client for 500s
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later."
        });
    }

    // Allow 4xx errors (like 400 Bad Request, 401 Unauthorized) to pass their messages
    return res.status(statusCode).json({
        success: false,
        message: err.message || "An error occurred"
    });
};

export default errorHandler;
