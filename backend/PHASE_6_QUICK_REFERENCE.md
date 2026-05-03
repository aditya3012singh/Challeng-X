# Phase 6: Observability - Quick Reference

## Endpoints

### Metrics Endpoint
```bash
GET /api/metrics
```
Returns: Event counts, job statistics, request metrics, error rates

### Health Check Endpoint
```bash
GET /api/health-check
```
Returns: Redis, queue, and database health status

## Trace ID Flow

```
Request → traceIdMiddleware → req.traceId
                                    ↓
                            Event emitted with traceId
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            Local listener                  Redis listener
            (with traceId)                  (with traceId)
                    ↓                               ↓
            Job queued with traceId
                    ↓
            Worker processes with traceId
                    ↓
            Response sent with X-Trace-ID header
```

## Structured Logger Methods

```javascript
import structuredLogger from './utils/structuredLogger.js';

// Request logging
structuredLogger.logRequestStart(traceId, method, path, metadata);
structuredLogger.logRequestEnd(traceId, statusCode, duration, metadata);

// Event logging
structuredLogger.logEventEmitted(traceId, eventName, eventId, metadata);
structuredLogger.logEventReceived(traceId, eventName, eventId, metadata);
structuredLogger.logListenerExecution(traceId, eventName, listenerName, duration, metadata);

// Job logging
structuredLogger.logJobQueued(traceId, jobId, jobName, metadata);
structuredLogger.logJobStarted(traceId, jobId, jobName, metadata);
structuredLogger.logJobCompleted(traceId, jobId, jobName, duration, metadata);
structuredLogger.logJobFailed(traceId, jobId, jobName, error, metadata);

// Error logging
structuredLogger.logError(traceId, message, error, metadata);

// Metrics logging
structuredLogger.logMetric(traceId, metricName, value, unit, metadata);

// Event flow chain
structuredLogger.logEventFlowChain(traceId, chain);
```

## Metrics Collector Methods

```javascript
import metricsCollector from './utils/metricsCollector.js';

// Event metrics
metricsCollector.recordEventEmitted(eventName);
metricsCollector.recordEventReceived(eventName);
metricsCollector.recordEventFailed(eventName);

// Job metrics
metricsCollector.recordJobQueued(jobName);
metricsCollector.recordJobStarted(jobName);
metricsCollector.recordJobCompleted(jobName, duration);
metricsCollector.recordJobFailed(jobName);

// Request metrics
metricsCollector.recordRequest(method, path, statusCode, duration);

// Listener metrics
metricsCollector.recordListenerExecution(listenerName, duration, failed);

// Error metrics
metricsCollector.recordError(errorType);

// Get all metrics
const metrics = metricsCollector.getMetrics();

// Reset metrics
metricsCollector.reset();
```

## Health Check Methods

```javascript
import healthCheckService from './utils/healthCheck.js';

// Get overall health status
const health = await healthCheckService.getHealthStatus();

// Get last health check
const lastCheck = healthCheckService.getLastCheck();

// Individual checks
const redisHealth = await healthCheckService.checkRedis();
const queueHealth = await healthCheckService.checkQueue();
const dbHealth = await healthCheckService.checkDatabase();
```

## Trace ID Middleware

```javascript
import { traceIdMiddleware, withTraceId, createEventTraceContext, createJobTraceContext } from './middleware/traceIdMiddleware.js';

// Middleware automatically adds traceId to req.traceId
app.use(traceIdMiddleware);

// In route handlers
app.post('/api/battle/create', (req, res) => {
    const traceId = req.traceId; // Available automatically
    // Use traceId in logging and event emissions
});

// For async operations
await withTraceId(req.traceId, async (traceId) => {
    // traceId available in this scope
});

// Create trace context for events
const eventContext = createEventTraceContext(req.traceId, 'BATTLE_CREATED');
// Returns: { traceId, eventName, eventId, timestamp }

// Create trace context for jobs
const jobContext = createJobTraceContext(req.traceId, 'process-submission');
// Returns: { traceId, jobName, jobId, timestamp }
```

## Example: Complete Request Flow

