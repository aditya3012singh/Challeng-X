# Phase 3A - Event to Listener Mapping

## Overview
This document maps all events to their corresponding listeners in Phase 3A.

---

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT SOURCES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Battle Service                                                         │
│  └─ emit BATTLE_FINISHED                                               │
│     ├─ Profile Listener (handleBattleFinished)                         │
│     │  └─ Update ranks, emit USER_RANK_UPDATED                         │
│     └─ Socket Listener (handleBattleFinished)                          │
│        └─ Broadcast battle_end to battle room                          │
│                                                                         │
│  Submission Service                                                     │
│  └─ emit SUBMISSION_QUEUED                                             │
│     └─ (No Phase 3A listeners)                                         │
│                                                                         │
│  Worker                                                                 │
│  └─ emit SUBMISSION_COMPLETED                                          │
│     ├─ Profile Listener (handleSubmissionCompleted)                    │
│     │  └─ Track practice submissions                                   │
│     └─ Socket Listener (handleSubmissionCompleted)                     │
│        └─ Broadcast submission_result to user & battle room            │
│                                                                         │
│  Auth Controller                                                        │
│  └─ emit USER_AUTHENTICATED                                            │
│     └─ Profile Listener (handleUserAuthenticated)                      │
│        └─ Update last login timestamp                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Event Listener Mapping

### 1. BATTLE_FINISHED Event

**Source**: `backend/src/services/battle.service.js` (finishBattleService)

**Listeners**:

#### Profile Listener
- **Handler**: `handleBattleFinished`
- **File**: `backend/src/events/listeners/profile.listeners.js`
- **Actions**:
  1. Update winner stats: +30 rank points, +1 win
  2. Update loser stats: -20 rank points, +1 loss
  3. Emit USER_RANK_UPDATED event
- **Logging**: "User ranks updated"
- **Error Handling**: Try-catch with error logging

#### Socket Listener
- **Handler**: `handleBattleFinished`
- **File**: `backend/src/events/listeners/socket.listeners.js`
- **Actions**:
  1. Emit battle_end event to battle room
  2. Include winner, loser, draw flag
- **Logging**: "Battle end broadcasted"
- **Error Handling**: Try-catch with error logging

**Event Payload**:
```javascript
{
  battleId: string,
  winnerId: string,
  loserId: string,
  problemId: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  duration: number,
  player1Attempts: number,
  player2Attempts: number
}
```

**Dual Mode Status**: ✅ PRESERVED
- RankingService.updateRanks() still called from battle.service.js
- SocketEmitter.emitToBattle() still called from battle.service.js
- New listeners run in parallel

---

### 2. SUBMISSION_COMPLETED Event

**Source**: `backend/worker/worker.js` (3 scenarios: RUN, FAILED, PASSED)

**Listeners**:

#### Profile Listener
- **Handler**: `handleSubmissionCompleted`
- **File**: `backend/src/events/listeners/profile.listeners.js`
- **Actions**:
  1. Track solo practice submissions (not in battle)
  2. Only for SUBMIT type with PASSED status
- **Logging**: "Practice submission tracked"
- **Error Handling**: Try-catch with error logging

#### Socket Listener
- **Handler**: `handleSubmissionCompleted`
- **File**: `backend/src/events/listeners/socket.listeners.js`
- **Actions**:
  1. Emit submission_result to user
  2. Emit opponent_submission_result to battle room (if in battle)
  3. Include status, type, test case results, failure details
- **Logging**: "Submission result broadcasted"
- **Error Handling**: Try-catch with error logging

**Event Payload**:
```javascript
{
  submissionId: string,
  userId: string,
  problemId: string,
  status: 'PASSED' | 'FAILED',
  executionTimeMs: number,
  passedTests: number,
  totalTests: number,
  type: 'RUN' | 'SUBMIT',
  context: {
    battleId: string | null,
    contestId: string | null,
    squidGameId: string | null
  },
  testCaseResults?: array,
  failureDetails?: object
}
```

**Dual Mode Status**: ✅ PRESERVED
- All existing worker logic kept
- New listeners run in parallel

