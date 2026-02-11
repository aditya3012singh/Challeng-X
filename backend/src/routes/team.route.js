// POST /team/create
// GET /team/:teamId
// POST /team/join
// POST /team/:teamId/leave
// POST /team/:teamId/disband
// GET /team/my-teams

import express from "express";
import TeamController from "../controllers/team.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Define /my route BEFORE /:teamId to avoid matching 'my' as teamId parameter
router.get("/my", authMiddleware, TeamController.getUserTeamsController);
router.post("/create", authMiddleware, TeamController.createTeamController);
router.get("/:teamId", authMiddleware, TeamController.getTeamController);
router.post("/join", authMiddleware, TeamController.joinTeamController);
router.post("/:teamId/leave", authMiddleware, TeamController.leaveTeamController);
router.post("/:teamId/disband", authMiddleware, TeamController.disbandTeamController);

export default router;
