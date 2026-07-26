import express from "express";
import ProblemController from "./problem.controller.js";
import AuthMiddleware from "./auth.middleware.js";
import asyncWrapper from "../../api/middleware/asyncWrapper.middleware.js";
import validateRequest from "../../api/middleware/validateRequest.middleware.js";
import ProblemSchema from "./problem.schema.js";

class ProblemRoutes {
	static createRouter() {
		const router = express.Router();

		router.post("/create", AuthMiddleware.handle, validateRequest(ProblemSchema.createProblemSchema), asyncWrapper(ProblemController.createProblem));
		router.get("/list", asyncWrapper(ProblemController.getAllProblems));
		router.get("/:id", AuthMiddleware.handle, asyncWrapper(ProblemController.getProblemById));
		
		// New Gamified Features
		router.post("/:id/hints/unlock", AuthMiddleware.handle, validateRequest(ProblemSchema.unlockHintSchema), asyncWrapper(ProblemController.unlockHint));
		router.post("/:id/mentor", AuthMiddleware.handle, validateRequest(ProblemSchema.personalizedAIHintSchema), asyncWrapper(ProblemController.getPersonalizedAIHint));

		return router;
	}
}

export default ProblemRoutes;
