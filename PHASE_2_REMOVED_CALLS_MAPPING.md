# Phase 2 - Removed Direct Calls Mapping

## Overview
This document maps all removed direct NotificationService calls to their replacement events.

---

## Summary
- **Total Direct Calls Removed**: 7
- **Files Modified**: 3
- **Events Emitted**: 6
- **Listeners Implemented**: 6

---

## Detailed Mapping

### 1. backend/src/services/reward.service.js

#### Call 1: Battle Reward Notification
**Location**: Line 51 (in `grantBattleRewards()`)

**Before (Direct Call)**:
```javascript
await NotificationService.sendNotification(winner.id, {
  type: "REWARD",
  title: "Cyber-Cores Earned!",
  message: `You earned ${baseReward} Cyber-Cores for winning the battle!`,
  metadata: { battleId, amount: baseReward }
});
```

**After (Event-Driven)**:
```javascript
eventBus.emitEvent(EventTypes.REWARD_GRANTED, {
  userId: winner.id,
  rewardType: 'BATTLE',
  amount: baseReward,
  reason: 'Battle victory',
  metadata: { battleId, opponentId: loser?.id }
});
```

**Event Flow**:
```
reward.service.js (grantBattleRewards)
  └─ emit REWARD_GRANTED
     └─ notification.listeners.js (handleRewardGranted)
        └─ NotificationService.sendNotification()
```

**Listener Logic**:
```javascript
if (payload.rewardType === 'BATTLE') {
  message = `You earned ${payload.amount} Cyber-Cores for winning the battle!`;
}
```

---

#### Call 2: Problem Reward Notification
**Location**: Line 117 (in `grantProblemRewards()`)

**Before (Direct Call)**:
```javascript
await NotificationService.sendNotification(userId, {
  type: "REWARD",
  title: "Mission Accomplished!",
  message: hintsUsed === 0
    ? `Perfect solve! You earned ${reward} Cyber-Cores.`
    : `Problem solved! You earned ${reward} Cyber-Cores (${hintsUsed} hints used).`,
  metadata: { problemId, amount: reward, perfect: hintsUsed === 0 }
});
```

**After (Event-Driven)**:
```javascript
eventBus.emitEvent(EventTypes.REWARD_GRANTED, {
  userId,
  rewardType: 'PROBLEM',
  amount: reward,
  reason: 'Problem solved',
  metadata: { problemId, hintsUsed, perfect: hintsUsed === 0 }
});
```

**Event Flow**:
```
reward.service.js (grantProblemRewards)
  └─ emit REWARD_GRANTED
     └─ notification.listeners.js (handleRewardGranted)
        └─ NotificationService.sendNotification()
```

**Listener Logic**:
```javascript
if (payload.rewardType === 'PROBLEM') {
  const hintsUsed = payload.metadata?.hintsUsed || 0;
  if (hintsUsed === 0) {
    message = `Perfect solve! You earned ${payload.amount} Cyber-Cores.`;
  } else {
    message = `Problem solved! You earned ${payload.amount} Cyber-Cores (${hintsUsed} hints used).`;
  }
}
```

---

#### Call 3: Daily Login Reward Notification
**Location**: Line 170 (in `processDailyLogin()`)

**Before (Direct Call)**:
```javascript
await NotificationService.sendNotification(userId, {
  type: "DAILY_REWARD",
  title: "Daily Login Reward!",
  message: `Welcome back! You earned ${reward} Cyber-Cores. Streak: ${newStreak} days.`,
  metadata: { amount: reward, streak: newStreak }
});
```

**After (Event-Driven)**:
```javascript
eventBus.emitEvent(EventTypes.REWARD_GRANTED, {
  userId,
  rewardType: 'DAILY',
  amount: reward,
  reason: 'Daily login',
  metadata: { streak: newStreak }
});
```

**Event Flow**:
```
reward.service.js (processDailyLogin)
  └─ emit REWARD_GRANTED
     └─ notification.listeners.js (handleRewardGranted)
        └─ NotificationService.sendNotification()
```

