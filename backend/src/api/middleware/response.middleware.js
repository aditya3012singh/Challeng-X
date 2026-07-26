/**
 * Unified Response Format Middleware
 * 
 * Attaches standard, chainable utility functions to the Express response prototype.
 * This guarantees a 100% unified JSON contract for successful API returns:
 * {
 *   success: true,
 *   message: "...",
 *   data: { ... }
 * }
 */
const responseMiddleware = (req, res, next) => {
    /**
     * Respond with 200 OK
     * @param {object} data - Payload to send to the client
     * @param {string} message - User-friendly message
     */
    res.ok = (data = {}, message = "Success") => {
        return res.status(200).json({
            success: true,
            message,
            data
        });
    };

    /**
     * Respond with 201 Created
     * @param {object} data - Payload of the created resource
     * @param {string} message - User-friendly message
     */
    res.created = (data = {}, message = "Created successfully") => {
        return res.status(201).json({
            success: true,
            message,
            data
        });
    };

    next();
};

export default responseMiddleware;
