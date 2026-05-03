import express from "express";
import TeamBattleNewController from "./teamBattle.controller.js";
import AuthMiddleware from "./auth.middleware.js";

class TeamBattleRoutes {
	static createRouter() {
		const router = express.Router();

		// NEW JOIN-CODE FLOW ROUTES
		// POST /team-battle/create - Team1 leader creates battle
		router.post("/create", AuthMiddleware.handle, TeamBattleNewController.createTeamBattle);

		// GET /team-battle/available - Browse available battles for Team2
		router.get("/available", TeamBattleNewController.getAvailableBattles);

		// POST /team-battle/join - Team2 leader joins battle with code
		router.post("/join", AuthMiddleware.handle, TeamBattleNewController.joinTeamBattle);

		// GET /team-battle/details/:battleId - Get battle details by ID (for battle room)
		router.get("/details/:battleId", TeamBattleNewController.getTeamBattle);

		// ============================================
		// EXISTING TOURNAMENT-STYLE ROUTES (LEGACY)
		// ============================================

		// Public routes
		router.get("/active", TeamBattleNewController.getActiveTeamBattles);
		router.get("/:battleCode", TeamBattleNewController.getTeamBattle);

		// Protected routes
		router.post("/", AuthMiddleware.handle, TeamBattleNewController.createTeamBattle);
		router.post("/:battleCode/start", AuthMiddleware.handle, TeamBattleNewController.startTeamBattle);
		router.post("/:battleCode/:matchId/submit", AuthMiddleware.handle, TeamBattleNewController.submitMatchSolution);
		router.post("/:matchId/winner", AuthMiddleware.handle, TeamBattleNewController.determineMatchWinner);
		router.post("/:battleCode/complete", AuthMiddleware.handle, TeamBattleNewController.completeTeamBattle);
		router.get("/team/:teamId", AuthMiddleware.handle, TeamBattleNewController.getTeamBattles);

		return router;
	}
}

export default TeamBattleRoutes;

