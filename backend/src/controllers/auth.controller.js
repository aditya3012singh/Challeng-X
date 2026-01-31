// • Register user
// • Login user
// • Issue JWT

import { loginService, registerService, refreshTokenService } from "../services/auth.service.js";
import { accessCookieOptions, refreshCookieOptions } from "../utils/cookies.js";
import { loginSchema, registerSchema } from "../validation/auth.schema.js";
import prisma from "../config/db.js";

export const login = async (req, res) => {

    const validationResult= loginSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({
        message: validationResult.error.errors[0].message,
        });
    }
    const { email, password } = validationResult.data;
    try {
        const { accessToken, refreshToken, user } = await loginService(email, password);
        
        res
            .cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", refreshToken, refreshCookieOptions)
            .json({ 
                message: "Login successful",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
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

export const logout = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        // Clear refresh token from database
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { refreshTokenHash: null }
            });
        }

        // Clear cookies
        res
            .clearCookie("accessToken", accessCookieOptions)
            .clearCookie("refreshToken", refreshCookieOptions)
            .json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed" });
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                rating: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
}

export const refreshToken = async (req, res) => {
    try {
        await refreshTokenService(req, res);
    } catch (error) {
        res.status(500).json({ message: "Token refresh failed" });
    }
}