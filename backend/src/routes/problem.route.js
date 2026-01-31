// POST /problem/create (admin)
// GET /problem/list
// GET /problem/:id

// manage dsa problems

import express from "express";
import * as problemController from "../controllers/problem.controller.js";

const router = express.Router();

router.post("/create", problemController.createProblem);
router.get("/list", problemController.getAllProblems);
router.get("/:id", problemController.getProblemById);


export default router;

