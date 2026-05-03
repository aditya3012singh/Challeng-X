// POST /submit

// User sends code here.

import express from "express";
import SubmissionController from "./submission.controller.js";
import AuthMiddleware from "./auth.middleware.js";
import validateRequest from "../../api/middleware/validate.middleware.js";
import { submitCodeSchema } from "../battle/battle.schema.js";

class SubmissionRoutes {
	static createRouter() {
		const router = express.Router();

		router.post("/submit", AuthMiddleware.handle, validateRequest(submitCodeSchema), SubmissionController.submitCode);
		router.get("/:id", AuthMiddleware.handle, SubmissionController.getSubmissionStatus);

		return router;
	}
}

export default SubmissionRoutes;
