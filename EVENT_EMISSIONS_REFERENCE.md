# Event Emissions Reference - Phase 1

## Quick Reference: Where Events Are Emitted

### 1. UserAuthenticated
**Location**: `backend/src/controllers/auth.controller.js`
**Trigger**: After successful login
**Event Name**: `EventTypes.UserAuthenticated`
**Payload**:
```javascript
{
  userId,
  email,
  loginMethod,
  timestamp
}
```
**Existing Logic**: ✅ RewardService call (KEPT)

---

### 2. BattleFinished
**Location**: `backend/src/services/battle.service.js`
**Trigger**: After battle completion
**Event Name**: `EventTypes.BattleFinished`
**Payload**:
```javascript
{
  battleId,
  winnerId,
  loserId,
  battleType,
  timestamp
}
```
**Existing Logic**: 
- ✅ RankingService call (KEPT)
- ✅ RewardService call (KEPT)

---

### 3. SubmissionQueued
**Location**: `backend/src/services/submission.service.js` (line ~95)
**Trigger**: After submission is created and queued
**Event Name**: `EventTypes.SubmissionQueued`
**Payload**:
```javascript
{
  submissionId,
  userId,
  problemId,
  battleId,        // null if not in battle
  contestId,       // null if not in contest
  squidGameId,     // null if not in squid game
  type             // "RUN" or "SUBMIT"
}
```
**Existing Logic**: ✅ All submission logic (KEPT)

---

### 4. SubmissionCompleted (RUN Type)
**Location**: `backend/worker/worker.js` (line ~145)
**Trigger**: After RUN execution completes
**Event Name**: `EventTypes.SubmissionCompleted`
**Payload**:
```javascript
{
  submissionId,
  userId,
  problemId,
  status,          // "PASSED" or "FAILED"
  executionTimeMs,
  passedTests,
  totalTests,
  type: "RUN",
  context: {
    battleId,
    contestId,
    squidGameId
  },
  testCaseResults  // Array of test case details
}
```
**Existing Logic**: ✅ All RUN logic (KEPT)

---

### 5. SubmissionCompleted (SUBMIT - FAILED)
**Location**: `backend/worker/worker.js` (line ~195)
**Trigger**: After SUBMIT execution fails
**Event Name**: `EventTypes.SubmissionCompleted`
**Payload**:
```javascript
{
  submissionId,
  userId,
  problemId,
  status: "FAILED",
  executionTimeMs,
  passedTests,
  totalTests,
  type: "SUBMIT",
  context: {
    battleId,
    contestId,
    squidGameId
  },
  failureDetails: {
    failedTestCase,
    input,
    expectedOutput,
    actualOutput,
    errorMessage
  }
}
```
**Existing Logic**: ✅ All FAILED logic (KEPT)

---

### 6. SubmissionCompleted (SUBMIT - PASSED)
**Location**: `backend/worker/worker.js` (line ~290)
**Trigger**: After SUBMIT execution passes all tests
**Event Name**: `EventTypes.SubmissionCompleted`
**Payload**:
```javascript
{
  submissionId,
  userId,
  problemId,
  status: "PASSED",
  executionTimeMs,
  passedTests,
  totalTests,
  type: "SUBMIT",
  context: {
    battleId,
    contestId,
    squidGameId
  }
}
```
**Existing Logic**: 
- ✅ Battle finish logic (KEPT)
- ✅ Reward granting logic (KEPT)
- ✅ AI feedback generation (KEPT)

---

## Event Listener Locations

All listeners are in `backend/src/events/listeners/`:

| Listener | File | Events Handled | Status |
|----------|------|----------------|--------|
| Battle | `battle.listeners.js` | BattleFinished, BattleStateChanged | Logging only |
| Reward | `reward.listeners.js` | RewardGranted, AchievementUnlocked | Logging only |
| Notification | `notification.listeners.js` | All events | Logging only |
| Profile | `profile.listeners.js` | UserAuthenticated, SubmissionCompleted | Logging only |
| Socket | `socket.listeners.js` | All events | Logging only |

---

## How to Add New Event Emissions

### Step 1: Add event type to `eventTypes.js`
```javascript
export const EventTypes = {
  // ... existing events
  MyNewEvent: 'MyNewEvent'
};
```

### Step 2: Import in your service/controller
```javascript
import eventBus from "../events/eventBus.js";
import { EventTypes } from "../events/eventTypes.js";
```

### Step 3: Emit the event
```javascript
eventBus.emitEvent(EventTypes.MyNewEvent, {
  // payload data
});
```

### Step 4: Create listener (if needed)
```javascript
// In appropriate listener file
eventBus.onEvent(EventTypes.MyNewEvent, (payload) => {
  console.log(`📤 Event received: MyNewEvent`, payload);
  // Add business logic here in Phase 2
});
```

---

## Dual Mode Execution Pattern

All Phase 1 emissions follow this pattern:

```javascript
// 1. Do existing work
await existingService.doSomething();

// 2. Emit event (NEW - Phase 1)
eventBus.emitEvent(EventTypes.SomeEvent, {
  // payload
});

// 3. Return result
return result;
```

**Key**: Existing logic is NEVER removed, only supplemented with events.

---

## Testing Events

### Check if event is emitted
Look for logs like:
```
📤 Event emitted: UserAuthenticated
📤 Event emitted: BattleFinished
📤 Event emitted: SubmissionQueued
📤 Event emitted: SubmissionCompleted
```

### Check listener received event
Look for logs like:
```
📥 [battle.listeners] Event received: BattleFinished
📥 [reward.listeners] Event received: RewardGranted
📥 [notification.listeners] Event received: SubmissionCompleted
```

---

## Phase 2 Preview

In Phase 2, listeners will implement business logic:

```javascript
// Example: Reward listener in Phase 2
eventBus.onEvent(EventTypes.SubmissionCompleted, async (payload) => {
  if (payload.status === "PASSED") {
    // Move reward granting logic here
    await RewardService.grantRewards(payload.userId, payload.problemId);
  }
});
```

At that point, the direct service calls will be removed (after verification that listeners work).
