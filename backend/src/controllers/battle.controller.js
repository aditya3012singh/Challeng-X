// • Create match
// • Join match
// • Start match
// • Get status

import * as battleService from "../services/battle.service.js";
import { processSubmission } from "../services/submission.service.js";

class BattleController {
    static async createBattleRandomQuestionController(req, res) {
    const  userId  = req.user.id;
    try {
        const battle = await battleService.createBattleRandomQuestionService(userId);
        // console.log("Created battle with random question:", battle);
        res.status(201).json(battle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

    static async createBattleWithSelectedQuestionController(req, res) {
    const  userId  = req.user.id;
    const { problemId } = req.body;
    try {
        const battle = await battleService.createBattleWithSelectedQuestionService(userId, problemId);
        //  console.log("Created battle with selected question:", battle);
        res.status(201).json(battle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

    static async joinBattleController(req, res) {
    const  userId  = req.user.id;
    const { battleCode } = req.body;
    try {
        const battle = await battleService.joinBattleService(battleCode, userId);
        res.status(200).json(battle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

    static async getBattleController(req, res) {
    const { battleId } = req.params;
    try {
        const battle = await battleService.getBattle(battleId);
        // console.log("Fetched battle details:", battle);
        res.status(200).json(battle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

    static async submitBattleCodeController(req, res) {
    const  userId  = req.user.id;
    const { battleId } = req.params;
    const { code, language } = req.body;

    try {
        const battle= await battleService.getBattle(battleId);

        if(!battle){
            return res.status(404).json({ message: "Battle not found" });
        }

        if(battle.status === "FINISHED"){
            return res.status(400).json({ message: "Battle has already ended" });
        }

        // Allow submission if battle is WAITING or ONGOING
        if(battle.status !== "ONGOING" && battle.status !== "WAITING"){
            return res.status(400).json({ message: "Battle not active" });
        }

        const submissionResult = await processSubmission({
            userId,
            problemId: battle.problemId,
            code,
            language,
            battleId
        });

        // Only finish battle if it's ONGOING (both players present)
        if(submissionResult.status === "PASSED" && battle.status === "ONGOING"){
            await battleService.finishBattleService(battleId, userId);
        }

        res.status(200).json(submissionResult);
    } catch (error) {
        console.error("Submit battle code error:", error);
        res.status(500).json({ message: error.message });
    }   
    }

    static async battleHistory(req, res) {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const history = await battleService.getBattleHistory(
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