import SocketEmitter from "../../core/config/socket.js";
import BattleService from "../battle/battle.service.js";
import AIService from "./ai.service.js";
import Database from "../../core/config/db.js";
import RedisClient from "../../core/cache/redis.client.js";
import logger from "../../core/logger/logger.js";

/**
 * AISimulatorService - Simulates a human-like opponent (Ghost) in a battle.
 * The Ghost "writes code" and "submits" progress over time.
 */
class AISimulatorService {
    constructor() {
        this.activeSimulations = new Map(); // battleId -> intervals/timeouts
    }

    /**
     * Start a simulation for a battle
     * @param {string} battleId 
     * @param {string} ghostUserId 
     * @param {string} difficulty - EASY, MEDIUM, HARD
     */
    async startSimulation(battleId, ghostUserId, difficulty) {
        logger.info(`[AISimulator] Starting simulation for battle ${battleId} (Ghost: ${ghostUserId})`);

        // Simulation parameters based on difficulty
        const params = this.getSimulationParams(difficulty);
        
        // Track simulation state
        const state = {
            battleId,
            ghostUserId,
            totalTestCases: 10,
            passedTestCases: 0,
            isFinished: false,
            intervals: [],
            solution: "",
            currentTypedCode: "",
            language: "java" // Default
        };

        this.activeSimulations.set(battleId, state);

        // Fetch problem and generate solution asynchronously
        (async () => {
            try {
                const battle = await Database.client.battle.findUnique({
                    where: { id: battleId },
                    include: { problem: true }
                });

                if (battle?.problem) {
                    state.language = "java"; // In current system Ghost uses Java primarily, or we can detect from battle
                    state.totalTestCases = battle.problem.testcases?.length || 10;
                    
                    logger.info(`[AISimulator] Generating ghost solution for: ${battle.problem.title}`);
                    const solution = await AIService.generateSolution(battle.problem, state.language);
                    state.solution = solution;
                    
                    // Start Typing Simulation
                    this.startTypingSimulation(battleId, state);
                }
            } catch (err) {
                logger.error(`[AISimulator] Setup error: ${err.message}`);
            }
        })();

        // 1. Simulate Progress Updates (Incremental test case passing)
        const progressInterval = setInterval(() => {
            if (state.isFinished) return;

            // Random chance to pass a test case
            if (Math.random() < params.progressChance && state.passedTestCases < state.totalTestCases - 1) {
                state.passedTestCases++;
                
                if (!state.isFinished) {
                    SocketEmitter.emitToBattle(battleId, "submission_progress", {
                        userId: ghostUserId,
                        passed: state.passedTestCases,
                        total: state.totalTestCases
                    });
                }
                
                logger.info(`[AISimulator] Ghost ${ghostUserId} progress: ${state.passedTestCases}/${state.totalTestCases}`);
            }
        }, params.progressIntervalMs);

        state.intervals.push(progressInterval);

        // 2. Final Submission (Winning the match)
        const winTimeout = setTimeout(async () => {
            if (state.isFinished) return;

            logger.info(`[AISimulator] Ghost ${ghostUserId} attempting final submission for battle ${battleId}`);

            state.isFinished = true;
            state.passedTestCases = state.totalTestCases;

            // Update battle results via BattleService
            try {
                // Ensure the battle is still ongoing before finishing
                const result = await BattleService.finishBattleService(battleId, ghostUserId);
                if (result) {
                    SocketEmitter.emitToBattle(battleId, "submission_progress", {
                        userId: ghostUserId,
                        passed: state.totalTestCases,
                        total: state.totalTestCases
                    });
                    SocketEmitter.emitToBattle(battleId, "battle_end", {
                        winnerId: ghostUserId,
                        draw: false
                    });
                }
            } catch (err) {
                logger.error(`[AISimulator] Error finishing ghost battle: ${err.message}`);
            }

            this.stopSimulation(battleId);
        }, params.winTimeMs + (Math.random() * params.winTimeVarianceMs));

        state.intervals.push(winTimeout);
    }

    /**
     * Stop and cleanup simulation
     * @param {string} battleId 
     */
    stopSimulation(battleId) {
        const state = this.activeSimulations.get(battleId);
        if (state) {
            state.intervals.forEach(timer => {
                if (typeof timer === 'number' || typeof timer === 'object') {
                    clearInterval(timer);
                    clearTimeout(timer);
                }
            });
            state.isFinished = true;
            this.activeSimulations.delete(battleId);
            logger.info(`[AISimulator] Simulation stopped for battle ${battleId}`);
        }
    }

    /**
     * Periodically "types" out the code for spectators
     */
    startTypingSimulation(battleId, state) {
        if (!state.solution) return;

        const solutionFull = state.solution;
        const totalChars = solutionFull.length;
        let charIndex = 0;

        // Split into chunks to simulate typing speed
        const typingInterval = setInterval(async () => {
            if (state.isFinished) return;

            // Incrementally type a random number of characters (simulating bursts)
            const burst = Math.floor(Math.random() * 20) + 5;
            charIndex = Math.min(totalChars, charIndex + burst);
            state.currentTypedCode = solutionFull.substring(0, charIndex);

            const payload = {
                userId: state.ghostUserId,
                code: state.currentTypedCode,
                language: state.language
            };

            // 1. Update Redis so new spectators get the latest code
            try {
                const stateKey = `battle_code_state:${battleId}`;
                await RedisClient.client.hset(stateKey, state.ghostUserId, JSON.stringify({
                    code: state.currentTypedCode,
                    language: state.language
                }));
            } catch (err) {
                // Silently fail redis update if it's down
            }

            // 2. Emit to current spectators
            SocketEmitter.io?.to(`spectator_${battleId}`).emit("spectator_code_update", payload);

            // 3. Optional: Emit to the battle room too, if the player has a specialized view
            SocketEmitter.io?.to(battleId).emit("opponent_code_update", payload);

            // If finished typing, stop the interval
            if (charIndex >= totalChars) {
                clearInterval(typingInterval);
                logger.info(`[AISimulator] Ghost finished typing solution for ${battleId}`);
            }
        }, 3000);

        state.intervals.push(typingInterval);
    }

    /**
     * Define Ghost behavior based on problem difficulty
     */
    getSimulationParams(difficulty) {
        switch (difficulty) {
            case 'EASY':
                return {
                    progressIntervalMs: 15000, // Every 15s
                    progressChance: 0.6,
                    winTimeMs: 180000, // 3 minutes
                    winTimeVarianceMs: 60000 // +/- 1 minute
                };
            case 'HARD':
                return {
                    progressIntervalMs: 30000,
                    progressChance: 0.4,
                    winTimeMs: 900000, // 15 minutes
                    winTimeVarianceMs: 300000
                };
            case 'MEDIUM':
            default:
                return {
                    progressIntervalMs: 20000,
                    progressChance: 0.5,
                    winTimeMs: 480000, // 8 minutes
                    winTimeVarianceMs: 120000
                };
        }
    }
}

export default new AISimulatorService();
