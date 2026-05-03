import logger from '../../utils/logger.js';

/**
 * Reward Module Event Listeners
 * Phase 1: Placeholder implementations (logging only)
 */

/**
 * Handle BattleFinished event - Grant battle rewards
 * Phase 1: Log only, actual implementation in Phase 3
 */
export async function handleBattleFinished(payload) {
    logger.info('[Reward Listener] 📥 BattleFinished event received', {
        battleId: payload.battleId,
        winnerId: payload.winnerId,
        loserId: payload.loserId,
        difficulty: payload.difficulty
    });
    
    // TODO Phase 3: Move reward granting logic here from battle.service.js
}

/**
 * Handle SubmissionCompleted event - Grant problem rewards (solo practice only)
 * Phase 1: Log only, actual implementation in Phase 3
 */
export async function handleSubmissionCompleted(payload) {
    const { userId, problemId, status, context } = payload;
    
    // Only log solo practice submissions
    if (context?.battleId || context?.contestId || context?.squidGameId) return;
    if (status !== 'PASSED') return;
    
    logger.info('[Reward Listener] 📥 SubmissionCompleted event received for practice', {
        userId,
        problemId,
        status
    });
    
    // TODO Phase 3: Move problem reward logic here from worker.js
}

/**
 * Handle UserAuthenticated event - Process daily login
 * Phase 1: Log only, actual implementation in Phase 3
 */
export async function handleUserAuthenticated(payload) {
    logger.info('[Reward Listener] 📥 UserAuthenticated event received', {
        userId: payload.userId,
        method: payload.method
    });
    
    // TODO Phase 3: Move daily login logic here from auth.controller.js
}
