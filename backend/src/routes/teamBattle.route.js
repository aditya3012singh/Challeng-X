import express from "express";
import TeamBattleNewController from "../controllers/teamBattleNew.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// NEW JOIN-CODE FLOW ROUTES
// POST /team-battle/create - Team1 leader creates battle
router.post("/create", authMiddleware, TeamBattleNewController.createTeamBattle);

// GET /team-battle/available - Browse available battles for Team2
router.get("/available", TeamBattleNewController.getAvailableBattles);

// POST /team-battle/join - Team2 leader joins battle with code
router.post("/join", authMiddleware, TeamBattleNewController.joinTeamBattle);

// GET /team-battle/details/:battleId - Get battle details by ID (for battle room)
router.get("/details/:battleId", TeamBattleNewController.getTeamBattle);

// ============================================
// EXISTING TOURNAMENT-STYLE ROUTES (LEGACY)
// ============================================

// Public routes
router.get("/active", TeamBattleNewController.getActiveTeamBattles);
router.get("/:battleCode", TeamBattleNewController.getTeamBattle);

// Protected routes
router.post("/", authMiddleware, TeamBattleNewController.createTeamBattle);
router.post("/:battleCode/start", authMiddleware, TeamBattleNewController.startTeamBattle);
router.post("/:battleCode/:matchId/submit", authMiddleware, TeamBattleNewController.submitMatchSolution);
router.post("/:matchId/winner", authMiddleware, TeamBattleNewController.determineMatchWinner);
router.post("/:battleCode/complete", authMiddleware, TeamBattleNewController.completeTeamBattle);
router.get("/team/:teamId", authMiddleware, TeamBattleNewController.getTeamBattles);

export default router;

