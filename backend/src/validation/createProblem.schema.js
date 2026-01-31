
import {z} from "zod";

export const createProblemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
        errorMap: () => ({ message: "Difficulty must be either EASY, MEDIUM, or HARD" }),
    }),
    timeLimitMs: z.number().min(1, "Time limit must be at least 1 ms").optional(),
    // memoryLimitMb: z.number().min(1, "Memory limit must be at least 1 MB").optional(),
});