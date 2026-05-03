# Phase 4 - Event System Reliability - Examples & Testing Guide

## 🧪 Testing Scenarios

### Test 1: Basic Event Emission and Logging

**Code:**
```javascript
import eventBus from './events/eventBus.js';
import { EventTypes } from './events/eventTypes.js';

// Emit a battle finished event
eventBus.emitEvent(EventTypes.BATTLE_FINISHED, {
    battleId: 'b123',
    winnerId: 'u456',
    loserId: 'u789',
    problemId: 'p999',
    difficulty: 'HARD',
    duration: 45000,
    player1Attempts: 3,
    player2Attempts: 2
});
```

**Expected Logs:**
```
[EventBus] 📤 Emitting: BattleFinished
  eventId: evt_1714761682000_a1b2c3d4e
  timestamp: 2026-05-03T12:01:22.000Z
  payloadKeys: battleId, winnerId, loserId, problemId, difficulty, duration, player1Attempts, player2Attempts
  payloadSize: 245

[EventBus] ✅ Listener completed: BattleFinished (handleBattleFinished)
  eventId: evt_1714761682000_a1b2c3d4e
  executionTimeMs: 45
  retries: 0

[EventBus] ✅ Listener completed: BattleFinished (handleNotification)
  eventId: evt_1714761682000_a1b2c3d4e
  executionTimeMs: 12
  retries: 0

[EventBus] ✅ Listener completed: BattleFinished (handleSocket)
  eventId: evt_1714761682000_a1b2c3d4e
  executionTimeMs: 8
  retries: 0
```

---

### Test 2: Error Isolation

**Code:**
```javascript
import eventBus from './events/eventBus.js';

// Listener 1: Will fail
eventBus.onEvent('TestEvent', async () => {
    throw new Error('Listener 1 failed');
});

// Listener 2: Will succeed
eventBus.onEvent('TestEvent', async () => {
    console.log('Listener 2 executed successfully');
});

// Listener 3: Will succeed
eventBus.onEvent('TestEvent', async () => {
    console.log('Listener 3 executed successfully');
});

// Emit event
eventBus.emitEvent('TestEvent', { testData: 'value' });
```

**Expected Logs:**
```
[EventBus] 📤 Emitting: TestEvent
  eventId: evt_1714761682000_a1b2c3d4e
  timestamp: 2026-05-03T12:01:22.000Z
  payloadKeys: testData
  payloadSize: 20

[EventBus] ❌ Listener failed (no more retries): TestEvent (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  error: Listener 1 failed
  executionTimeMs: 5
  retryCount: 0
  stack: [full stack trace]

[EventBus] ✅ Listener completed: TestEvent (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  executionTimeMs: 2
  retries: 0

Listener 2 executed successfully

[EventBus] ✅ Listener completed: TestEvent (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  executionTimeMs: 1
  retries: 0

Listener 3 executed successfully
```

**Key Point**: Listener 1 failed, but Listeners 2 and 3 still executed successfully. Error was isolated.

---

### Test 3: Retry Mechanism with Exponential Backoff

**Code:**
```javascript
import eventBus from './events/eventBus.js';

let attempts = 0;

// Listener that fails twice, then succeeds
eventBus.onEvent('BattleFinished', async () => {
    attempts++;
    console.log(`Attempt ${attempts}`);
    
    if (attempts < 3) {
        throw new Error('Temporary database error');
    }
    
    console.log('Success on attempt 3!');
});

// Emit critical event (will retry)
eventBus.emitEvent('BattleFinished', {
    battleId: 'b123',
    winnerId: 'u456',
    loserId: 'u789'
});
```

