// • Register user
// • Login user
// • Issue JWT

import AuthService from "../services/auth.service.js";
import CookieOptions from "../utils/cookies.js";
import AuthSchema from "../validation/auth.schema.js";
import Database from "../config/db.js";
import S3Service from "../services/s3.service.js";
import JwtService from "../utils/jwt.js";
import env from "../config/env.js";
import passport from "passport";

class AuthController {
    static async login(req, res) {

        const validationResult = AuthSchema.loginSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: validationResult.error.errors[0].message,
            });
        }
        const { email, password } = validationResult.data;
        try {
            const { accessToken, refreshToken, user } = await AuthService.loginService(email, password);

            res
                .cookie("accessToken", accessToken, CookieOptions.accessCookieOptions)
                .cookie("refreshToken", refreshToken, CookieOptions.refreshCookieOptions)
                .json({
                    message: "Login successful",
                    accessToken,
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

    static async Register(req, res) {
        const CheckSchema = AuthSchema.registerSchema.safeParse(req.body);

        if (!CheckSchema.success) {
            return res.status(400).json({
                message: CheckSchema.error.errors[0].message,
            });
        }
        const { email, username, password } = CheckSchema.data;

        try {
            const { accessToken, refreshToken, user, message } = await AuthService.registerService(email, username, password);

            res
                .status(201)
                .cookie("accessToken", accessToken, CookieOptions.accessCookieOptions)
                .cookie("refreshToken", refreshToken, CookieOptions.refreshCookieOptions)
                .json({
                    message,
                    accessToken,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
        } catch (error) {
            res.status(error.status || 500).json({
                message: error.message || "Registration failed",
            });
        }
    }

    static async logout(req, res) {
        try {
            const userId = req.user?.id;

            // Clear refresh token from database
            if (userId) {
                await Database.client.user.update({
                    where: { id: userId },
                    data: { refreshTokenHash: null }
                });
            }

            // Clear cookies
            res
                .clearCookie("accessToken", CookieOptions.accessCookieOptions)
                .clearCookie("refreshToken", CookieOptions.refreshCookieOptions)
                .json({ message: "Logout successful" });
        } catch (error) {
            res.status(500).json({ message: "Logout failed" });
        }
    }

    static async getProfile(req, res) {
        try {
            const userId = req.user.id;

            const user = await Database.client.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    rankPoints: true,
                    losses: true,
                    wins: true,
                    createdAt: true,
                    profilePic: true,
                    linkedin: true,
                    github: true,
                    leetcode: true,
                    gfg: true,
                    hackerrank: true,
                    codeforces: true,
                    instagram: true,
                    twitter: true
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

    static async refreshToken(req, res) {
        try {
            await AuthService.refreshTokenService(req, res);
        } catch (error) {
            res.status(500).json({ message: "Token refresh failed" });
        }
    }

    static async getPublicProfile(req, res) {
        try {
            const { username } = req.params;

            const user = await Database.client.user.findUnique({
                where: { username },
                select: {
                    id: true,
                    username: true,
                    role: true,
                    rankPoints: true,
                    losses: true,
                    wins: true,
                    createdAt: true,
                    profilePic: true,
                    linkedin: true,
                    github: true,
                    leetcode: true,
                    gfg: true,
                    hackerrank: true,
                    codeforces: true,
                    instagram: true,
                    twitter: true,
                    // Exclude sensitive information like email and password
                }
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Calculate additional stats
            const totalBattles = user.wins + user.losses;
            const winRate = totalBattles > 0 ? ((user.wins / totalBattles) * 100).toFixed(2) : 0;

            res.json({
                user: {
                    ...user,
                    totalBattles,
                    winRate: parseFloat(winRate)
                }
            });
        } catch (error) {
            console.error("Get public profile error:", error);
            res.status(500).json({ message: "Failed to fetch user profile" });
        }
    }
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body; // Expecting profile fields in body

            // Fields allowed to be updated
            const allowedFields = [
                'profilePic', 'linkedin', 'github', 
                'leetcode', 'gfg', 'hackerrank', 
                'codeforces', 'instagram', 'twitter'
            ];

            const dataToUpdate = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    dataToUpdate[field] = updateData[field];
                }
            }

            const updatedUser = await Database.client.user.update({
                where: { id: userId },
                data: dataToUpdate,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    profilePic: true,
                    linkedin: true,
                    github: true,
                    leetcode: true,
                    gfg: true,
                    hackerrank: true,
                    codeforces: true,
                    instagram: true,
                    twitter: true
                }
            });

            res.json({ message: "Profile updated successfully", user: updatedUser });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({ message: "Failed to update profile" });
        }
    }

    static async getProfileUploadUrl(req, res) {
        try {
            const userId = req.user.id;
            const { fileName, fileType } = req.query;

            if (!fileName || !fileType) {
                return res.status(400).json({ message: "fileName and fileType are required" });
            }

            const extension = fileName.split('.').pop();
            const key = `avatars/${userId}_${Date.now()}.${extension}`;

            const { uploadUrl, fileUrl } = await S3Service.getPresignedUrl(key, fileType);

            res.json({ uploadUrl, fileUrl });
        } catch (error) {
            console.error("Presigned URL error:", error);
            res.status(500).json({ message: "Failed to generate upload URL" });
        }
    }
    static async forgotPassword(req, res) {
        const validationResult = AuthSchema.forgotPasswordSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ message: validationResult.error.errors[0].message });
        }

        try {
            const result = await AuthService.forgotPasswordService(validationResult.data.email);
            // Including `devTokenHint` only for local environment UI population ease
            res.json(result); 
        } catch (error) {
            console.error("Forgot password error:", error);
            res.status(500).json({ message: "Failed to process forgot password request" });
        }
    }

    static async resetPassword(req, res) {
        // Support token either deeply nested in body or passed via path params
        const token = req.params.token || req.body.token;
        const newPassword = req.body.newPassword;

        const validationResult = AuthSchema.resetPasswordSchema.safeParse({ token, newPassword });
        if (!validationResult.success) {
            return res.status(400).json({ message: validationResult.error.errors[0].message });
        }

        try {
            const result = await AuthService.resetPasswordService(token, newPassword);
            res.json(result);
        } catch (error) {
            console.error("Reset password error:", error);
            const status = error.message === "Token is invalid or has expired" ? 400 : 500;
            res.status(status).json({ message: error.message || "Failed to reset password" });
        }
    }

    static async socialAuthCallback(req, res) {
        try {
            const user = req.user;
            if (!user) return res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);

            const accessToken = JwtService.generateAccessToken({
                id: user.id,
                role: user.role,
            });

            const refreshToken = JwtService.generateRefreshToken({ id: user.id });
            const refreshTokenHash = await Database.client.user.update({
                where: { id: user.id },
                data: { refreshTokenHash: await import("bcrypt").then(b => b.default.hash(refreshToken, 10)) }
            });

            res
                .cookie("accessToken", accessToken, CookieOptions.accessCookieOptions)
                .cookie("refreshToken", refreshToken, CookieOptions.refreshCookieOptions)
                .redirect(`${env.FRONTEND_URL}/?auth_success=true`);
        } catch (error) {
            console.error("Social auth callback error:", error);
            res.redirect(`${env.FRONTEND_URL}/login?error=server_error`);
        }
    }
}

export default AuthController;