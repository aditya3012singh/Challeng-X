// POST /team/create
// GET /team/:teamId
// POST /team/join
// POST /team/:teamId/leave
// POST /team/:teamId/disband
// GET /team/my-teams

import express from "express";
import TeamController from "../controllers/team.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Define /my route BEFORE /:teamId to avoid matching 'my' as teamId parameter
router.get("/my", AuthMiddleware.handle, TeamController.getUserTeamsController);
router.post("/create", AuthMiddleware.handle, TeamController.createTeamController);
router.get("/:teamId", AuthMiddleware.handle, TeamController.getTeamController);
router.post("/join", AuthMiddleware.handle, TeamController.joinTeamController);
router.post("/:teamId/leave", AuthMiddleware.handle, TeamController.leaveTeamController);
router.post("/:teamId/disband", AuthMiddleware.handle, TeamController.disbandTeamController);

export default router;