**Expected Logs:**
```
[EventBus] 📤 Emitting: BattleFinished
  eventId: evt_1714761682000_a1b2c3d4e
  timestamp: 2026-05-03T12:01:22.000Z
  payloadKeys: battleId, winnerId, loserId
  payloadSize: 60

Attempt 1

[EventBus] ⚠️ Listener failed, retrying: BattleFinished (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  error: Temporary database error
  executionTimeMs: 5
  retryCount: 1
  backoffDelayMs: 100

Attempt 2

[EventBus] ⚠️ Listener failed, retrying: BattleFinished (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  error: Temporary database error
  executionTimeMs: 4
  retryCount: 2
  backoffDelayMs: 200

Attempt 3

Success on attempt 3!

[EventBus] ✅ Listener completed: BattleFinished (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  executionTimeMs: 3
  retries: 2
```

**Key Point**: Event failed twice, retried with exponential backoff (100ms, 200ms), then succeeded.

---

### Test 4: Event Validation

**Code:**
```javascript
import eventBus from './events/eventBus.js';

// Valid event
eventBus.emitEvent('BattleFinished', {
    battleId: 'b123',
    winnerId: 'u456',
    loserId: 'u789'
});

// Invalid: empty event name
eventBus.emitEvent('', { battleId: 'b123' });

// Invalid: null payload
eventBus.emitEvent('BattleFinished', null);

// Invalid: empty payload (warning only)
eventBus.emitEvent('BattleFinished', {});
```

**Expected Logs:**
```
[EventBus] 📤 Emitting: BattleFinished
  eventId: evt_1714761682000_a1b2c3d4e
  timestamp: 2026-05-03T12:01:22.000Z
  payloadKeys: battleId, winnerId, loserId
  payloadSize: 60

[EventBus] ❌ Event validation failed: 
  error: Invalid event name

[EventBus] ❌ Event validation failed: 
  error: Invalid payload for event: BattleFinished

[EventBus] ⚠️ Empty payload for event: BattleFinished

[EventBus] 📤 Emitting: BattleFinished
  eventId: evt_1714761682000_a1b2c3d4f
  timestamp: 2026-05-03T12:01:22.100Z
  payloadKeys: 
  payloadSize: 2
```

---

### Test 5: Metrics Tracking

**Code:**
```javascript
import eventBus from './events/eventBus.js';
import { EventTypes } from './events/eventTypes.js';

// Emit multiple events
for (let i = 0; i < 100; i++) {
    eventBus.emitEvent(EventTypes.BATTLE_FINISHED, {
        battleId: `b${i}`,
        winnerId: `u${i}`,
        loserId: `u${i+1}`,
        problemId: `p${i}`,
        difficulty: 'HARD',
        duration: 45000,
        player1Attempts: 3,
        player2Attempts: 2
    });
}

// Print metrics
eventBus.printMetricsSummary();

// Get metrics object
const metrics = eventBus.getMetrics();
console.log('Metrics:', JSON.stringify(metrics, null, 2));
```

**Expected Output:**
```
============================================================
📊 EVENT BUS METRICS SUMMARY
============================================================
Total Events Emitted: 100
Total Listener Executions: 300
Failed Executions: 0
Total Retries: 0
Success Rate: 100.00%

📈 EXECUTION TIMINGS (ms):
  BattleFinished: avg=45ms, min=12ms, max=234ms (300 executions)

============================================================

Metrics: {
  "summary": {
    "totalEventsEmitted": 100,
    "totalListenerExecutions": 300,
    "failedListenerExecutions": 0,
    "totalRetries": 0,
    "successRate": "100.00%"
  },
  "timings": {
    "BattleFinished": {
      "count": 300,
      "avgMs": 45,
      "minMs": 12,
      "maxMs": 234
    }
  },
  "errors": {}
}
```

---

### Test 6: Debug Mode

**Code:**
```bash
EVENT_DEBUG=true npm start
```

**Then emit an event:**
```javascript
eventBus.emitEvent('BattleFinished', {
    battleId: 'b123',
    winnerId: 'u456',
    loserId: 'u789',
    problemId: 'p999',
    difficulty: 'HARD',
    duration: 45000,
    player1Attempts: 3,
    player2Attempts: 2
});
```

