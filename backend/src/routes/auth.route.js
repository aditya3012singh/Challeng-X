// POST /register
// POST /login

import express from "express";
import { login, Register, logout, getProfile, refreshToken } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();

// 🔐 Auth routes
router.post("/login", login);
router.post("/register", Register);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getProfile);
router.post("/refresh", refreshToken);

export default router;
