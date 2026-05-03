// POST /register
// POST /login

import express from "express";
import AuthController from "./auth.controller.js";
import AuthMiddleware from "./auth.middleware.js";
import passport from "passport";
// import { authLimiter } from "../middlewares/rateLimit.middleware.js";

class AuthRoutes {
	static createRouter() {
		const router = express.Router();

		// 🔐 Auth routes (Protected against brute-force credential stuffing)
		router.post("/login", AuthController.login);
		router.post("/register", AuthController.Register);
		router.post("/logout", AuthMiddleware.handle, AuthController.logout);
		router.get("/profile", AuthMiddleware.handle, AuthController.getProfile);
		router.put("/profile", AuthMiddleware.handle, AuthController.updateProfile);
		router.post("/change-password", AuthMiddleware.handle, AuthController.changePassword);
		router.post("/refresh", AuthController.refreshToken);

		// 🖼️ Get presigned URL for profile picture upload
		router.get("/profile/upload-url", AuthMiddleware.handle, AuthController.getProfileUploadUrl);

		// 👤 Public profile route (no auth required)
		router.get("/user/:username", AuthController.getPublicProfile);

		// 🔑 Password Reset Routes
		router.post("/forgot-password", AuthController.forgotPassword);
		router.post("/reset-password/:token", AuthController.resetPassword);

		// 🌐 Social Login Routes
		router.get("/google", (req, res, next) => {
			const { redirectTo } = req.query;
			const state = redirectTo ? Buffer.from(JSON.stringify({ redirectTo })).toString('base64') : undefined;
			passport.authenticate("google", { scope: ["profile", "email"], state })(req, res, next);
		});
		router.get("/google/callback", passport.authenticate("google", { session: false }), AuthController.socialAuthCallback);

		router.get("/github", (req, res, next) => {
			const { redirectTo } = req.query;
			const state = redirectTo ? Buffer.from(JSON.stringify({ redirectTo })).toString('base64') : undefined;
			passport.authenticate("github", { scope: ["user:email"], state })(req, res, next);
		});
		router.get("/github/callback", passport.authenticate("github", { session: false }), AuthController.socialAuthCallback);

		return router;
	}
}

export default AuthRoutes;