---

### 3. USER_AUTHENTICATED Event

**Source**: `backend/src/controllers/auth.controller.js` (login)

**Listeners**:

#### Profile Listener
- **Handler**: `handleUserAuthenticated`
- **File**: `backend/src/events/listeners/profile.listeners.js`
- **Actions**:
  1. Update last login timestamp
  2. Track login events
- **Logging**: "User login tracked"
- **Error Handling**: Try-catch with error logging

**Event Payload**:
```javascript
{
  userId: string,
  email: string,
  loginMethod: 'password' | 'google' | 'github',
  timestamp: Date
}
```

**Dual Mode Status**: ✅ PRESERVED
- Existing RewardService call kept
- New listener runs in parallel

---

### 4. BATTLE_STATE_CHANGED Event

**Source**: `backend/src/services/battle.service.js` (state transitions)

**Listeners**:

#### Socket Listener
- **Handler**: `handleBattleStateChanged`
- **File**: `backend/src/events/listeners/socket.listeners.js`
- **Actions**:
  1. Emit battle_state_changed event to battle room
  2. Include old state, new state, metadata
- **Logging**: "Battle state change broadcasted"
- **Error Handling**: Try-catch with error logging

**Event Payload**:
```javascript
{
  battleId: string,
  oldState: 'WAITING' | 'COUNTDOWN' | 'ONGOING' | 'FINISHED',
  newState: 'WAITING' | 'COUNTDOWN' | 'ONGOING' | 'FINISHED',
  metadata: object
}
```

**Note**: This event is not yet emitted in Phase 3A. Will be added in Phase 3B.

---

### 5. BATTLE_ATTEMPT_UPDATED Event

**Source**: `backend/src/services/submission.service.js` (attempt increment)

**Listeners**:

#### Socket Listener
- **Handler**: `handleBattleAttemptUpdated`
- **File**: `backend/src/events/listeners/socket.listeners.js`
- **Actions**:
  1. Emit attempts_updated event to battle room
  2. Include player1Attempts, player2Attempts
- **Logging**: "Attempt count broadcasted"
- **Error Handling**: Try-catch with error logging

**Event Payload**:
```javascript
{
  battleId: string,
  player1Attempts: number,
  player2Attempts: number
}
```

**Note**: This event is not yet emitted in Phase 3A. Will be added in Phase 3B.

---

### 6. BATTLE_CREATED Event

**Source**: `backend/src/services/battle.service.js` (battle creation)

**Listeners**:

#### Socket Listener
- **Handler**: `handleBattleCreated`
- **File**: `backend/src/events/listeners/socket.listeners.js`
- **Actions**:
  1. Emit battle_created event to both players
  2. Include battle ID, opponent ID, problem ID
- **Logging**: "Battle creation broadcasted"
- **Error Handling**: Try-catch with error logging

**Event Payload**:
```javascript
{
  battleId: string,
  player1Id: string,
  player2Id: string,
  problemId: string
}
```

**Note**: This event is not yet emitted in Phase 3A. Will be added in Phase 3B.

---

## Listener Implementation Status

### Profile Listeners
| Handler | Event | Status | Dual Mode |
|---------|-------|--------|-----------|
| handleBattleFinished | BATTLE_FINISHED | ✅ Implemented | ✅ Preserved |
| handleSubmissionCompleted | SUBMISSION_COMPLETED | ✅ Implemented | ✅ Preserved |
| handleUserAuthenticated | USER_AUTHENTICATED | ✅ Implemented | ✅ Preserved |

### Socket Listeners
| Handler | Event | Status | Dual Mode |
|---------|-------|--------|-----------|
| handleBattleStateChanged | BATTLE_STATE_CHANGED | ✅ Implemented | ⏳ Pending |
| handleBattleAttemptUpdated | BATTLE_ATTEMPT_UPDATED | ✅ Implemented | ⏳ Pending |
| handleSubmissionCompleted | SUBMISSION_COMPLETED | ✅ Implemented | ✅ Preserved |
| handleBattleCreated | BATTLE_CREATED | ✅ Implemented | ⏳ Pending |
| handleBattleFinished | BATTLE_FINISHED | ✅ Implemented | ✅ Preserved |

