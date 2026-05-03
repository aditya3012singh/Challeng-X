/**
 * Central registry of all domain events
 * This serves as documentation and prevents typos
 */

export const EventTypes = {
    // Auth Module Events
    USER_AUTHENTICATED: 'UserAuthenticated',
    USER_REGISTERED: 'UserRegistered',
    
    // Matchmaking Module Events
    MATCH_FOUND: 'MatchFound',
    PLAYER_JOINED_QUEUE: 'PlayerJoinedQueue',
    PLAYER_LEFT_QUEUE: 'PlayerLeftQueue',
    
    // Battle Module Events
    BATTLE_CREATED: 'BattleCreated',
    BATTLE_STATE_CHANGED: 'BattleStateChanged',
    BATTLE_FINISHED: 'BattleFinished',
    BATTLE_ATTEMPT_UPDATED: 'BattleAttemptUpdated',
    
    // Submission Module Events
    SUBMISSION_ATTEMPTED: 'SubmissionAttempted',
    SUBMISSION_QUEUED: 'SubmissionQueued',
    SUBMISSION_COMPLETED: 'SubmissionCompleted',
    SUBMISSION_FINALIZED: 'SubmissionFinalized',
    
    // Reward Module Events
    REWARD_GRANTED: 'RewardGranted',
    ACHIEVEMENT_UNLOCKED: 'AchievementUnlocked',
    
    // Profile Module Events
    USER_RANK_UPDATED: 'UserRankUpdated',
    USER_PROFILE_UPDATED: 'UserProfileUpdated',
    
    // Contest Module Events
    CONTEST_CREATED: 'ContestCreated',
    CONTEST_STARTED: 'ContestStarted',
    CONTEST_ENDED: 'ContestEnded',
    
    // Notification Module Events
    NOTIFICATION_SENT: 'NotificationSent',
    FRIEND_REQUEST_SENT: 'FriendRequestSent',
    FRIEND_REQUEST_ACCEPTED: 'FriendRequestAccepted',
    MATCH_INVITATION_SENT: 'MatchInvitationSent'
};

/**
 * Event payload schemas (for documentation)
 */
export const EventSchemas = {
    [EventTypes.USER_AUTHENTICATED]: {
        userId: 'string',
        timestamp: 'Date',
        method: "'password' | 'google' | 'github'"
    },
    
    [EventTypes.MATCH_FOUND]: {
        player1: { userId: 'string', username: 'string', rankPoints: 'number' },
        player2: { userId: 'string', username: 'string', rankPoints: 'number' },
        difficulty: "'EASY' | 'MEDIUM' | 'HARD'",
        problemId: 'string'
    },
    
    [EventTypes.BATTLE_FINISHED]: {
        battleId: 'string',
        winnerId: 'string',
        loserId: 'string',
        problemId: 'string',
        difficulty: "'EASY' | 'MEDIUM' | 'HARD'",
        duration: 'number',
        player1Attempts: 'number',
        player2Attempts: 'number'
    },
    
    [EventTypes.BATTLE_STATE_CHANGED]: {
        battleId: 'string',
        oldState: 'string',
        newState: "'WAITING' | 'COUNTDOWN' | 'ONGOING' | 'FINISHED'",
        metadata: 'object'
    },
    
    [EventTypes.SUBMISSION_ATTEMPTED]: {
        battleId: 'string',
        userId: 'string',
        type: "'RUN' | 'SUBMIT'"
    },
    
    [EventTypes.SUBMISSION_QUEUED]: {
        submissionId: 'string',
        userId: 'string',
        problemId: 'string',
        battleId: 'string | null',
        contestId: 'string | null',
        squidGameId: 'string | null',
        type: "'RUN' | 'SUBMIT'"
    },
    
    [EventTypes.SUBMISSION_COMPLETED]: {
        submissionId: 'string',
        userId: 'string',
        problemId: 'string',
        status: "'PASSED' | 'FAILED'",
        executionTimeMs: 'number',
        passedTests: 'number',
        totalTests: 'number',
        type: "'RUN' | 'SUBMIT'",
        context: {
            battleId: 'string | null',
            contestId: 'string | null',
            squidGameId: 'string | null'
        }
    },
    
    [EventTypes.REWARD_GRANTED]: {
        userId: 'string',
        rewardType: "'BATTLE' | 'PROBLEM' | 'DAILY' | 'ACHIEVEMENT'",
        amount: 'number',
        reason: 'string',
        metadata: 'object'
    },
    
    [EventTypes.ACHIEVEMENT_UNLOCKED]: {
        userId: 'string',
        achievementId: 'string',
        achievementName: 'string',
        rewardType: "'CORES' | 'BADGE'",
        rewardValue: 'string'
    }
};
