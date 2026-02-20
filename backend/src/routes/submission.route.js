// POST /submit

// User sends code here.

import express from "express";
import SubmissionController from "../controllers/submission.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

class SubmissionRoutes {
	static createRouter() {
		const router = express.Router();

		router.post("/submit", AuthMiddleware.handle, SubmissionController.submitCode);
		router.get("/:id", AuthMiddleware.handle, SubmissionController.getSubmissionStatus);

		return router;
	}
}

export default SubmissionRoutes;
