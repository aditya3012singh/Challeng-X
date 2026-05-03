# 🚀 Quick Start - Phase 1 Event Bus

## What Was Done

Phase 1 added an **event bus infrastructure** to your ChallengX backend. Events are now emitted when:
- User logs in
- Battle finishes
- Submission is queued
- Submission completes (RUN, FAILED, or PASSED)

**Important**: All existing logic is preserved. Events are emitted **alongside** existing code, not replacing it.

---

## Files Added

```
backend/src/events/
├── eventBus.js                    # Event bus core
├── eventTypes.js                  # Event type constants
└── listeners/
    ├── index.js                   # Listener registration
    ├── battle.listeners.js        # Battle events
    ├── reward.listeners.js        # Reward events
    ├── notification.listeners.js  # Notification events
    ├── profile.listeners.js       # Profile events
    └── socket.listeners.js        # Socket events
```

---

## Files Modified

1. `backend/src/index.js` - Initialize event bus
2. `backend/src/controllers/auth.controller.js` - Emit UserAuthenticated
3. `backend/src/services/battle.service.js` - Emit BattleFinished
4. `backend/src/services/submission.service.js` - Emit SubmissionQueued
5. `backend/worker/worker.js` - Emit SubmissionCompleted

---

## How to Test

### 1. Start the server
```bash
cd backend
npm run dev
```

### 2. Look for initialization logs
```
✅ Event Bus initialized
📋 Registering all event listeners...
✅ All listeners registered: battle, reward, notification, profile, socket
```

### 3. Test each event

**UserAuthenticated**
```bash
# Login via API
# Look for: 📤 Event emitted: UserAuthenticated
```

**BattleFinished**
```bash
# Complete a battle
# Look for: 📤 Event emitted: BattleFinished
```

**SubmissionQueued**
```bash
# Submit code
# Look for: 📤 Event emitted: SubmissionQueued
```

**SubmissionCompleted**
```bash
# Wait for worker to process
# Look for: 📤 Event emitted: SubmissionCompleted
```

---

## Event Payloads

### UserAuthenticated
```javascript
{
  userId: "user-id",
  email: "user@example.com",
  loginMethod: "email",
  timestamp: Date
}
```

### BattleFinished
```javascript
{
  battleId: "battle-id",
  winnerId: "user-id",
  loserId: "user-id",
  battleType: "1v1",
  timestamp: Date
}
```

### SubmissionQueued
```javascript
{
  submissionId: "submission-id",
  userId: "user-id",
  problemId: "problem-id",
  battleId: null,
  contestId: null,
  squidGameId: null,
  type: "SUBMIT"
}
```

### SubmissionCompleted (PASSED)
```javascript
{
  submissionId: "submission-id",
  userId: "user-id",
  problemId: "problem-id",
  status: "PASSED",
  executionTimeMs: 123,
  passedTests: 10,
  totalTests: 10,
  type: "SUBMIT",
  context: {
    battleId: null,
    contestId: null,
    squidGameId: null
  }
}
```

---

## How to Add a New Event

### Step 1: Add event type
```javascript
// backend/src/events/eventTypes.js
export const EventTypes = {
  // ... existing events
  MyNewEvent: 'MyNewEvent'
};
```

### Step 2: Emit the event
```javascript
// In your service/controller
import eventBus from "../events/eventBus.js";
import { EventTypes } from "../events/eventTypes.js";

eventBus.emitEvent(EventTypes.MyNewEvent, {
  // payload
});
```

### Step 3: Create listener (optional)
```javascript
// In appropriate listener file
eventBus.onEvent(EventTypes.MyNewEvent, (payload) => {
  console.log(`📥 Event received: MyNewEvent`, payload);
  // Add business logic here
});
```

---

## Current Listeners (Logging Only)

All listeners currently just log events. In Phase 2, they will implement business logic.

| Listener | Events | Phase 2 Logic |
|----------|--------|---------------|
| Battle | BattleFinished, BattleStateChanged | Update battle state |
| Reward | RewardGranted, AchievementUnlocked | Grant rewards |
| Notification | All events | Send notifications |
| Profile | UserAuthenticated, SubmissionCompleted | Update user stats |
| Socket | BattleFinished, SubmissionCompleted | Real-time updates |

---

## Troubleshooting

### Events not showing in logs?
1. Check that server started successfully
2. Check that listeners were registered
3. Verify event is being emitted (check code)
4. Check logger level (should be INFO or DEBUG)

### Existing functionality broken?
1. All existing logic is preserved
2. Check error logs for details
3. Verify no syntax errors: `node -c backend/src/services/submission.service.js`
4. Restart server

### Want to disable events temporarily?
Comment out the event emission line:
```javascript
// eventBus.emitEvent(EventTypes.SomeEvent, payload);
```

---

## Key Points

✅ **Zero Breaking Changes** - All existing logic preserved
✅ **Dual Mode** - Events emitted alongside existing code
✅ **Logging** - All events logged for debugging
✅ **Extensible** - Easy to add new events
✅ **Ready for Phase 2** - Listeners ready for business logic

---

## Next Steps

1. **Verify Phase 1 works** - Run tests and check logs
2. **Plan Phase 2** - Decide which listeners to implement first
3. **Implement Phase 2** - Move business logic into listeners
4. **Remove dual mode** - Remove direct service calls after verification

---

## Documentation

- **PHASE_1_COMPLETION_SUMMARY.md** - Full overview
- **EVENT_EMISSIONS_REFERENCE.md** - Event details
- **PHASE_1_CODE_CHANGES.md** - Code changes
- **PHASE_1_FINAL_STATUS.md** - Final status

---

## Questions?

Check the documentation files above for detailed information about:
- Event payloads
- Listener locations
- How to add new events
- Phase 2 planning
- Troubleshooting

---

**Status**: ✅ Phase 1 Complete
**Ready for**: Phase 2 Implementation
