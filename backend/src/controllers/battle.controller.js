// • Create match
// • Join match
// • Start match
// • Get status

import * as battleService from "../services/battle.service.js";
import { processSubmission } from "../services/submission.service.js";

export async function createBattleRandomQuestionController(req, res) {
    const  userId  = req.user.id;
    try {
        const battle = await battleService.createBattleRandomQuestionService(userId);
        // console.log("Created battle with random question:", battle);
        res.status(201).json(battle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createBattleWithSelectedQuestionController(req, res) {
    const  userId  = req.user.id;
    const { problemId } = req.body;
    try {
        const battle = await battleService.createBattleWithSelectedQuestionService(userId, problemId);
        console.log("Created battle with selected question:", battle);
        res.status(201).json(battle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function joinBattleController(req, res) {
    const  userId  = req.user.id;
    const { battleId } = req.params;
    try {
        const battle = await battleService.joinBattleService(battleId, userId);
        res.status(200).json(battle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getBattleController(req, res) {
    const { battleId } = req.params;
    try {
        const battle = await battleService.getBattle(battleId);
        console.log("Fetched battle details:", battle);
        res.status(200).json(battle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function submitBattleCodeController(req, res) {
    const  userId  = req.user.id;
    const { battleId } = req.params;
    const { code, language } = req.body;

    try {
        const battle= await battleService.getBattle(battleId);

        if(battle.status !== "ONGOING"){
            return res.status(404).json({ message: "Battle not active" });
        }
        const submissionResult = await processSubmission({
            userId,
            problemId: battle.problemId,
            code,
            language
        });
        if(submissionResult.status === "PASSED"){
            await battleService.finishBattleService(battleId, userId);
        }
        res.status(200).json(submissionResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
}

export async function battleHistory(req, res) {

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