```javascript
// 1. Request arrives with trace ID
app.post('/api/battle/create', async (req, res) => {
    const traceId = req.traceId;
    
    // 2. Log request start
    structuredLogger.logRequestStart(traceId, 'POST', '/api/battle/create', {
        userId: req.user.id
    });
    
    try {
        // 3. Create battle
        const battle = await battleService.createBattle(req.body);
        
        // 4. Emit event with trace ID
        await dualModeEventBus.emitEvent(
            EventTypes.BATTLE_CREATED,
            { battleId: battle.id, ...battle },
            traceId
        );
        
        // 5. Record metrics
        metricsCollector.recordRequest('POST', '/api/battle/create', 200, duration);
        
        // 6. Log request end
        structuredLogger.logRequestEnd(traceId, 200, duration, {
            battleId: battle.id
        });
        
        // 7. Send response with trace ID header
        res.status(200).json({
            status: 'success',
            data: battle,
            traceId // Include in response
        });
    } catch (error) {
        // 8. Log error with trace ID
        structuredLogger.logError(traceId, 'Failed to create battle', error, {
            userId: req.user.id
        });
        
        metricsCollector.recordError('BattleCreationError');
        res.status(500).json({ error: error.message, traceId });
    }
});

// 9. Event listener receives event with trace ID
eventBus.onEvent(EventTypes.BATTLE_CREATED, async (payload, traceId) => {
    const startTime = Date.now();
    
    try {
        // 10. Log listener execution
        structuredLogger.logListenerExecution(
            traceId,
            EventTypes.BATTLE_CREATED,
            'handleBattleCreated',
            0,
            { battleId: payload.battleId }
        );
        
        // 11. Process event
        await profileService.updateBattleStats(payload.battleId);
        
        const duration = Date.now() - startTime;
        
        // 12. Record listener metrics
        metricsCollector.recordListenerExecution('handleBattleCreated', duration, false);
        
        // 13. Log completion
        structuredLogger.logListenerExecution(
            traceId,
            EventTypes.BATTLE_CREATED,
            'handleBattleCreated',
            duration,
            { battleId: payload.battleId }
        );
    } catch (error) {
        // 14. Log listener error
        structuredLogger.logError(
            traceId,
            'Error in handleBattleCreated',
            error,
            { battleId: payload.battleId }
        );
        
        metricsCollector.recordError('ListenerExecutionError');
    }
});

// 15. Job queued with trace ID
await submissionQueue.addSubmission({
    submissionId: 'sub_123',
    userId: 'user_456',
    traceId: traceId, // Propagate trace ID
    ...
});

// 16. Worker processes job with trace ID
async function processSubmission(job) {
    const traceId = job.data.traceId;
    
    // 17. Log job start
    structuredLogger.logJobStarted(traceId, job.id, 'process-submission', {
        submissionId: job.data.submissionId
    });
    
    try {
        // 18. Process job
        const result = await executeSubmission(job.data);
        
        const duration = Date.now() - startTime;
        
        // 19. Log job completion
        structuredLogger.logJobCompleted(traceId, job.id, 'process-submission', duration, {
            submissionId: job.data.submissionId,
            status: result.status
        });
        
        // 20. Record job metrics
        metricsCollector.recordJobCompleted('process-submission', duration);
        
        return result;
    } catch (error) {
        // 21. Log job failure
        structuredLogger.logJobFailed(
            traceId,
            job.id,
            'process-submission',
            error.message,
            { submissionId: job.data.submissionId }
        );
        
        metricsCollector.recordJobFailed('process-submission');
        throw error;
    }
}
```

## Monitoring Dashboard Queries

### Event Metrics
```javascript
const metrics = metricsCollector.getMetrics();
console.log(`Events emitted: ${metrics.events.emitted}`);
console.log(`Events failed: ${metrics.events.failed}`);
console.log(`Success rate: ${((metrics.events.emitted - metrics.events.failed) / metrics.events.emitted * 100).toFixed(2)}%`);
```

### Job Metrics
```javascript
const metrics = metricsCollector.getMetrics();
console.log(`Jobs queued: ${metrics.jobs.queued}`);
console.log(`Jobs completed: ${metrics.jobs.completed}`);
console.log(`Jobs failed: ${metrics.jobs.failed}`);
console.log(`Average duration: ${metrics.jobs.avgDuration}ms`);
console.log(`Failure rate: ${(metrics.jobs.failed / (metrics.jobs.completed + metrics.jobs.failed) * 100).toFixed(2)}%`);
```

### Request Metrics
```javascript
const metrics = metricsCollector.getMetrics();
console.log(`Total requests: ${metrics.requests.total}`);
console.log(`Average duration: ${metrics.requests.avgDuration}ms`);
console.log(`P95 duration: ${metrics.requests.p95}ms`);
console.log(`P99 duration: ${metrics.requests.p99}ms`);
```

### Health Status
```javascript
const health = await healthCheckService.getHealthStatus();
console.log(`Overall status: ${health.status}`);
console.log(`Redis: ${health.checks.redis.status}`);
console.log(`Queue: ${health.checks.queue.status}`);
console.log(`Database: ${health.checks.database.status}`);
```

## Debugging with Trace IDs

### Find all logs for a trace ID
```bash
# In log aggregation system (e.g., ELK)
GET /logs?traceId=trace_abc123
```

### Follow event flow
```bash
# Get all events for a trace ID
GET /logs?traceId=trace_abc123&message=EVENT_*
```

### Track job execution
```bash
# Get all job logs for a trace ID
GET /logs?traceId=trace_abc123&message=JOB_*
```

## Performance Monitoring

### Identify slow requests
```javascript
const metrics = metricsCollector.getMetrics();
const slowRequests = metrics.requests.byPath
    .filter(r => r.avgDuration > 1000)
    .sort((a, b) => b.avgDuration - a.avgDuration);
```

### Identify slow listeners
```javascript
const metrics = metricsCollector.getMetrics();
const slowListeners = metrics.listeners.byName
    .filter(l => l.avgDuration > 100)
    .sort((a, b) => b.avgDuration - a.avgDuration);
```

### Identify slow jobs
```javascript
const metrics = metricsCollector.getMetrics();
const slowJobs = metrics.jobs.byName
    .filter(j => j.avgDuration > 5000)
    .sort((a, b) => b.avgDuration - a.avgDuration);
```

## Troubleshooting

### High error rate
1. Check `/api/health-check` for component failures
2. Review error logs: `GET /logs?level=ERROR`
3. Check metrics: `GET /api/metrics` for error breakdown

### Slow requests
1. Check request metrics: `GET /api/metrics`
2. Identify slow endpoints
3. Review listener execution times
4. Check job processing times

### Queue backlog
1. Check queue health: `GET /api/health-check`
2. Review job metrics: `GET /api/metrics`
3. Check worker status
4. Review dead letter queue

### Redis issues
1. Check Redis health: `GET /api/health-check`
2. Review Redis connection logs
3. Check idempotency store size
4. Review dead letter queue size
