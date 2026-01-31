import express from "express";
import * as testcaseController from "../controllers/testcase.controller.js";

const router = express.Router();

router.post("/add/:id", testcaseController.addTestCases);

export default router;