import { z } from "zod";

class ProblemSchema {
    static createProblemSchema = z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
            errorMap: () => ({ message: "Difficulty must be either EASY, MEDIUM, or HARD" }),
        }),
        timeLimitMs: z.number().min(1, "Time limit must be at least 1 ms").optional(),
    });

    static unlockHintSchema = z.object({
        hintIndex: z.number().min(0).max(2, "Invalid hint index. Must be 0, 1, or 2."),
        battleId: z.string().uuid("Invalid battle ID format").optional(),
    });

    static personalizedAIHintSchema = z.object({
        currentCode: z.string().min(1, "Code cannot be empty"),
        language: z.string().min(1, "Language is required"),
    });
}

export default ProblemSchema;