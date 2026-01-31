// POST /register
// POST /login

import express from "express";
import { login, Register } from "../controllers/auth.controller.js";


const router = express.Router();

// 🔐 Auth routes
router.post("/login", login);
router.post("/register", Register);

export default router;
