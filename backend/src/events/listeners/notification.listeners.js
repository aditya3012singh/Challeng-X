import logger from '../../utils/logger.js';
import NotificationService from '../../services/notification.service.js';

/**
 * Notification Module Event Listeners
 * Phase 2: Full implementation - Notification module is now fully event-driven
 * 
 * All notifications are triggered by events, not direct service calls
 * This ensures loose coupling and single responsibility
 */

/**
 * Handle RewardGranted event - Send reward notification
 * Triggered when user earns rewards (battle, problem, daily login, etc.)
 */
export async function handleRewardGranted(payload) {
    try {
        logger.info('[Notification Listener] 📥 RewardGranted event received', {
            userId: payload.userId,
            rewardType: payload.rewardType,
            amount: payload.amount
        });

        // Build notification message based on reward type
        let title = 'Cyber-Cores Earned!';
        let message = `You earned ${payload.amount} Cyber-Cores`;

        if (payload.rewardType === 'BATTLE') {
            message = `You earned ${payload.amount} Cyber-Cores for winning the battle!`;
        } else if (payload.rewardType === 'PROBLEM') {
            const hintsUsed = payload.metadata?.hintsUsed || 0;
            if (hintsUsed === 0) {
                message = `Perfect solve! You earned ${payload.amount} Cyber-Cores.`;
            } else {
                message = `Problem solved! You earned ${payload.amount} Cyber-Cores (${hintsUsed} hints used).`;
            }
        } else if (payload.rewardType === 'DAILY') {
            title = 'Daily Login Reward!';
            const streak = payload.metadata?.streak || 1;
            message = `Welcome back! You earned ${payload.amount} Cyber-Cores. Streak: ${streak} days.`;
        }

        // Send notification
        await NotificationService.sendNotification(payload.userId, {
            type: 'REWARD',
            title,
            message,
            metadata: {
                rewardType: payload.rewardType,
                amount: payload.amount,
                ...payload.metadata
            }
        });

        logger.info(`[Notification Listener] ✅ Reward notification sent to user ${payload.userId}`);
    } catch (error) {
        logger.error('[Notification Listener] ❌ Error handling RewardGranted event:', error);
    }
}

/**
 * Handle AchievementUnlocked event - Send achievement notification
 * Triggered when user unlocks a new achievement
 */
export async function handleAchievementUnlocked(payload) {
    try {
        logger.info('[Notification Listener] 📥 AchievementUnlocked event received', {
            userId: payload.userId,
            achievementName: payload.achievementName
        });

        await NotificationService.sendNotification(payload.userId, {
            type: 'ACHIEVEMENT',
            title: 'Achievement Unlocked!',
            message: `Congratulations! You unlocked: ${payload.achievementName}`,
            metadata: {
                achievementId: payload.achievementId,
                rewardType: payload.rewardType,
                rewardValue: payload.rewardValue
            }
        });

        logger.info(`[Notification Listener] ✅ Achievement notification sent to user ${payload.userId}`);
    } catch (error) {
        logger.error('[Notification Listener] ❌ Error handling AchievementUnlocked event:', error);
    }
}

/**
 * Handle BattleFinished event - Send battle result notifications
 * Triggered when a battle completes
 */
export async function handleBattleFinished(payload) {
    try {
        logger.info('[Notification Listener] 📥 BattleFinished event received', {
            battleId: payload.battleId,
            winnerId: payload.winnerId,
            loserId: payload.loserId
        });

        // Notify winner
        if (payload.winnerId) {
            await NotificationService.sendNotification(payload.winnerId, {
                type: 'BATTLE_RESULT',
                title: '🏆 Victory!',
                message: 'You won the battle! Check your rewards.',
                metadata: {
                    battleId: payload.battleId,
                    result: 'WIN'
                }
            });
            logger.info(`[Notification Listener] ✅ Victory notification sent to winner ${payload.winnerId}`);
        }

        // Notify loser
        if (payload.loserId) {
            await NotificationService.sendNotification(payload.loserId, {
                type: 'BATTLE_RESULT',
                title: 'Battle Ended',
                message: 'Better luck next time! Keep practicing.',
                metadata: {
                    battleId: payload.battleId,
                    result: 'LOSS'
                }
            });
            logger.info(`[Notification Listener] ✅ Defeat notification sent to loser ${payload.loserId}`);
        }
    } catch (error) {
        logger.error('[Notification Listener] ❌ Error handling BattleFinished event:', error);
    }
}

/**
 * Handle FriendRequestSent event - Send friend request notification
 * Triggered when user sends a friend request
 */
export async function handleFriendRequestSent(payload) {
    try {
        logger.info('[Notification Listener] 📥 FriendRequestSent event received', {
            senderId: payload.senderId,
            receiverId: payload.receiverId,
            senderUsername: payload.senderUsername
        });

        await NotificationService.createNotification(payload.receiverId, {
            type: 'FRIEND_REQUEST',
            title: 'New Friend Request',
            message: `${payload.senderUsername || 'Someone'} sent you a friend request.`,
            link: `/profile/${payload.senderUsername}`
        });

        logger.info(`[Notification Listener] ✅ Friend request notification sent to ${payload.receiverId}`);
    } catch (error) {
        logger.error('[Notification Listener] ❌ Error handling FriendRequestSent event:', error);
    }
}

/**
 * Handle FriendRequestAccepted event - Send friend request accepted notification
 * Triggered when user accepts a friend request
 */
export async function handleFriendRequestAccepted(payload) {
    try {
        logger.info('[Notification Listener] 📥 FriendRequestAccepted event received', {
            senderId: payload.senderId,
            receiverId: payload.receiverId,
            receiverUsername: payload.receiverUsername
        });

        await NotificationService.createNotification(payload.senderId, {
            type: 'FRIEND_REQUEST',
            title: 'Friend Request Accepted',
            message: `${payload.receiverUsername || 'Someone'} accepted your friend request.`,
            link: `/profile/${payload.receiverUsername}`
        });

        logger.info(`[Notification Listener] ✅ Friend request accepted notification sent to ${payload.senderId}`);
    } catch (error) {
        logger.error('[Notification Listener] ❌ Error handling FriendRequestAccepted event:', error);
    }
}

/**
 * Handle MatchInvitationSent event - Send match invitation notification
 * Triggered when user invites friend to a lobby/match
 */
export async function handleMatchInvitationSent(payload) {
    try {
        logger.info('[Notification Listener] 📥 MatchInvitationSent event received', {
            inviterId: payload.inviterId,
            inviteeId: payload.inviteeId,
            inviterUsername: payload.inviterUsername
        });

        await NotificationService.createNotification(payload.inviteeId, {
            type: 'MATCH_INVITE',
            title: 'Match Invitation',
            message: `${payload.inviterUsername || 'Someone'} invited you to join a lobby.`,
            link: `/battles`
        });

        logger.info(`[Notification Listener] ✅ Match invitation notification sent to ${payload.inviteeId}`);
    } catch (error) {
        logger.error('[Notification Listener] ❌ Error handling MatchInvitationSent event:', error);
    }
}
