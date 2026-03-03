// POST /register
// POST /login

import express from "express";
import AuthController from "../controllers/auth.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

class AuthRoutes {
	static createRouter() {
		const router = express.Router();

		// 🔐 Auth routes (Protected against brute-force credential stuffing)
		router.post("/login", authLimiter, AuthController.login);
		router.post("/register", authLimiter, AuthController.Register);
		router.post("/logout", AuthMiddleware.handle, AuthController.logout);
		router.get("/profile", AuthMiddleware.handle, AuthController.getProfile);
		router.post("/refresh", AuthController.refreshToken);

		// 👤 Public profile route (no auth required)
		router.get("/user/:userId", AuthController.getPublicProfile);

		return router;
	}
}

export default AuthRoutes;
