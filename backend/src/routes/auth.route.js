// POST /register
// POST /login

import express from "express";
import AuthController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();

// 🔐 Auth routes
router.post("/login", AuthController.login);
router.post("/register", AuthController.Register);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/profile", authMiddleware, AuthController.getProfile);
router.post("/refresh", AuthController.refreshToken);

// 👤 Public profile route (no auth required)
router.get("/user/:userId", AuthController.getPublicProfile);

export default router;