---

## Dual Mode Execution Flow

### Battle Completion Flow
```
Battle Service (finishBattleService)
  ├─ Update battle status in DB
  ├─ Emit BATTLE_FINISHED event
  │  ├─ Profile Listener
  │  │  ├─ Update winner stats (+30 points, +1 win)
  │  │  ├─ Update loser stats (-20 points, +1 loss)
  │  │  └─ Emit USER_RANK_UPDATED event
  │  └─ Socket Listener
  │     └─ Emit battle_end to battle room
  │
  └─ Background tasks (KEPT - DUAL MODE)
     ├─ RankingService.updateRanks() (OLD LOGIC)
     ├─ RewardService.grantBattleRewards() (OLD LOGIC)
     └─ Redis cache flush (OLD LOGIC)
```

**Result**: Both old and new logic execute in parallel. No breaking changes.

---

## Event Payload Schemas

### BATTLE_FINISHED
```javascript
{
  battleId: string,
  winnerId: string,
  loserId: string,
  problemId: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  duration: number,
  player1Attempts: number,
  player2Attempts: number
}
```

### SUBMISSION_COMPLETED
```javascript
{
  submissionId: string,
  userId: string,
  problemId: string,
  status: 'PASSED' | 'FAILED',
  executionTimeMs: number,
  passedTests: number,
  totalTests: number,
  type: 'RUN' | 'SUBMIT',
  context: {
    battleId: string | null,
    contestId: string | null,
    squidGameId: string | null
  },
  testCaseResults?: array,
  failureDetails?: object
}
```

### USER_AUTHENTICATED
```javascript
{
  userId: string,
  email: string,
  loginMethod: 'password' | 'google' | 'github',
  timestamp: Date
}
```

### BATTLE_STATE_CHANGED
```javascript
{
  battleId: string,
  oldState: 'WAITING' | 'COUNTDOWN' | 'ONGOING' | 'FINISHED',
  newState: 'WAITING' | 'COUNTDOWN' | 'ONGOING' | 'FINISHED',
  metadata: object
}
```

### BATTLE_ATTEMPT_UPDATED
```javascript
{
  battleId: string,
  player1Attempts: number,
  player2Attempts: number
}
```

### BATTLE_CREATED
```javascript
{
  battleId: string,
  player1Id: string,
  player2Id: string,
  problemId: string
}
```

---

## Logging Output Examples

### Profile Listener Logs
```
[Profile Listener] 📥 BattleFinished event received
[Profile Listener] ✅ User ranks updated
[Profile Listener] 📤 USER_RANK_UPDATED event emitted

[Profile Listener] 📥 SubmissionCompleted event received
[Profile Listener] ✅ Practice submission tracked

[Profile Listener] 📥 UserAuthenticated event received
[Profile Listener] ✅ User login tracked
```

### Socket Listener Logs
```
[Socket Listener] 📥 BattleFinished event received
[Socket Listener] ✅ Battle end broadcasted

[Socket Listener] 📥 SubmissionCompleted event received
[Socket Listener] ✅ Submission result broadcasted

[Socket Listener] 📥 BattleStateChanged event received
[Socket Listener] ✅ Battle state change broadcasted

[Socket Listener] 📥 BattleAttemptUpdated event received
[Socket Listener] ✅ Attempt count broadcasted

[Socket Listener] 📥 BattleCreated event received
[Socket Listener] ✅ Battle creation broadcasted
```

---

## Phase 3B Preview

Phase 3B will emit the missing events:
1. BATTLE_STATE_CHANGED - When battle state transitions
2. BATTLE_ATTEMPT_UPDATED - When attempt count changes
3. BATTLE_CREATED - When battle is created

This will enable all socket listeners to work via events.

---

**Status**: ✅ COMPLETE
**Date**: May 3, 2026
**Version**: 3.0.0
