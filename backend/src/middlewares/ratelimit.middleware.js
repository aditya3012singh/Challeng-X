import rateLimit from "express-rate-limit";

// General API Rate Limiter
// Stricter than Nginx just in case Nginx is bypassed or misconfigured
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter Rate Limiter for Authentication Routes
// Prevents brute-force credential stuffing
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10, // Start blocking after 10 requests
    message: "Too many login/register attempts from this IP, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false,
});
