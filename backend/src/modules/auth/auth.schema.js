import { z } from "zod";

class AuthSchema {
    static loginSchema = z.object({
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format"),

        password: z
            .string()
            .min(1, "Password is required"),
    });

    static registerSchema = z.object({
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
    static forgotPasswordSchema = z.object({
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format"),
    });

    static resetPasswordSchema = z.object({
        token: z.string().min(1, "Token is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters long"),
    });

    static changePasswordSchema = z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    });
}

export default AuthSchema;