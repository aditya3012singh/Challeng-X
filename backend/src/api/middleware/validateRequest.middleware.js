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
        // Detect if schema expects the full request object { body, query, params } or is flat
        const shape = schema.shape || {};
        const hasTopLevelKeys = Object.keys(shape).some(key => ["body", "query", "params"].includes(key));
        
        if (hasTopLevelKeys) {
            const validated = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.validated = validated;
            if (validated.body !== undefined) req.body = validated.body;
            if (validated.query !== undefined) req.query = validated.query;
            if (validated.params !== undefined) req.params = validated.params;
        } else {
            const validatedBody = schema.parse(req.body);
            req.validated = { body: validatedBody };
            req.body = validatedBody;
        }
        
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
