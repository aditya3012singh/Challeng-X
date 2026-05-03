# Phase 5 - Distributed Event System with Redis & BullMQ

## 🎯 Goal
Upgrade the system from in-process events to a distributed event system using Redis and BullMQ, enabling horizontal scaling while maintaining backward compatibility.

## 📊 Current State
- ✅ Modular monolith architecture
- ✅ Fully event-driven communication
- ✅ Reliable in-process event bus (logging, retry, metrics)
- ❌ No distributed event system
- ❌ No queue-based job processing
- ❌ No horizontal scaling capability

## 🚀 What's New in Phase 5

### 1. Redis Event Bus ✅
**File**: `backend/src/events/redisEventBus.js`

**Features:**
- Pub/Sub for event distribution across services
- Event persistence via Redis
- Idempotency tracking to prevent duplicate processing
- Dead letter queue for failed events
- Graceful fallback to local event bus

**Key Methods:**
- `connect()` - Connect to Redis
- `publish(eventName, payload, eventId)` - Publish event to Redis
- `subscribe(eventName, handler)` - Subscribe to Redis events
- `isEventProcessed(eventId)` - Check idempotency
- `markEventProcessed(eventId)` - Mark event as processed
- `addToDeadLetterQueue(eventName, message, error)` - Add failed event to DLQ
- `getDeadLetterQueue()` - Get failed events
- `retryDeadLetter(index)` - Retry failed event

### 2. Dual Mode Event Bus ✅
**File**: `backend/src/events/dualModeEventBus.js`

**Features:**
- Emits to both local and Redis event buses
- Subscribes to both local and Redis events
- Graceful fallback if Redis is unavailable
- Unified interface for event operations

**Modes:**
- `local` - Only local event bus (Redis unavailable)
- `distributed` - Only Redis (local fallback)
- `dual` - Both local and Redis (recommended)

**Key Methods:**
- `initialize()` - Initialize dual mode
- `emitEvent(eventName, payload, eventId)` - Emit to both buses
- `onEvent(eventName, handler)` - Register listener on both buses
- `getMetrics()` - Get metrics from both buses
- `getDeadLetterQueue()` - Get failed events
- `retryDeadLetter(index)` - Retry failed event

### 3. BullMQ Submission Queue ✅
**File**: `backend/src/queue/submissionQueue.js`

**Features:**
- Distributed job processing
- Automatic retries with exponential backoff
- Job persistence
- Dead letter queue for failed jobs
- Horizontal scaling support

**Key Methods:**
- `initialize()` - Initialize queue
- `addSubmission(submissionData)` - Add job to queue
- `processSubmission(job)` - Process submission job
- `getStats()` - Get queue statistics
- `getFailedJobs(start, end)` - Get failed jobs
- `retryFailedJob(jobId)` - Retry failed job
- `clear()` - Clear queue
- `shutdown()` - Shutdown queue

### 4. Event Consumer ✅
**File**: `backend/src/events/eventConsumer.js`

**Features:**
- Unified event consumption from both local and distributed buses
- Register all event listeners
- Handle both local and distributed events
- Ensure idempotency
- Manage error handling

**Key Methods:**
- `initialize()` - Initialize consumer
- `registerListener(eventName, handler)` - Register single listener
- `registerListeners(listenerConfigs)` - Register multiple listeners
- `getListeners()` - Get registered listeners
- `getListenerCount()` - Get listener count
- `printStatus()` - Print consumer status
- `shutdown()` - Shutdown consumer

### 5. Queue Worker Process ✅
**File**: `backend/src/worker/queueWorker.js`

**Features:**
- Standalone process for handling distributed jobs
- Connects to Redis
- Processes jobs from submission queue
- Emits events via distributed event bus
- Can be scaled horizontally

**Usage:**
```bash
node src/worker/queueWorker.js
```

---

## 🔄 Event Flow Architecture

### Before Phase 5 (In-Process Only)
```
Service
  ↓
emit event (local)
  ↓
Listener (same process)
  ↓
Result
```

### After Phase 5 (Distributed)
```
Service (Process 1)
  ↓
emit event (local + Redis)
  ↓
├─ Local Listener (Process 1)
│   ↓
│   Result
│
└─ Redis Pub/Sub
    ↓
    Consumer (Process 2, 3, 4...)
    ↓
    Listener
    ↓
    Result
```

