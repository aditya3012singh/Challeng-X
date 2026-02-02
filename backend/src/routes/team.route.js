// POST /team/create
// GET /team/:teamId
// POST /team/join
// POST /team/:teamId/leave
// POST /team/:teamId/disband
// GET /team/my-teams

import express from "express";
import * as teamController from "../controllers/team.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, teamController.createTeamController);
router.get("/:teamId", authMiddleware, teamController.getTeamController);
router.post("/join", authMiddleware, teamController.joinTeamController);
router.post("/:teamId/leave", authMiddleware, teamController.leaveTeamController);
router.post("/:teamId/disband", authMiddleware, teamController.disbandTeamController);
router.get("/my", authMiddleware, teamController.getUserTeamsController);

export default router;
