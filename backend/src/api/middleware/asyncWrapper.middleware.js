/**
 * AsyncWrapper Middleware
 * Swallows asynchronous route handler exceptions and forwards them cleanly to the global Express error handler.
 * 
 * @param {Function} fn - Async controller function (req, res, next)
 * @returns {Function} Express middleware handler
 */
const asyncWrapper = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncWrapper;