**Expected Debug Logs:**
```
[EventBus] 📤 Emitting: BattleFinished
  eventId: evt_1714761682000_a1b2c3d4e
  timestamp: 2026-05-03T12:01:22.000Z
  payloadKeys: battleId, winnerId, loserId, problemId, difficulty, duration, player1Attempts, player2Attempts
  payloadSize: 245

[EventBus] 🔍 DEBUG - Full payload for BattleFinished:
{
  battleId: 'b123',
  winnerId: 'u456',
  loserId: 'u789',
  problemId: 'p999',
  difficulty: 'HARD',
  duration: 45000,
  player1Attempts: 3,
  player2Attempts: 2
}

[EventBus] 🔍 DEBUG - Processing event: BattleFinished
  eventId: evt_1714761682000_a1b2c3d4e
  handlerName: handleBattleFinished

[EventBus] 🔍 DEBUG - Handler result for BattleFinished:
{
  success: true,
  retries: 0
}

[EventBus] ✅ Listener completed: BattleFinished (handleBattleFinished)
  eventId: evt_1714761682000_a1b2c3d4e
  executionTimeMs: 45
  retries: 0
```

---

### Test 7: Payload Sanitization

**Code:**
```javascript
import eventBus from './events/eventBus.js';

// Event with sensitive data
eventBus.emitEvent('UserAuthenticated', {
    userId: 'u123',
    username: 'john_doe',
    email: 'john@example.com',
    password: 'secret123',
    token: 'jwt_token_here',
    apiKey: 'api_key_secret'
});
```

**Expected Logs (sanitized):**
```
[EventBus] 📤 Emitting: UserAuthenticated
  eventId: evt_1714761682000_a1b2c3d4e
  timestamp: 2026-05-03T12:01:22.000Z
  payloadKeys: userId, username, email, password, token, apiKey
  payloadSize: 150

[EventBus] 🔍 DEBUG - Full payload for UserAuthenticated:
{
  userId: 'u123',
  username: 'john_doe',
  email: 'john@example.com',
  password: '[REDACTED]',
  token: '[REDACTED]',
  apiKey: '[REDACTED]'
}
```

**Key Point**: Sensitive fields are automatically redacted in logs.

---

### Test 8: Multiple Listeners with Different Performance

**Code:**
```javascript
import eventBus from './events/eventBus.js';

// Fast listener
eventBus.onEvent('BattleFinished', async () => {
    // Simulate fast operation (10ms)
    await new Promise(resolve => setTimeout(resolve, 10));
});

// Medium listener
eventBus.onEvent('BattleFinished', async () => {
    // Simulate medium operation (50ms)
    await new Promise(resolve => setTimeout(resolve, 50));
});

// Slow listener
eventBus.onEvent('BattleFinished', async () => {
    // Simulate slow operation (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));
});

// Emit event
eventBus.emitEvent('BattleFinished', {
    battleId: 'b123',
    winnerId: 'u456',
    loserId: 'u789'
});

// Wait for all listeners to complete
setTimeout(() => {
    eventBus.printMetricsSummary();
}, 500);
```

**Expected Output:**
```
============================================================
📊 EVENT BUS METRICS SUMMARY
============================================================
Total Events Emitted: 1
Total Listener Executions: 3
Failed Executions: 0
Total Retries: 0
Success Rate: 100.00%

📈 EXECUTION TIMINGS (ms):
  BattleFinished: avg=87ms, min=10ms, max=200ms (3 executions)

============================================================
```

---

### Test 9: Listener Timeout

**Code:**
```javascript
import eventBus from './events/eventBus.js';

// Listener that hangs (exceeds 30s timeout)
eventBus.onEvent('BattleFinished', async () => {
    // Simulate hanging operation
    await new Promise(resolve => setTimeout(resolve, 35000));
});

// Emit event
eventBus.emitEvent('BattleFinished', {
    battleId: 'b123',
    winnerId: 'u456',
    loserId: 'u789'
});
```

