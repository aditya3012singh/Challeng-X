import eventBus from '../eventBus.js';
import { EventTypes } from '../eventTypes.js';
import logger from '../../logger/logger.js';

// Import module listeners
import * as BattleListeners from '../../../modules/battle/battle.listeners.js';
import * as RewardListeners from '../../../modules/reward/reward.listeners.js';
import * as NotificationListeners from '../../../modules/notification/notification.listeners.js';
import * as ProfileListeners from '../../../modules/social/social.listeners.js';
import * as SocketListeners from '../../../integrations/socket/socket.listeners.js';

/**
 * Register all event listeners
 * Call this once during application startup
 */
export function registerAllListeners() {
    logger.info('[EventBus] 🚀 Registering all event listeners...');

    try {
        // Battle Module Listeners
        eventBus.onEvent(EventTypes.MATCH_FOUND, BattleListeners.handleMatchFound);
        eventBus.onEvent(EventTypes.SUBMISSION_COMPLETED, BattleListeners.handleSubmissionCompleted);
        eventBus.on(EventTypes.SUBMISSION_ATTEMPTED, BattleListeners.validateSubmissionAttempt);

        // Reward Module Listeners
        eventBus.onEvent(EventTypes.BATTLE_FINISHED, RewardListeners.handleBattleFinished);
        eventBus.onEvent(EventTypes.SUBMISSION_COMPLETED, RewardListeners.handleSubmissionCompleted);
        eventBus.onEvent(EventTypes.USER_AUTHENTICATED, RewardListeners.handleUserAuthenticated);

        // Notification Module Listeners
        eventBus.onEvent(EventTypes.REWARD_GRANTED, NotificationListeners.handleRewardGranted);
        eventBus.onEvent(EventTypes.ACHIEVEMENT_UNLOCKED, NotificationListeners.handleAchievementUnlocked);
        eventBus.onEvent(EventTypes.BATTLE_FINISHED, NotificationListeners.handleBattleFinished);
        eventBus.onEvent('FriendRequestSent', NotificationListeners.handleFriendRequestSent);
        eventBus.onEvent('FriendRequestAccepted', NotificationListeners.handleFriendRequestAccepted);
        eventBus.onEvent('MatchInvitationSent', NotificationListeners.handleMatchInvitationSent);

        // Profile Module Listeners
        eventBus.onEvent(EventTypes.BATTLE_FINISHED, ProfileListeners.handleBattleFinished);

        // Socket Module Listeners (for real-time updates)
        eventBus.onEvent(EventTypes.BATTLE_STATE_CHANGED, SocketListeners.handleBattleStateChanged);
        eventBus.onEvent(EventTypes.BATTLE_ATTEMPT_UPDATED, SocketListeners.handleBattleAttemptUpdated);
        eventBus.onEvent(EventTypes.SUBMISSION_COMPLETED, SocketListeners.handleSubmissionCompleted);
        eventBus.onEvent(EventTypes.BATTLE_CREATED, SocketListeners.handleBattleCreated);
        eventBus.onEvent(EventTypes.BATTLE_FINISHED, SocketListeners.handleBattleFinished);
        
        // Battle Socket Events (decoupled from BattleService)
        eventBus.onEvent(EventTypes.BATTLE_SOCKET_JOINED, SocketListeners.handleBattleSocketJoined);
        eventBus.onEvent(EventTypes.BATTLE_SOCKET_COUNTDOWN, SocketListeners.handleBattleSocketCountdown);
        eventBus.onEvent(EventTypes.BATTLE_SOCKET_STARTED, SocketListeners.handleBattleSocketStarted);
        eventBus.onEvent(EventTypes.BATTLE_SOCKET_TIMEOUT, SocketListeners.handleBattleSocketTimeout);
        eventBus.onEvent(EventTypes.BATTLE_SOCKET_END, SocketListeners.handleBattleSocketEnd);
        eventBus.onEvent(EventTypes.BATTLE_SOCKET_ATTEMPTS_UPDATED, SocketListeners.handleBattleSocketAttemptsUpdated);
        eventBus.onEvent(EventTypes.BATTLE_SOCKET_COMMENTARY, SocketListeners.handleBattleSocketCommentary);

        logger.info('[EventBus] ✅ All event listeners registered successfully');
        logger.info('[EventBus] 📊 Total listeners registered:', eventBus.listenerCount());
    } catch (error) {
        logger.error('[EventBus] ❌ Failed to register event listeners:', error);
        throw error;
    }
}
