import express from "express";
import TestcaseController from "../controllers/testcase.controller.js";

class TestcaseRoutes {
	static createRouter() {
		const router = express.Router();

		router.post("/add/:id", TestcaseController.addTestCases);

		return router;
	}
}

export default TestcaseRoutes;