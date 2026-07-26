import express from "express";
import AuthController from "./auth.controller.js";
import AuthMiddleware from "./auth.middleware.js";
import passport from "passport";
import asyncWrapper from "../../api/middleware/asyncWrapper.middleware.js";
import validateRequest from "../../api/middleware/validateRequest.middleware.js";
import AuthSchema from "./auth.schema.js";

class AuthRoutes {
	static createRouter() {
		const router = express.Router();

		// 🔐 Auth routes (Protected against brute-force credential stuffing)
		router.post("/login", validateRequest(AuthSchema.loginSchema), asyncWrapper(AuthController.login));
		router.post("/register", validateRequest(AuthSchema.registerSchema), asyncWrapper(AuthController.Register));
		router.post("/logout", AuthMiddleware.handle, asyncWrapper(AuthController.logout));
		router.get("/profile", AuthMiddleware.handle, asyncWrapper(AuthController.getProfile));
		router.put("/profile", AuthMiddleware.handle, asyncWrapper(AuthController.updateProfile));
		router.post("/change-password", AuthMiddleware.handle, validateRequest(AuthSchema.changePasswordSchema), asyncWrapper(AuthController.changePassword));
		router.post("/refresh", asyncWrapper(AuthController.refreshToken));

		// 🖼️ Get presigned URL for profile picture upload
		router.get("/profile/upload-url", AuthMiddleware.handle, asyncWrapper(AuthController.getProfileUploadUrl));

		// 👤 Public profile route (no auth required)
		router.get("/user/:username", asyncWrapper(AuthController.getPublicProfile));

		// 🔑 Password Reset Routes
		router.post("/forgot-password", validateRequest(AuthSchema.forgotPasswordSchema), asyncWrapper(AuthController.forgotPassword));
		router.post("/reset-password/:token", asyncWrapper(AuthController.resetPassword));

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
