// GET /leaderboard

// Shows rankings.

import express from "express";
import { fetchLeaderboard } from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/", fetchLeaderboard);

export default router;