**Listener Logic**:
```javascript
if (payload.rewardType === 'DAILY') {
  title = 'Daily Login Reward!';
  const streak = payload.metadata?.streak || 1;
  message = `Welcome back! You earned ${payload.amount} Cyber-Cores. Streak: ${streak} days.`;
}
```

---

#### Call 4: Achievement Unlock Notification
**Location**: Line 222 (in `checkAchievements()`)

**Before (Direct Call)**:
```javascript
await NotificationService.sendNotification(userId, {
  type: "ACHIEVEMENT",
  title: "Achievement Unlocked!",
  message: `Congratulations! You unlocked: ${ach.name}`,
  metadata: { achievementId: ach.id, rewardType: ach.rewardType }
});
```

**After (Event-Driven)**:
```javascript
eventBus.emitEvent(EventTypes.ACHIEVEMENT_UNLOCKED, {
  userId,
  achievementId: ach.id,
  achievementName: ach.name,
  rewardType: ach.rewardType,
  rewardValue: ach.rewardValue
});
```

**Event Flow**:
```
reward.service.js (checkAchievements)
  └─ emit ACHIEVEMENT_UNLOCKED
     └─ notification.listeners.js (handleAchievementUnlocked)
        └─ NotificationService.sendNotification()
```

**Listener Logic**:
```javascript
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
```

---

### 2. backend/src/controllers/social.controller.js

#### Call 5: Friend Request Sent Notification
**Location**: Line 80 (in `sendFriendRequest()`)

**Before (Direct Call)**:
```javascript
const sender = await Database.client.user.findUnique({ where: { id: senderId } });
await NotificationService.createNotification(receiverId, {
  type: 'FRIEND_REQUEST',
  title: 'New Friend Request',
  message: `${sender?.username || 'Someone'} sent you a friend request.`,
  link: `/profile/${sender?.username}`
});
```

**After (Event-Driven)**:
```javascript
const sender = await Database.client.user.findUnique({ where: { id: senderId } });
eventBus.emitEvent('FriendRequestSent', {
  senderId,
  receiverId,
  senderUsername: sender?.username
});
```

**Event Flow**:
```
social.controller.js (sendFriendRequest)
  └─ emit FriendRequestSent
     └─ notification.listeners.js (handleFriendRequestSent)
        └─ NotificationService.createNotification()
```

**Listener Logic**:
```javascript
await NotificationService.createNotification(payload.receiverId, {
  type: 'FRIEND_REQUEST',
  title: 'New Friend Request',
  message: `${payload.senderUsername || 'Someone'} sent you a friend request.`,
  link: `/profile/${payload.senderUsername}`
});
```

---

#### Call 6: Friend Request Accepted Notification
**Location**: Line 122 (in `respondToRequest()`)

**Before (Direct Call)**:
```javascript
if (status === 'ACCEPTED') {
  const receiver = await Database.client.user.findUnique({ where: { id: userId } });
  await NotificationService.createNotification(request.senderId, {
    type: 'FRIEND_REQUEST',
    title: 'Friend Request Accepted',
    message: `${receiver?.username || 'Someone'} accepted your friend request.`,
    link: `/profile/${receiver?.username}`
  });
}
```

**After (Event-Driven)**:
```javascript
if (status === 'ACCEPTED') {
  const receiver = await Database.client.user.findUnique({ where: { id: userId } });
  eventBus.emitEvent('FriendRequestAccepted', {
    senderId: request.senderId,
    receiverId: userId,
    receiverUsername: receiver?.username
  });
}
```

**Event Flow**:
```
social.controller.js (respondToRequest)
  └─ emit FriendRequestAccepted
     └─ notification.listeners.js (handleFriendRequestAccepted)
        └─ NotificationService.createNotification()
```

**Listener Logic**:
```javascript
await NotificationService.createNotification(payload.senderId, {
  type: 'FRIEND_REQUEST',
  title: 'Friend Request Accepted',
  message: `${payload.receiverUsername || 'Someone'} accepted your friend request.`,
  link: `/profile/${payload.receiverUsername}`
});
```

---

### 3. backend/src/socket/lobby.handler.js

