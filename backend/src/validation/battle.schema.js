import { z } from "zod";

export const createBattleSchema = z.object({
    problemId: z.string().uuid("Invalid problem ID format").optional(), // Optional since Random Battle doesn't send it
});

export const joinBattleSchema = z.object({
    battleCode: z.string().length(6, "Battle code must be exactly 6 characters"),
});

export const submitCodeSchema = z.object({
    code: z.string().min(1, "Code cannot be empty").max(50000, "Code exceeds maximum allowed size (50KB)"),
    language: z.enum(["python", "js", "cpp", "c"], {
        errorMap: () => ({ message: "Language must be one of: python, js, cpp, c" })
    }),
    type: z.enum(["RUN", "SUBMIT"]).optional().default("SUBMIT"),
});
