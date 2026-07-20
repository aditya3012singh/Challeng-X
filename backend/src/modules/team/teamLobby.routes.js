import { Router } from "express";
import TeamLobbyController from "./teamLobby.controller.js";
import AuthMiddleware from "./auth.middleware.js";

const router = Router();

// Apply auth middleware to all team lobby routes
router.use(AuthMiddleware.handle);

router.post("/create", TeamLobbyController.createLobby);
router.get("/:roomCode", TeamLobbyController.getLobby);
router.post("/join", TeamLobbyController.joinLobby);
router.post("/switch-team", TeamLobbyController.switchTeam);
router.post("/toggle-ready", TeamLobbyController.toggleReady);
router.post("/leave", TeamLobbyController.leaveLobby);
router.post("/start", TeamLobbyController.startBattle);

export default router;