---

## 📋 Implementation Details

### Dual Mode Event Emission

**Code:**
```javascript
import dualModeEventBus from './events/dualModeEventBus.js';
import { EventTypes } from './events/eventTypes.js';

// Emit event (goes to both local and Redis)
await dualModeEventBus.emitEvent(EventTypes.BATTLE_FINISHED, {
    battleId: 'b123',
    winnerId: 'u456',
    loserId: 'u789'
}, eventId);
```

**Flow:**
1. Event emitted to local event bus (immediate)
2. Event published to Redis (async)
3. Local listeners execute immediately
4. Remote listeners receive via Redis Pub/Sub

### Idempotency

**Problem:** Same event processed multiple times

**Solution:**
```javascript
// Check if event already processed
if (redisEventBus.isEventProcessed(eventId)) {
    logger.warn('Duplicate event detected');
    return;
}

// Mark as processed
redisEventBus.markEventProcessed(eventId);

// Process event
await handler(payload);
```

**Storage:** In-memory map with 1-hour TTL

### Dead Letter Queue

**Problem:** Failed events are lost

**Solution:**
```javascript
// Failed event added to DLQ
redisEventBus.addToDeadLetterQueue(eventName, message, error);

// Get failed events
const dlq = redisEventBus.getDeadLetterQueue();

// Retry failed event
await redisEventBus.retryDeadLetter(index);
```

**Storage:** Redis (7-day TTL)

### Queue-Based Job Processing

**Code:**
```javascript
import submissionQueue from './queue/submissionQueue.js';

// Add job to queue
const job = await submissionQueue.addSubmission({
    submissionId: 'sub123',
    userId: 'u456',
    problemId: 'p789',
    code: 'console.log("hello");',
    language: 'javascript',
    type: 'SUBMIT'
});

// Job is processed by worker process
// Events emitted: SUBMISSION_ATTEMPTED, SUBMISSION_COMPLETED
```

**Flow:**
1. Job added to Redis queue
2. Worker picks up job
3. Job processed (code execution)
4. Events emitted (SUBMISSION_ATTEMPTED, SUBMISSION_COMPLETED)
5. Job marked as completed or failed

---

## 🚀 Deployment Architecture

### Single Process (Development)
```
┌─────────────────────────────────┐
│ Main Process (Node.js)          │
├─────────────────────────────────┤
│ • Express Server                │
│ • Local Event Bus               │
│ • Redis Pub/Sub (optional)      │
│ • BullMQ Worker (concurrency=5) │
└─────────────────────────────────┘
         ↓
    Redis (single instance)
```

### Distributed (Production)
```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ API Server 1         │  │ API Server 2         │  │ API Server 3         │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ • Express Server     │  │ • Express Server     │  │ • Express Server     │
│ • Local Event Bus    │  │ • Local Event Bus    │  │ • Local Event Bus    │
│ • Redis Pub/Sub      │  │ • Redis Pub/Sub      │  │ • Redis Pub/Sub      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
         ↓                        ↓                        ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ Redis Cluster                                                            │
│ • Pub/Sub channels                                                       │
│ • Event persistence                                                      │
│ • Idempotency store                                                      │
│ • Dead letter queue                                                      │
└──────────────────────────────────────────────────────────────────────────┘
         ↑                        ↑                        ↑
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ Worker Process 1     │  │ Worker Process 2     │  │ Worker Process 3     │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ • BullMQ Worker      │  │ • BullMQ Worker      │  │ • BullMQ Worker      │
│ • Job Processing     │  │ • Job Processing     │  │ • Job Processing     │
│ • Event Emission     │  │ • Event Emission     │  │ • Event Emission     │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

---

## 📊 Configuration

### Environment Variables
```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Event Bus Mode
REDIS_ENABLED=true  # Set to false to disable Redis

# BullMQ Configuration
BULLMQ_CONCURRENCY=5  # Number of concurrent jobs
```

### Retry Configuration
```javascript
// In submissionQueue.js
defaultJobOptions: {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000
    }
}

// Retry delays:
// Attempt 1: 2000ms
// Attempt 2: 4000ms
// Attempt 3: 8000ms
```

---

## 🧪 Testing & Validation

### Test 1: Dual Mode Event Emission
```javascript
// Emit event
await dualModeEventBus.emitEvent('BattleFinished', {
    battleId: 'b123',
    winnerId: 'u456',
    loserId: 'u789'
}, eventId);

