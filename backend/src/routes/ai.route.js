import { Router } from "express";
import AIController from "../controllers/ai.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// Routes for AI features
router.post("/hint", AIController.getHint);
router.post("/review", AIController.getReview);
router.post("/spawn-ghost", AIController.spawnGhost);
router.post("/generate", AuthMiddleware.handle, AuthMiddleware.adminOnly, AIController.generateAIProblem);

export default {
    createRouter: () => router
};
