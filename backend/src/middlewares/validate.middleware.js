const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Parse the request body against the Zod schema
            const validData = schema.parse(req.body);

            // Replace req.body with the sanitized/validated data
            req.body = validData;

            next();
        } catch (error) {
            // Zod throws a ZodError if validation fails
            // We map it to a readable format
            if (error.name === "ZodError") {
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);

                // Pass to the centralized error handler as a 400 Bad Request
                const validationError = new Error(`Validation failed: ${errorMessages.join(', ')}`);
                validationError.statusCode = 400;
                return next(validationError);
            }

            next(error);
        }
    };
};

export default validateRequest;