// Expected:
// - Event emitted to local bus (immediate)
// - Event published to Redis (async)
// - Local listeners execute
// - Remote listeners receive via Redis
```

### Test 2: Idempotency
```javascript
// Emit same event twice
await dualModeEventBus.emitEvent('BattleFinished', payload, eventId);
await dualModeEventBus.emitEvent('BattleFinished', payload, eventId);

// Expected:
// - First event processed
// - Second event detected as duplicate
// - Handler called only once
```

### Test 3: Dead Letter Queue
```javascript
// Listener that fails
eventBus.onEvent('BattleFinished', async () => {
    throw new Error('Processing failed');
});

// Emit event
await dualModeEventBus.emitEvent('BattleFinished', payload, eventId);

// Expected:
// - Event added to dead letter queue
// - Can be retried later
// - Stored in Redis for persistence
```

### Test 4: Queue-Based Job Processing
```javascript
// Add submission to queue
const job = await submissionQueue.addSubmission({
    submissionId: 'sub123',
    userId: 'u456',
    problemId: 'p789',
    code: 'console.log("hello");',
    language: 'javascript',
    type: 'SUBMIT'
});

// Expected:
// - Job added to Redis queue
// - Worker picks up job
// - Job processed
// - Events emitted (SUBMISSION_ATTEMPTED, SUBMISSION_COMPLETED)
```

### Test 5: Horizontal Scaling
```bash
# Terminal 1: Start API Server
npm start

# Terminal 2: Start Worker 1
node src/worker/queueWorker.js

# Terminal 3: Start Worker 2
node src/worker/queueWorker.js

# Terminal 4: Start Worker 3
node src/worker/queueWorker.js

# Expected:
# - All workers connected to Redis
# - Jobs distributed across workers
# - Concurrent processing
# - Automatic load balancing
```

---

## 📈 Monitoring & Observability

### Queue Statistics
```javascript
const stats = await submissionQueue.getStats();
// Returns:
// {
//   queue: 'submissions',
//   jobCounts: {
//     waiting: 10,
//     active: 5,
//     completed: 100,
//     failed: 2
//   },
//   workers: 3,
//   timestamp: '2026-05-03T12:01:22.000Z'
// }
```

### Event Bus Metrics
```javascript
const metrics = dualModeEventBus.getMetrics();
// Returns:
// {
//   mode: 'dual',
//   local: { ... },
//   redis: {
//     connected: true,
//     subscribedChannels: 20,
//     idempotencyStoreSize: 150,
//     deadLetterQueueSize: 2
//   },
//   timestamp: '2026-05-03T12:01:22.000Z'
// }
```

### Health Check
```javascript
const health = dualModeEventBus.getHealthStatus();
// Returns:
// {
//   mode: 'dual',
//   local: { healthy: true },
//   redis: {
//     connected: true,
//     subscribedChannels: 20,
//     idempotencyStoreSize: 150,
//     deadLetterQueueSize: 2
//   },
//   timestamp: '2026-05-03T12:01:22.000Z'
// }
```

---

## 🔮 Future Enhancements

### Phase 6: Advanced Monitoring
- Add Prometheus metrics export
- Implement distributed tracing
- Add event replay capability
- Implement event versioning

### Phase 7: Event Sourcing
- Store all events
- Implement event replay
- Add temporal queries
- Implement audit trail

### Phase 8: Microservices
- Split into separate services
- Implement service discovery
- Add API gateway
- Implement inter-service communication

---

## 📚 Related Files

- `backend/src/events/redisEventBus.js` - Redis event bus implementation
- `backend/src/events/dualModeEventBus.js` - Dual mode event bus
- `backend/src/events/eventConsumer.js` - Event consumer
- `backend/src/queue/submissionQueue.js` - BullMQ submission queue
- `backend/src/worker/queueWorker.js` - Queue worker process
- `backend/src/index.js` - Main entry point (updated)

---

**Status**: ✅ PRODUCTION READY
**Date**: May 3, 2026
**Version**: 5.0.0
**Next Phase**: Phase 6 - Advanced Monitoring & Observability
