// • Register user
// • Login user
// • Issue JWT

import AuthService from "./auth.service.js";
import CookieOptions from "../../utils/cookies.js";
import AuthSchema from "./auth.schema.js";
import Database from "../../core/config/db.js";
import S3Service from "../../integrations/s3/s3.service.js";
import JwtService from "../../utils/jwt.js";
import env from "../../core/config/env.js";
import passport from "passport";
// ✅ PHASE 1: Import event bus
import eventBus from "../../core/events/eventBus.js";
import { EventTypes } from "../../core/events/eventTypes.js";

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

            // ✅ PHASE 1: Emit event (DUAL MODE - keeping existing call)
            eventBus.emitEvent(EventTypes.USER_AUTHENTICATED, {
                userId: user.id,
                timestamp: new Date(),
                method: 'password'
            });

            // ✅ PHASE 4: Removed RewardService call - now handled by Reward listener
            // Daily login rewards are triggered by USER_AUTHENTICATED event
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
                    password: true,
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
                    cyberCores: true,
                    dailyLoginStreak: true,
                    achievements: {
                        select: {
                            id: true,
                            unlockedAt: true,
                            achievement: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true
                                }
                            }
                        }
                    },
                    badges: {
                        select: {
                            id: true,
                            unlockedAt: true,
                            badge: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    iconUrl: true
                                }
                            }
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const { password, ...userWithoutPassword } = user;
            res.json({ 
                user: { 
                    ...userWithoutPassword, 
                    hasPassword: !!password
                } 
            });
        } catch (error) {
            console.error("Get profile error:", error);
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
                    cyberCores: true,
                    dailyLoginStreak: true,
                    achievements: {
                        select: {
                            id: true,
                            unlockedAt: true,
                            achievement: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true
                                }
                            }
                        }
                    },
                    badges: {
                        select: {
                            id: true,
                            unlockedAt: true,
                            badge: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    iconUrl: true
                                }
                            }
                        }
                    }
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

            const { state } = req.query;
            let redirectTo = "/";
            if (state) {
                try {
                    const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
                    if (decoded.redirectTo) redirectTo = decoded.redirectTo;
                } catch (e) {
                    console.error("Failed to parse social auth state:", e);
                }
            }

            const baseUrl = env.FRONTEND_URL.endsWith('/') ? env.FRONTEND_URL.slice(0, -1) : env.FRONTEND_URL;
            const targetPath = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
            const finalUrl = `${baseUrl}${targetPath}${targetPath.includes('?') ? '&' : '?'}accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&auth_success=true`;

            res
                .cookie("accessToken", accessToken, CookieOptions.accessCookieOptions)
                .cookie("refreshToken", refreshToken, CookieOptions.refreshCookieOptions)
                .redirect(finalUrl);

            // ✅ PHASE 1: Emit event (DUAL MODE - keeping existing call)
            eventBus.emitEvent(EventTypes.USER_AUTHENTICATED, {
                userId: user.id,
                timestamp: new Date(),
                method: user.googleId ? 'google' : 'github'
            });

            // ✅ PHASE 4: Removed RewardService call - now handled by Reward listener
            // Daily login rewards are triggered by USER_AUTHENTICATED event
        } catch (error) {
            console.error("Social auth callback error:", error);
            res.redirect(`${env.FRONTEND_URL}/login?error=server_error`);
        }
    }

    static async changePassword(req, res) {
        const validationResult = AuthSchema.changePasswordSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ message: validationResult.error.errors[0].message });
        }

        const { oldPassword, newPassword } = validationResult.data;
        const userId = req.user.id;

        try {
            const user = await Database.client.user.findUnique({ where: { id: userId } });
            if (!user) return res.status(404).json({ message: "User not found" });

            // If user has no password (OAuth only), they can't "change" it normally
            if (!user.password) {
                return res.status(400).json({ message: "OAuth accounts must use their provider to log in or reset password via email to set one." });
            }

            const bcrypt = await import("bcrypt").then(b => b.default);
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid old password" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await Database.client.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            res.json({ message: "Password updated successfully" });
        } catch (error) {
            console.error("Change password error:", error);
            res.status(500).json({ message: "Failed to update password" });
        }
    }
}

export default AuthController;