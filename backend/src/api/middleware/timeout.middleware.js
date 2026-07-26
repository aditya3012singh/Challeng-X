import structuredLogger from "../../core/logger/structuredLogger.js";

/**
 * Request Timeout Middleware
 * 
 * Prevents requests from hanging indefinitely by enforcing a maximum execution time limit.
 * If a request is not resolved within the timeout, it responds with a 408 Request Timeout code
 * and cancels further socket holds.
 * 
 * @param {number} timeoutMs - Timeout limit in milliseconds (defaults to 15000ms / 15s)
 */
const timeoutMiddleware = (timeoutMs = 15000) => {
    return (req, res, next) => {
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                structuredLogger.warn("REQUEST_TIMEOUT", {
                    method: req.method,
                    path: req.originalUrl,
                    timeoutMs
                });

                res.status(408).json({
                    success: false,
                    message: "Request timeout. The server took too long to respond."
                });
            }
        }, timeoutMs);

        // Clear the timeout timer once the response completes or is closed by the client
        res.on("finish", () => clearTimeout(timer));
        res.on("close", () => clearTimeout(timer));

        next();
    };
};

export default timeoutMiddleware;
