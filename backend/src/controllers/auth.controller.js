// • Register user
// • Login user
// • Issue JWT

import { loginService, registerService } from "../services/auth.service.js";
import { accessCookieOptions, refreshCookieOptions } from "../utils/cookies.js";
import { loginSchema, registerSchema } from "../validation/auth.schema.js";

export const login = async (req, res) => {

    const validationResult= loginSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
        message: validationResult.error.errors[0].message,
        });
    }
    const { email, password } = validationResult.data;
    try {
        const { accessToken, refreshToken } = await loginService(email, password);
        
        res
            .cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", refreshToken, refreshCookieOptions)
            .json({ message: "Login successful" });
    } catch (error) {
        res.status(error.status || 401).json({
            message: error.message || "Authentication failed",
    });
  }
}

export const Register = async (req, res) => {
    const CheckSchema= registerSchema.safeParse(req.body);

    if (!CheckSchema.success) {
        return res.status(400).json({
        message: CheckSchema.error.errors[0].message,
        });
    }
    const { email, username, password } = CheckSchema.data;

    try {
        const result= await registerService(email, username, password);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || "Registration failed",
    });
  }
}