#### Call 7: Match Invitation Notification
**Location**: Line 58 (in `lobby:invite` event handler)

**Before (Direct Call)**:
```javascript
await NotificationService.createNotification(friendId, {
  type: 'MATCH_INVITE',
  title: 'Match Invitation',
  message: `${socket.user.username} invited you to join a lobby.`,
  link: `/battles`
});
```

**After (Event-Driven)**:
```javascript
eventBus.emitEvent('MatchInvitationSent', {
  inviterId: socket.userId,
  inviteeId: friendId,
  inviterUsername: socket.user.username
});
```

**Event Flow**:
```
lobby.handler.js (lobby:invite)
  └─ emit MatchInvitationSent
     └─ notification.listeners.js (handleMatchInvitationSent)
        └─ NotificationService.createNotification()
```

**Listener Logic**:
```javascript
await NotificationService.createNotification(payload.inviteeId, {
  type: 'MATCH_INVITE',
  title: 'Match Invitation',
  message: `${payload.inviterUsername || 'Someone'} invited you to join a lobby.`,
  link: `/battles`
});
```

---

## Event Payload Schemas

### REWARD_GRANTED
```javascript
{
  userId: string,
  rewardType: 'BATTLE' | 'PROBLEM' | 'DAILY',
  amount: number,
  reason: string,
  metadata: {
    battleId?: string,
    opponentId?: string,
    problemId?: string,
    hintsUsed?: number,
    perfect?: boolean,
    streak?: number
  }
}
```

### ACHIEVEMENT_UNLOCKED
```javascript
{
  userId: string,
  achievementId: string,
  achievementName: string,
  rewardType: 'CORES' | 'BADGE',
  rewardValue: string
}
```

### FriendRequestSent
```javascript
{
  senderId: string,
  receiverId: string,
  senderUsername: string
}
```

### FriendRequestAccepted
```javascript
{
  senderId: string,
  receiverId: string,
  receiverUsername: string
}
```

### MatchInvitationSent
```javascript
{
  inviterId: string,
  inviteeId: string,
  inviterUsername: string
}
```

---

## Listener Implementation Summary

| Event | Listener | Notifications Sent | Status |
|-------|----------|-------------------|--------|
| REWARD_GRANTED | handleRewardGranted | 1 (contextual) | ✅ |
| ACHIEVEMENT_UNLOCKED | handleAchievementUnlocked | 1 | ✅ |
| BATTLE_FINISHED | handleBattleFinished | 2 (winner + loser) | ✅ |
| FriendRequestSent | handleFriendRequestSent | 1 | ✅ |
| FriendRequestAccepted | handleFriendRequestAccepted | 1 | ✅ |
| MatchInvitationSent | handleMatchInvitationSent | 1 | ✅ |

---

## Verification

### All Direct Calls Removed
- ✅ reward.service.js: 4 calls removed
- ✅ social.controller.js: 2 calls removed
- ✅ lobby.handler.js: 1 call removed
- ✅ Total: 7 calls removed

### All Events Emitted
- ✅ REWARD_GRANTED: 3 scenarios (battle, problem, daily)
- ✅ ACHIEVEMENT_UNLOCKED: 1 scenario
- ✅ BATTLE_FINISHED: Already existed, now used by listener
- ✅ FriendRequestSent: New event
- ✅ FriendRequestAccepted: New event
- ✅ MatchInvitationSent: New event

### All Listeners Implemented
- ✅ handleRewardGranted: Implemented
- ✅ handleAchievementUnlocked: Implemented
- ✅ handleBattleFinished: Implemented
- ✅ handleFriendRequestSent: Implemented
- ✅ handleFriendRequestAccepted: Implemented
- ✅ handleMatchInvitationSent: Implemented

---

## System Behavior Verification

### Before Phase 2
```
Service → Direct Call → NotificationService → Database + Socket
```

### After Phase 2
```
Service → Emit Event → Event Bus → Listener → NotificationService → Database + Socket
```

**Result**: Same notifications sent, but now decoupled and event-driven.

---

**Status**: ✅ COMPLETE
**Date**: May 3, 2026
**Version**: 2.0.0
