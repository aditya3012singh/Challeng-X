import express from "express";
import TestcaseController from "../controllers/testcase.controller.js";

const router = express.Router();

router.post("/add/:id", TestcaseController.addTestCases);

export default router;