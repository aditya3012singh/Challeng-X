import { ZodError } from "zod";

/**
 * ValidateRequest Middleware
 * Intercepts route payloads and runs structural validations against a Zod schema contract.
 * If validation fails, it returns a standard 400 response with failure details.
 * If successful, it stores the parsed, sanitized fields on `req.validated` and continues.
 * 
 * @param {import("zod").ZodSchema} schema - Zod Schema configuration
 * @returns {Function} Express middleware handler
 */
const validateRequest = (schema) => (req, res, next) => {
    try {
        const validated = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        
        req.validated = validated;
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const validationErrors = error.issues || error.errors || [];
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};

export default validateRequest;
