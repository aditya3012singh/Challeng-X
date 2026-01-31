import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),

    password: z
        .string()
        .min(1, "Password is required"),
});

export const registerSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username must be at most 30 characters long"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
    // role: z.enum(["USER", "ADMIN"], {
    //     errorMap: () => ({ message: "Role must be either USER or ADMIN" }),
    // }),
});