**Expected Logs:**
```
[EventBus] 📤 Emitting: BattleFinished
  eventId: evt_1714761682000_a1b2c3d4e
  timestamp: 2026-05-03T12:01:22.000Z
  payloadKeys: battleId, winnerId, loserId
  payloadSize: 60

[EventBus] ⚠️ Listener failed, retrying: BattleFinished (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  error: Handler timeout after 30s
  executionTimeMs: 30000
  retryCount: 1
  backoffDelayMs: 100

[EventBus] ⚠️ Listener failed, retrying: BattleFinished (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  error: Handler timeout after 30s
  executionTimeMs: 30000
  retryCount: 2
  backoffDelayMs: 200

[EventBus] ❌ Listener failed (no more retries): BattleFinished (anonymous)
  eventId: evt_1714761682000_a1b2c3d4e
  error: Handler timeout after 30s
  executionTimeMs: 30000
  retryCount: 3
```

**Key Point**: Listener timeout is treated as failure and triggers retries.

---

### Test 10: Metrics Reset

**Code:**
```javascript
import eventBus from './events/eventBus.js';

// Emit some events
eventBus.emitEvent('BattleFinished', { battleId: 'b1', winnerId: 'u1', loserId: 'u2' });
eventBus.emitEvent('BattleFinished', { battleId: 'b2', winnerId: 'u3', loserId: 'u4' });

// Print metrics
console.log('Before reset:');
eventBus.printMetricsSummary();

// Reset metrics
eventBus.resetMetrics();

// Print metrics again
console.log('After reset:');
eventBus.printMetricsSummary();
```

**Expected Output:**
```
Before reset:
============================================================
📊 EVENT BUS METRICS SUMMARY
============================================================
Total Events Emitted: 2
Total Listener Executions: 6
Failed Executions: 0
Total Retries: 0
Success Rate: 100.00%

📈 EXECUTION TIMINGS (ms):
  BattleFinished: avg=45ms, min=12ms, max=78ms (6 executions)

============================================================

[EventBus] 🔄 Metrics reset

After reset:
============================================================
📊 EVENT BUS METRICS SUMMARY
============================================================
Total Events Emitted: 0
Total Listener Executions: 0
Failed Executions: 0
Total Retries: 0
Success Rate: N/A

============================================================
```

---

## 🎯 Integration Testing Checklist

- [ ] Test 1: Basic event emission and logging
- [ ] Test 2: Error isolation
- [ ] Test 3: Retry mechanism with exponential backoff
- [ ] Test 4: Event validation
- [ ] Test 5: Metrics tracking
- [ ] Test 6: Debug mode
- [ ] Test 7: Payload sanitization
- [ ] Test 8: Multiple listeners with different performance
- [ ] Test 9: Listener timeout
- [ ] Test 10: Metrics reset

---

## 🚀 Performance Testing

### Load Test: 1000 Events

**Code:**
```javascript
import eventBus from './events/eventBus.js';

const startTime = Date.now();

for (let i = 0; i < 1000; i++) {
    eventBus.emitEvent('BattleFinished', {
        battleId: `b${i}`,
        winnerId: `u${i}`,
        loserId: `u${i+1}`,
        problemId: `p${i}`,
        difficulty: 'HARD',
        duration: 45000,
        player1Attempts: 3,
        player2Attempts: 2
    });
}

const endTime = Date.now();
const duration = endTime - startTime;

console.log(`Emitted 1000 events in ${duration}ms`);
console.log(`Average: ${(duration / 1000).toFixed(2)}ms per event`);

eventBus.printMetricsSummary();
```

**Expected Performance:**
- Total time: < 5 seconds
- Average per event: < 5ms
- Success rate: 100%

---

## 📊 Monitoring Checklist

- [ ] Monitor event emission rate
- [ ] Monitor listener execution times
- [ ] Monitor failure rate
- [ ] Monitor retry rate
- [ ] Monitor error types
- [ ] Monitor memory usage
- [ ] Monitor CPU usage

---

**Status**: ✅ TESTING GUIDE COMPLETE
**Date**: May 3, 2026
**Version**: 4.2.0
