// POST /submit

// User sends code here.

import express from "express";
import SubmissionController from "../controllers/submission.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, SubmissionController.submitCode);

export default router;
