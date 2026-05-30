import express from "express";
import { getHealth, getDetailedHealth } from "./health.controller.js";

const router = express.Router();

/**
 * Health check routes
 */

// Basic health check (no DB/Redis checks - fast)
router.get("/", getHealth);

// Detailed health check (includes DB/Redis checks)
router.get("/detailed", getDetailedHealth);

export default router;
