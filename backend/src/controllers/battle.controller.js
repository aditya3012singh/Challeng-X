// • Create match
// • Join match
// • Start match
// • Get status

import BattleService from "../services/battle.service.js";
import SubmissionService from "../services/submission.service.js";

class BattleController {
    static async createBattleRandomQuestionController(req, res) {
        const userId = req.user.id;
        try {
            const battle = await BattleService.createBattleRandomQuestionService(userId);
            // console.log("Created battle with random question:", battle);
            res.status(201).json(battle);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async createBattleWithSelectedQuestionController(req, res) {
        const userId = req.user.id;
        const { problemId } = req.body;
        try {
            const battle = await BattleService.createBattleWithSelectedQuestionService(userId, problemId);
            //  console.log("Created battle with selected question:", battle);
            res.status(201).json(battle);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async joinBattleController(req, res) {
        const userId = req.user.id;
        const { battleCode } = req.body;
        try {
            const battle = await BattleService.joinBattleService(battleCode, userId);
            res.status(200).json(battle);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getBattleController(req, res) {
        const { battleId } = req.params;
        try {
            const battle = await BattleService.getBattle(battleId);
            // Attach myUserId for frontend convenience
            const myUserId = req.user?.id;
            res.status(200).json({ ...battle, myUserId });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async submitBattleCodeController(req, res) {
        const userId = req.user.id;
        const { battleId } = req.params;
        const { code, language, type } = req.body; // type: "RUN" or "SUBMIT"

        try {
            const battle = await BattleService.getBattle(battleId);

            if (!battle) {
                return res.status(404).json({ message: "Battle not found" });
            }

            if (battle.status === "FINISHED") {
                return res.status(400).json({ message: "Battle has already ended" });
            }

            // Allow submission if battle is WAITING or ONGOING
            if (battle.status !== "ONGOING" && battle.status !== "WAITING") {
                return res.status(400).json({ message: "Battle not active" });
            }

            const submissionResult = await SubmissionService.processSubmission({
                userId,
                problemId: battle.problemId,
                code,
                language,
                battleId,
                type: type || "SUBMIT"
            });

            // Battle finish is handled asynchronously by the worker via socket event.
            // No synchronous finishBattleService call here.
            res.status(200).json(submissionResult);
        } catch (error) {
            console.error("Submit battle code error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async forfeitBattleController(req, res) {
        const userId = req.user.id;
        const { battleId } = req.params;

        try {
            const result = await BattleService.forfeitBattle(battleId, userId);
            if (!result) {
                return res.status(400).json({ message: "Battle could not be forfeited (might already be finished)" });
            }
            res.status(200).json({ message: "Battle forfeited successfully", battle: result });
        } catch (error) {
            console.error("Forfeit battle error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async battleHistory(req, res) {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        try {
            const history = await BattleService.getBattleHistory(
                req.user.id,
                page,
                limit
            );

            res.json(history);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BattleController;