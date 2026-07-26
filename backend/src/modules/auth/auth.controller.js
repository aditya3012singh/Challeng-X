// • Register user
// • Login user
// • Issue JWT

import AuthService from "./auth.service.js";
import CookieOptions from "../../utils/cookies.js";
import AuthSchema from "./auth.schema.js";
import Database from "../../core/config/db.js";
import DBWrapper from "../../core/config/db.wrapper.js";
import S3Service from "../../integrations/s3/s3.service.js";
import JwtService from "../../utils/jwt.js";
import env from "../../core/config/env.js";
import passport from "passport";
// ✅ PHASE 1: Import event bus and types
import eventBus from "../../core/events/eventBus.js";
import { EventTypes } from "../../core/events/eventTypes.js";
import RedisClient from "../../core/cache/redis.client.js";

class AuthController {
    static async login(req, res) {
        const { email, password } = req.validated.body;

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

        // ✅ Emit event
        eventBus.emitEvent(EventTypes.USER_AUTHENTICATED, {
            userId: user.id,
            timestamp: new Date(),
            method: 'password'
        });
    }

    static async Register(req, res) {
        const { email, username, password } = req.validated.body;

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
    }

    static async logout(req, res) {
        const userId = req.user?.id;

        if (userId) {
            await DBWrapper.execute("authLogoutClearToken", (db) =>
                db.user.update({
                    where: { id: userId },
                    data: { refreshTokenHash: null }
                })
            );
        }

        // Clear cookies
        res
            .clearCookie("accessToken", CookieOptions.accessCookieOptions)
            .clearCookie("refreshToken", CookieOptions.refreshCookieOptions)
            .json({ message: "Logout successful" });
    }

    static async getProfile(req, res) {
        const userId = req.user.id;
        const cacheKey = `user:full_profile:${userId}`;

        try {
            const cached = await RedisClient.client.get(cacheKey);
            if (cached) {
                return res.json(JSON.parse(cached));
            }
        } catch (err) {
            // Cache hit failure is handled silently
        }

        const user = await DBWrapper.execute("authGetProfileSelect", (db) =>
            db.user.findUnique({
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
            })
        );

        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        const { password, ...userWithoutPassword } = user;
        const responseData = { 
            user: { 
                ...userWithoutPassword, 
                hasPassword: !!password
            } 
        };

        try {
            await RedisClient.client.set(cacheKey, JSON.stringify(responseData), "EX", 3600); // 1 Hour TTL
        } catch (err) {
            // Cache write failure is handled silently
        }

        res.json(responseData);
    }

    static async refreshToken(req, res) {
        await AuthService.refreshTokenService(req, res);
    }

    static async getPublicProfile(req, res) {
        const { username } = req.params;

        const user = await DBWrapper.execute("authGetPublicProfileSelect", (db) =>
            db.user.findUnique({
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
            })
        );

        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
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
    }
    static async updateProfile(req, res) {
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

        const updatedUser = await DBWrapper.execute("authUpdateProfileFields", (db) =>
            db.user.update({
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
            })
        );

        await RedisClient.client.del(`user:full_profile:${userId}`).catch(() => {});

        res.json({ message: "Profile updated successfully", user: updatedUser });
    }

    static async getProfileUploadUrl(req, res) {
        const userId = req.user.id;
        const { fileName, fileType } = req.query;

        if (!fileName || !fileType) {
            const err = new Error("fileName and fileType are required");
            err.statusCode = 400;
            throw err;
        }

        const extension = fileName.split('.').pop();
        const key = `avatars/${userId}_${Date.now()}.${extension}`;

        const { uploadUrl, fileUrl } = await S3Service.getPresignedUrl(key, fileType);

        res.json({ uploadUrl, fileUrl });
    }
    static async forgotPassword(req, res) {
        const { email } = req.validated.body;
        const result = await AuthService.forgotPasswordService(email);
        res.json(result);
    }

    static async resetPassword(req, res) {
        // Support token either deeply nested in body or passed via path params
        const token = req.params.token || req.body.token;
        const newPassword = req.body.newPassword;

        const validationResult = AuthSchema.resetPasswordSchema.safeParse({ token, newPassword });
        if (!validationResult.success) {
            const err = new Error(validationResult.error.errors[0].message);
            err.statusCode = 400;
            throw err;
        }

        const result = await AuthService.resetPasswordService(token, newPassword);
        res.json(result);
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
            const bcrypt = await import("bcrypt").then(b => b.default);
            const hashedToken = await bcrypt.hash(refreshToken, 10);

            await DBWrapper.execute("authSocialSetRefreshToken", (db) =>
                db.user.update({
                    where: { id: user.id },
                    data: { refreshTokenHash: hashedToken }
                })
            );

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

            // ✅ Emit event
            eventBus.emitEvent(EventTypes.USER_AUTHENTICATED, {
                userId: user.id,
                timestamp: new Date(),
                method: user.googleId ? 'google' : 'github'
            });
        } catch (error) {
            console.error("Social auth callback error:", error);
            res.redirect(`${env.FRONTEND_URL}/login?error=server_error`);
        }
    }

    static async changePassword(req, res) {
        const { oldPassword, newPassword } = req.validated.body;
        const userId = req.user.id;

        const user = await DBWrapper.execute("authChangePasswordGetUser", (db) =>
            db.user.findUnique({ where: { id: userId } })
        );
        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        // If user has no password (OAuth only), they can't "change" it normally
        if (!user.password) {
            const err = new Error("OAuth accounts must use their provider to log in or reset password via email to set one.");
            err.statusCode = 400;
            throw err;
        }

        const bcrypt = await import("bcrypt").then(b => b.default);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            const err = new Error("Invalid old password");
            err.statusCode = 400;
            throw err;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await DBWrapper.execute("authChangePasswordUpdate", (db) =>
            db.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            })
        );

        res.json({ message: "Password updated successfully" });
    }
}

export default AuthController;