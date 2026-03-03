// POST /submit

// User sends code here.

import express from "express";
import SubmissionController from "../controllers/submission.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validate.middleware.js";
import { submitCodeSchema } from "../validation/battle.schema.js";

class SubmissionRoutes {
	static createRouter() {
		const router = express.Router();

		router.post("/submit", AuthMiddleware.handle, validateRequest(submitCodeSchema), SubmissionController.submitCode);
		router.get("/:id", AuthMiddleware.handle, SubmissionController.getSubmissionStatus);

		return router;
	}
}

export default SubmissionRoutes;
