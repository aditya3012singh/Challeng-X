// • Add problem
// • Fetch problems
// • Fetch details

import * as problemService from "../services/problem.service.js";
import * as testcaseService from "../services/testcase.service.js";
import { createProblemSchema } from "../validation/createProblem.schema.js";

export const createProblem = async (req, res) => {
    const validation= createProblemSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
    }
    try {
        const problem=await problemService.createProblemService(validation.data);
        return  res.status(201).json({ message: "Problem created successfully", problem : problem });
    } catch (error) {
        console.error("Error creating problem:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllProblems = async (req, res) => {
    try {
        const problems = await problemService.getAllProblemsService();
        return res.status(200).json({message: "Problems fetched successfully", problems : problems });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getProblemById= async (req, res) => {
    const { id: problemId } = req.params;
    try {
        const problem = await problemService.getProblemByIdService(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        return res.status(200).json({ message: "Problem fetched successfully", problem : problem });
    } catch (error) {
        console.error("Error fetching problem:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}