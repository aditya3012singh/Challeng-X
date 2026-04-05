import express from "express";
import ContestController from "../controllers/contest.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

class ContestRoutes {
  static createRouter() {
    const router = express.Router();

    // Public / Standard User Routes
    router.get("/list", ContestController.getAllContests);
    router.get("/:id", ContestController.getContestById);
    router.post("/:id/register", AuthMiddleware.handle, ContestController.registerForContest);
    router.get("/:id/problems", AuthMiddleware.handle, ContestController.getContestProblems);
    router.get("/:id/leaderboard", ContestController.getContestLeaderboard);
    router.post("/:id/tab-switch", AuthMiddleware.handle, ContestController.recordTabSwitch);

    // Admin Only Routes
    router.post("/create", AuthMiddleware.handle, ContestController.createContest);
    router.get("/:id/participants", AuthMiddleware.handle, ContestController.getContestParticipants);
    router.post("/:id/disqualify/:userId", AuthMiddleware.handle, ContestController.disqualifyParticipant);

    return router;
  }
}

export default ContestRoutes;
