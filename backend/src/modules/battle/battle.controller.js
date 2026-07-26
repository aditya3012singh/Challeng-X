// • Create match
// • Join match
// • Start match
// • Get status

import BattleService from "./battle.service.js";
import SubmissionOrchestrator from "../submission/submission.orchestrator.js";

class BattleController {
    static async createBattleRandomQuestionController(req, res) {
        const userId = req.user.id;
        const battle = await BattleService.createBattleRandomQuestionService(userId);
        res.status(201).json(battle);
    }

    static async createBattleWithSelectedQuestionController(req, res) {
        const userId = req.user.id;
        const { problemId } = req.validated.body;
        const battle = await BattleService.createBattleWithSelectedQuestionService(userId, problemId);
        res.status(201).json(battle);
    }

    static async joinBattleController(req, res) {
        const userId = req.user.id;
        const { battleCode } = req.validated.body;
        const battle = await BattleService.joinBattleService(battleCode, userId);
        res.status(200).json(battle);
    }

    static async getBattleController(req, res) {
        const { battleId } = req.params;
        const userId = req.user?.id;
        const battle = await BattleService.getBattle(battleId, userId);
        res.status(200).json({ ...battle, myUserId: userId });
    }

    static async getLiveBattlesController(req, res) {
        const liveBattles = await BattleService.getLiveBattlesService();
        res.status(200).json(liveBattles);
    }

    static async submitBattleCodeController(req, res) {
        const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";
        const userId = req.user?.id || GUEST_USER_ID;
        const { battleId } = req.params;
        const { code, language, type } = req.validated.body; // type: "RUN" or "SUBMIT"

        // Auth guard for submission
        if (!req.user && type === "SUBMIT") {
            const err = new Error("Authentication required for final submission");
            err.statusCode = 401;
            throw err;
        }

        const battle = await BattleService.getBattle(battleId, userId);

        if (!battle) {
            const err = new Error("Battle not found");
            err.statusCode = 404;
            throw err;
        }

        if (battle.status === "FINISHED") {
            const err = new Error("Battle has already ended");
            err.statusCode = 400;
            throw err;
        }

        // Allow submission if battle is WAITING or ONGOING
        if (battle.status !== "ONGOING" && battle.status !== "WAITING") {
            const err = new Error("Battle not active");
            err.statusCode = 400;
            throw err;
        }

        const submissionResult = await SubmissionOrchestrator.processSubmission({
            userId,
            problemId: battle.problemId,
            code,
            language,
            battleId,
            squidGameId: null,
            type: type || "SUBMIT"
        });

        res.status(200).json(submissionResult);
    }

    static async forfeitBattleController(req, res) {
        const userId = req.user.id;
        const { battleId } = req.params;

        const result = await BattleService.forfeitBattle(battleId, userId);
        if (!result) {
            const err = new Error("Battle could not be forfeited (might already be finished)");
            err.statusCode = 400;
            throw err;
        }
        res.status(200).json({ message: "Battle forfeited successfully", battle: result });
    }

    static async battleHistory(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const history = await BattleService.getBattleHistory(
            req.user.id,
            page,
            limit
        );

        res.json(history);
    }
}

export default BattleController;