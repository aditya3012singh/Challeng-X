import logger from '../../core/logger/logger.js';

/**
 * Battle Module Event Listeners
 * Phase 1: Placeholder implementations (logging only)
 */

/**
 * Handle MatchFound event - Create battle
 * Phase 1: Log only, actual implementation in Phase 4
 */
export async function handleMatchFound(payload) {
    logger.info('[Battle Listener] 📥 MatchFound event received', {
        player1: payload.player1?.userId,
        player2: payload.player2?.userId,
        difficulty: payload.difficulty
    });
    
    // TODO Phase 4: Move battle creation logic here from matchmaking.service.js
}

/**
 * Handle SubmissionCompleted event - Check if battle should finish
 * Phase 1: Log only, actual implementation in Phase 5
 */
export async function handleSubmissionCompleted(payload) {
    const { userId, status, context } = payload;
    
    // Only log battle submissions
    if (!context?.battleId) return;
    
    logger.info('[Battle Listener] 📥 SubmissionCompleted event received for battle', {
        battleId: context.battleId,
        userId,
        status
    });
    
    // TODO Phase 5: Move battle finish logic here from worker.js
}

/**
 * Validate submission attempt - Check attempt limits
 * Phase 1: Log only, actual implementation in Phase 6
 */
export async function validateSubmissionAttempt(event) {
    const { battleId, userId, type } = event.payload;
    
    logger.info('[Battle Listener] 📥 SubmissionAttempted validation requested', {
        battleId,
        userId,
        type
    });
    
    // TODO Phase 6: Move validation logic here from submission.service.js
    // For now, allow all submissions
    return { allowed: true };
}
