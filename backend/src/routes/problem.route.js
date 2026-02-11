// POST /problem/create (admin)
// GET /problem/list
// GET /problem/:id

// manage dsa problems

import express from "express";
import ProblemController from "../controllers/problem.controller.js";

const router = express.Router();

router.post("/create", ProblemController.createProblem);
router.get("/list", ProblemController.getAllProblems);
router.get("/:id", ProblemController.getProblemById);


export default router;

