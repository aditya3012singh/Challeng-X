import express from "express";
import AuthMiddleware from "./auth.middleware.js";

const router = express.Router();

/**
 * Helper to dynamically load controller to break circular deps
 */
const handleGetProfileAnalytics = async (req, res) => {
    try {
        const { default: AnalyticsController } = await import("../controllers/analytics.controller.js");
        return AnalyticsController.getProfileAnalytics(req, res);
    } catch (error) {
        console.error("Analytics Route Error:", error);
        res.status(500).json({ message: "Failed to load analytics" });
    }
};

// Both routes protected by AuthMiddleware
// Note: In Express 5, optional parameters syntax has changed compared to 4.x. 
// Using separate routes for clarity and compatibility.

// 1. Get current authenticated user's analytics
router.get("/", AuthMiddleware.handle, handleGetProfileAnalytics);

// 2. Get specific user's analytics by username
router.get("/:username", AuthMiddleware.handle, handleGetProfileAnalytics);

// 3. Global Stats (Public)
router.get("/global/stats", async (req, res) => {
    try {
        const { default: AnalyticsController } = await import("../controllers/analytics.controller.js");
        return AnalyticsController.getGlobalStats(req, res);
    } catch (error) {
        console.error("Global Stats Route Error:", error);
        res.status(500).json({ message: "Failed to load global stats" });
    }
});

export default router;
