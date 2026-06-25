import logger from '../../core/logger/logger.js';
import Database from '../../core/config/db.js';
import eventBus from '../../core/events/eventBus.js';
import { EventTypes } from '../../core/events/eventTypes.js';

/**
 * Profile Module Event Listeners
 * Phase 3A: Implement profile updates via events (DUAL MODE)
 * 
 * Profile module listens to battle and submission events to update user stats
 * Keeps existing RankingService calls for now (dual mode)
 */

/**
 * Handle BattleFinished event - Update user ranks and stats
 * Triggered when a battle completes
 * 
 * Updates:
 * - Winner: +30 rank points, +1 win
 * - Loser: -20 rank points, +1 loss
 */
export async function handleBattleFinished(payload) {
    const { winnerId, loserId, battleId } = payload;
    
    // Allow draws (winnerId may be null) — still update loser stats
    if (!battleId) {
        logger.warn('[Profile Listener] ⚠️ BattleFinished event missing battleId');
        return;
    }
    
    try {
        logger.info('[Profile Listener] 📥 BattleFinished event received', {
            battleId,
            winnerId,
            loserId
        });

        // Update winner stats (only if there is a winner — not a draw)
        if (winnerId) {
            await Database.client.user.update({
                where: { id: winnerId },
                data: {
                    rankPoints: { increment: 30 },
                    wins: { increment: 1 }
                }
            });

            eventBus.emitEvent(EventTypes.USER_RANK_UPDATED, {
                userId: winnerId,
                rankPoints: 30,
                delta: 30,
                reason: 'Battle victory',
                battleId
            });
        }

        // Update loser stats (only if there is a loser — not a draw)
        if (loserId) {
            await Database.client.user.update({
                where: { id: loserId },
                data: {
                    rankPoints: { decrement: 20 },
                    losses: { increment: 1 }
                }
            });

            eventBus.emitEvent(EventTypes.USER_RANK_UPDATED, {
                userId: loserId,
                rankPoints: -20,
                delta: -20,
                reason: 'Battle loss',
                battleId
            });
        }

        // Handle draw — both players get a loss with smaller penalty
        if (!winnerId && !loserId) {
            logger.info('[Profile Listener] ℹ️ Draw detected — no rank change applied', { battleId });
        }

        logger.info('[Profile Listener] ✅ User ranks updated', {
            winner: winnerId ? { id: winnerId, delta: 30 } : 'none (draw)',
            loser: loserId ? { id: loserId, delta: -20 } : 'none (draw)'
        });
    } catch (error) {
        logger.error('[Profile Listener] ❌ Error handling BattleFinished event:', error);
    }
}

/**
 * Handle SubmissionCompleted event - Update practice stats
 * Triggered when a submission completes
 * 
 * Optional: Track practice submissions for stats
 */
export async function handleSubmissionCompleted(payload) {
    const { userId, status, type, context } = payload;
    
    if (!userId) {
        logger.warn('[Profile Listener] ⚠️ SubmissionCompleted event missing userId');
        return;
    }

    try {
        logger.info('[Profile Listener] 📥 SubmissionCompleted event received', {
            userId,
            status,
            type,
            battleId: context?.battleId
        });

        // Only track solo practice submissions (not in battle)
        if (!context?.battleId && type === 'SUBMIT' && status === 'PASSED') {
            // Optional: Update practice stats
            logger.info('[Profile Listener] ✅ Practice submission tracked', {
                userId,
                status
            });
        }
    } catch (error) {
        logger.error('[Profile Listener] ❌ Error handling SubmissionCompleted event:', error);
    }
}

/**
 * Handle UserAuthenticated event - Track login stats
 * Triggered when user logs in
 * 
 * Optional: Track login streaks, last login time
 */
export async function handleUserAuthenticated(payload) {
    const { userId } = payload;
    
    if (!userId) {
        logger.warn('[Profile Listener] ⚠️ UserAuthenticated event missing userId');
        return;
    }

    try {
        logger.info('[Profile Listener] 📥 UserAuthenticated event received', {
            userId
        });

        // NOTE: lastLogin is updated by RewardService.processDailyLogin to avoid
        // a duplicate write. We only log here for observability.
        logger.info('[Profile Listener] ✅ User login tracked', { userId });
    } catch (error) {
        logger.error('[Profile Listener] ❌ Error handling UserAuthenticated event:', error);
    }
}
