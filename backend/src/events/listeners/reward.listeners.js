import logger from '../../utils/logger.js';
import RewardService from '../../services/reward.service.js';

/**
 * Reward Module Event Listeners
 * Phase 4: Full implementation - Reward module is now fully event-driven
 * 
 * All reward granting is triggered by events, not direct service calls
 * This ensures loose coupling and single responsibility
 */

/**
 * Handle BattleFinished event - Grant battle rewards
 * Triggered when a battle completes
 * 
 * Grants:
 * - Winner: Base reward (50/100/200 cores based on difficulty)
 * - Loser: Participation reward (1/5 of base reward)
 */
export async function handleBattleFinished(payload) {
    const { battleId, winnerId } = payload;
    
    if (!battleId) {
        logger.warn('[Reward Listener] ⚠️ BattleFinished event missing battleId');
        return;
    }

    try {
        logger.info('[Reward Listener] 📥 BattleFinished event received', {
            battleId,
            winnerId
        });

        // Grant battle rewards
        await RewardService.grantBattleRewards(battleId);

        logger.info('[Reward Listener] ✅ Battle rewards granted', {
            battleId,
            winnerId
        });
    } catch (error) {
        logger.error('[Reward Listener] ❌ Error handling BattleFinished event:', error);
    }
}

/**
 * Handle UserAuthenticated event - Process daily login rewards
 * Triggered when user logs in
 * 
 * Grants:
 * - Daily login reward (10 * streak cores)
 * - Updates login streak
 * - Checks for streak-based achievements
 */
export async function handleUserAuthenticated(payload) {
    const { userId } = payload;
    
    if (!userId) {
        logger.warn('[Reward Listener] ⚠️ UserAuthenticated event missing userId');
        return;
    }

    try {
        logger.info('[Reward Listener] 📥 UserAuthenticated event received', {
            userId
        });

        // Process daily login rewards
        await RewardService.processDailyLogin(userId);

        logger.info('[Reward Listener] ✅ Daily login processed', {
            userId
        });
    } catch (error) {
        logger.error('[Reward Listener] ❌ Error handling UserAuthenticated event:', error);
    }
}

/**
 * Handle SubmissionCompleted event - Grant problem rewards
 * Triggered when a submission completes (solo practice)
 * 
 * Grants:
 * - Problem reward (30/60/120 cores based on difficulty)
 * - Hint penalty (8 cores per hint used)
 * - Checks for problem-solving achievements
 */
export async function handleSubmissionCompleted(payload) {
    const { userId, problemId, status, context } = payload;
    
    if (!userId || !problemId) {
        logger.warn('[Reward Listener] ⚠️ SubmissionCompleted event missing userId or problemId');
        return;
    }

    try {
        logger.info('[Reward Listener] 📥 SubmissionCompleted event received', {
            userId,
            problemId,
            status,
            battleId: context?.battleId
        });

        // Only grant rewards for solo practice submissions (not in battle)
        if (!context?.battleId && status === 'PASSED') {
            await RewardService.grantProblemRewards(userId, problemId);

            logger.info('[Reward Listener] ✅ Problem rewards granted', {
                userId,
                problemId
            });
        } else if (context?.battleId) {
            logger.info('[Reward Listener] ℹ️ Skipping problem rewards (battle submission)', {
                userId,
                problemId,
                battleId: context.battleId
            });
        }
    } catch (error) {
        logger.error('[Reward Listener] ❌ Error handling SubmissionCompleted event:', error);
    }
}
