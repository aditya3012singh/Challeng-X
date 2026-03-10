// • Register user
// • Login user
// • Issue JWT

import AuthService from "../services/auth.service.js";
import CookieOptions from "../utils/cookies.js";
import AuthSchema from "../validation/auth.schema.js";
import Database from "../config/db.js";
import S3Service from "../services/s3.service.js";

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
}

export default AuthController;