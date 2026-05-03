// POST /problem/create (admin)
// GET /problem/list
// GET /problem/:id

// manage dsa problems

import express from "express";
import ProblemController from "./problem.controller.js";
import AuthMiddleware from "./auth.middleware.js";

class ProblemRoutes {
	static createRouter() {
		const router = express.Router();

		router.post("/create", AuthMiddleware.handle, ProblemController.createProblem);
		router.get("/list", ProblemController.getAllProblems);
		router.get("/:id", AuthMiddleware.handle, ProblemController.getProblemById);
		
		// New Gamified Features
		router.post("/:id/hints/unlock", AuthMiddleware.handle, ProblemController.unlockHint);
		router.post("/:id/mentor", AuthMiddleware.handle, ProblemController.getPersonalizedAIHint);

		return router;
	}
}

export default ProblemRoutes;

