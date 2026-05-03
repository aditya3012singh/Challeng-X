# Phase 4 - Reward Module Event-Driven Implementation

## 🎯 Goal
Convert the Reward Module to be fully event-driven by:
- Moving reward logic into event listeners
- Removing ALL direct calls to RewardService
- Ensuring system behavior remains unchanged

## 📊 Current State
- **Event Bus**: ✅ Implemented (Phase 1)
- **Notification Module**: ✅ Event-driven (Phase 2)
- **Profile + Socket Modules**: ✅ Event-driven (Phase 3A/3B)
- **Reward Module**: ❌ Still has direct calls

## 🔍 Direct Calls to Remove

### 1. battle.service.js (Line 439)
```javascript
await RewardService.grantBattleRewards(battleId);
```
**Trigger**: When battle finishes
**Replacement**: Emit event from BATTLE_FINISHED listener

### 2. auth.controller.js (Lines 55, 421)
```javascript
RewardService.processDailyLogin(user.id);
```
**Trigger**: When user authenticates
**Replacement**: Emit event from USER_AUTHENTICATED listener

## 📋 Implementation Plan

### Step 1: Create Reward Listener
- File: `backend/src/events/listeners/reward.listeners.js`
- Handlers:
  - `handleBattleFinished()` - Grant battle rewards
  - `handleUserAuthenticated()` - Process daily login rewards
  - `handleSubmissionCompleted()` - Grant problem rewards (optional)

### Step 2: Register Reward Listeners
- File: `backend/src/events/listeners/index.js`
- Register handlers for:
  - BATTLE_FINISHED → handleBattleFinished
  - USER_AUTHENTICATED → handleUserAuthenticated
  - SUBMISSION_COMPLETED → handleSubmissionCompleted (optional)

### Step 3: Remove Direct Calls
- Remove from `battle.service.js`: RewardService import and call
- Remove from `auth.controller.js`: RewardService calls (2 locations)

### Step 4: Verify Event Coverage
- BATTLE_FINISHED event already emitted ✅
- USER_AUTHENTICATED event already emitted ✅
- SUBMISSION_COMPLETED event already emitted ✅

## 🔄 Event Flow

### Before Phase 4 (Direct Calls)
```
Battle Service
  ├─ emit BATTLE_FINISHED event
  ├─ call RewardService.grantBattleRewards() (DIRECT)
  └─ return

Auth Controller
  ├─ authenticate user
  ├─ call RewardService.processDailyLogin() (DIRECT)
  └─ return token

Reward Listener
  └─ (not used yet)
```

### After Phase 4 (Event-Driven)
```
Battle Service
  ├─ emit BATTLE_FINISHED event
  └─ return

Auth Controller
  ├─ authenticate user
  ├─ emit USER_AUTHENTICATED event
  └─ return token

Reward Listener
  ├─ Handle BATTLE_FINISHED → Grant rewards
  └─ Handle USER_AUTHENTICATED → Process daily login
```

## 📝 Code Changes

### New File: reward.listeners.js
```javascript
import logger from '../../utils/logger.js';
import RewardService from '../../services/reward.service.js';

export async function handleBattleFinished(payload) {
  // Call RewardService.grantBattleRewards()
}

export async function handleUserAuthenticated(payload) {
  // Call RewardService.processDailyLogin()
}

export async function handleSubmissionCompleted(payload) {
  // Call RewardService.grantProblemRewards() (optional)
}
```

### Modified: listeners/index.js
```javascript
// Add reward listener registrations
eventBus.onEvent(EventTypes.BATTLE_FINISHED, RewardListeners.handleBattleFinished);
eventBus.onEvent(EventTypes.USER_AUTHENTICATED, RewardListeners.handleUserAuthenticated);
```

### Modified: battle.service.js
```javascript
// REMOVE: import RewardService
// REMOVE: await RewardService.grantBattleRewards(battleId);
```

### Modified: auth.controller.js
```javascript
// REMOVE: RewardService.processDailyLogin(user.id);
// (Already emitting USER_AUTHENTICATED event)
```

## ✅ Success Criteria

- [ ] No direct RewardService calls in codebase
- [ ] All reward logic in listeners
- [ ] BATTLE_FINISHED event triggers reward granting
- [ ] USER_AUTHENTICATED event triggers daily login rewards
- [ ] System behavior unchanged
- [ ] All tests pass

## 🧪 Testing

### Test 1: Battle Rewards
```bash
# Complete a battle
# Expected: Winner gets cores, loser gets participation reward
# Logs:
#   [Event] BATTLE_FINISHED emitted
#   [Reward] Battle rewards granted
#   [Event] REWARD_GRANTED emitted
#   [Notification] Reward notification sent
```

### Test 2: Daily Login Rewards
```bash
# Login to system
# Expected: Daily login reward granted, streak updated
# Logs:
#   [Event] USER_AUTHENTICATED emitted
#   [Reward] Daily login processed
#   [Event] REWARD_GRANTED emitted
#   [Notification] Daily reward notification sent
```

### Test 3: Achievement Unlocking
```bash
# Complete actions that trigger achievements
# Expected: Achievement unlocked, reward granted
# Logs:
#   [Reward] Achievement unlocked
#   [Event] ACHIEVEMENT_UNLOCKED emitted
#   [Notification] Achievement notification sent
```

## 📊 Event Handler Summary

| Event | Source | Listener | Action |
|-------|--------|----------|--------|
| BATTLE_FINISHED | battle.service.js | Reward | Grant battle rewards |
| USER_AUTHENTICATED | auth.controller.js | Reward | Process daily login |
| SUBMISSION_COMPLETED | worker.js | Reward | Grant problem rewards |

## 🔮 Next Steps

### After Phase 4
1. Deploy to staging
2. Run full system tests
3. Monitor reward logs
4. Verify all functionality

### Future Phases
- Phase 5: Contest Module Event-Driven Implementation
- Phase 6: Battle Module Refactoring
- Phase 7: Microservices Preparation

---

**Status**: 🚀 Ready for Implementation
**Date**: May 3, 2026
**Version**: 4.0.0
