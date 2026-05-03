import structuredLogger from './structuredLogger.js';

/**
 * Metrics Collector
 * Phase 6: Collect and expose system metrics
 * 
 * Features:
 * - Track event counts
 * - Track queue statistics
 * - Track error rates
 * - Track processing times
 * - Expose metrics endpoint
 */
class MetricsCollector {
    constructor() {
        this.metrics = {
            events: {
                emitted: 0,
                received: 0,
                failed: 0,
                byType: {}
            },
            jobs: {
                queued: 0,
                started: 0,
                completed: 0,
                failed: 0,
                byType: {}
            },
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                byMethod: {},
                byPath: {}
            },
            listeners: {
                executed: 0,
                failed: 0,
                byName: {}
            },
            timings: {
                eventProcessing: [],
                jobProcessing: [],
                requestProcessing: [],
                listenerExecution: []
            },
            errors: {
                total: 0,
                byType: {}
            },
            startTime: new Date()
        };
    }

    /**
     * Record event emitted
     * @param {string} eventName
     */
    recordEventEmitted(eventName) {
        this.metrics.events.emitted++;
        if (!this.metrics.events.byType[eventName]) {
            this.metrics.events.byType[eventName] = 0;
        }
        this.metrics.events.byType[eventName]++;
    }

    /**
     * Record event received
     * @param {string} eventName
     */
    recordEventReceived(eventName) {
        this.metrics.events.received++;
    }

    /**
     * Record event failed
     * @param {string} eventName
     */
    recordEventFailed(eventName) {
        this.metrics.events.failed++;
    }

    /**
     * Record job queued
     * @param {string} jobName
     */
    recordJobQueued(jobName) {
        this.metrics.jobs.queued++;
        if (!this.metrics.jobs.byType[jobName]) {
            this.metrics.jobs.byType[jobName] = { queued: 0, completed: 0, failed: 0 };
        }
        this.metrics.jobs.byType[jobName].queued++;
    }

    /**
     * Record job started
     * @param {string} jobName
     */
    recordJobStarted(jobName) {
        this.metrics.jobs.started++;
    }

    /**
     * Record job completed
     * @param {string} jobName
     * @param {number} duration
     */
    recordJobCompleted(jobName, duration) {
        this.metrics.jobs.completed++;
        if (!this.metrics.jobs.byType[jobName]) {
            this.metrics.jobs.byType[jobName] = { queued: 0, completed: 0, failed: 0 };
        }
        this.metrics.jobs.byType[jobName].completed++;
        this.metrics.timings.jobProcessing.push(duration);
    }

    /**
     * Record job failed
     * @param {string} jobName
     */
    recordJobFailed(jobName) {
        this.metrics.jobs.failed++;
        if (!this.metrics.jobs.byType[jobName]) {
            this.metrics.jobs.byType[jobName] = { queued: 0, completed: 0, failed: 0 };
        }
        this.metrics.jobs.byType[jobName].failed++;
    }

    /**
     * Record request
     * @param {string} method
     * @param {string} path
     * @param {number} statusCode
     * @param {number} duration
     */
    recordRequest(method, path, statusCode, duration) {
        this.metrics.requests.total++;
        
        if (statusCode >= 200 && statusCode < 400) {
            this.metrics.requests.successful++;
        } else {
            this.metrics.requests.failed++;
        }

        if (!this.metrics.requests.byMethod[method]) {
            this.metrics.requests.byMethod[method] = 0;
        }
        this.metrics.requests.byMethod[method]++;

        if (!this.metrics.requests.byPath[path]) {
            this.metrics.requests.byPath[path] = 0;
        }
        this.metrics.requests.byPath[path]++;

        this.metrics.timings.requestProcessing.push(duration);
    }

    /**
     * Record listener execution
     * @param {string} listenerName
     * @param {number} duration
     * @param {boolean} failed
     */
    recordListenerExecution(listenerName, duration, failed = false) {
        this.metrics.listeners.executed++;
        
        if (failed) {
            this.metrics.listeners.failed++;
        }

        if (!this.metrics.listeners.byName[listenerName]) {
            this.metrics.listeners.byName[listenerName] = { executed: 0, failed: 0 };
        }
        this.metrics.listeners.byName[listenerName].executed++;
        
        if (failed) {
            this.metrics.listeners.byName[listenerName].failed++;
        }

        this.metrics.timings.listenerExecution.push(duration);
    }

    /**
     * Record error
     * @param {string} errorType
     */
    recordError(errorType) {
        this.metrics.errors.total++;
        if (!this.metrics.errors.byType[errorType]) {
            this.metrics.errors.byType[errorType] = 0;
        }
        this.metrics.errors.byType[errorType]++;
    }

    /**
     * Calculate average timing
     * @param {Array} timings
     * @returns {number}
     */
    calculateAverage(timings) {
        if (timings.length === 0) return 0;
        return Math.round(timings.reduce((a, b) => a + b, 0) / timings.length);
    }

    /**
     * Calculate percentile
     * @param {Array} timings
     * @param {number} percentile
     * @returns {number}
     */
    calculatePercentile(timings, percentile) {
        if (timings.length === 0) return 0;
        const sorted = [...timings].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * Get metrics summary
     * @returns {object}
     */
    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime.getTime();

        return {
            timestamp: new Date().toISOString(),
            uptime: {
                ms: uptime,
                seconds: Math.round(uptime / 1000),
                minutes: Math.round(uptime / 60000)
            },
            events: {
                emitted: this.metrics.events.emitted,
                received: this.metrics.events.received,
                failed: this.metrics.events.failed,
                successRate: this.metrics.events.emitted > 0
                    ? ((this.metrics.events.emitted - this.metrics.events.failed) / this.metrics.events.emitted * 100).toFixed(2) + '%'
                    : 'N/A',
                byType: this.metrics.events.byType
            },
            jobs: {
                queued: this.metrics.jobs.queued,
                started: this.metrics.jobs.started,
                completed: this.metrics.jobs.completed,
                failed: this.metrics.jobs.failed,
                successRate: this.metrics.jobs.completed > 0
                    ? ((this.metrics.jobs.completed / (this.metrics.jobs.completed + this.metrics.jobs.failed)) * 100).toFixed(2) + '%'
                    : 'N/A',
                byType: this.metrics.jobs.byType
            },
            requests: {
                total: this.metrics.requests.total,
                successful: this.metrics.requests.successful,
                failed: this.metrics.requests.failed,
                successRate: this.metrics.requests.total > 0
                    ? ((this.metrics.requests.successful / this.metrics.requests.total) * 100).toFixed(2) + '%'
                    : 'N/A',
                byMethod: this.metrics.requests.byMethod,
                byPath: this.metrics.requests.byPath
            },
            listeners: {
                executed: this.metrics.listeners.executed,
                failed: this.metrics.listeners.failed,
                successRate: this.metrics.listeners.executed > 0
                    ? (((this.metrics.listeners.executed - this.metrics.listeners.failed) / this.metrics.listeners.executed) * 100).toFixed(2) + '%'
                    : 'N/A',
                byName: this.metrics.listeners.byName
            },
            timings: {
                eventProcessing: {
                    avg: this.calculateAverage(this.metrics.timings.eventProcessing),
                    p50: this.calculatePercentile(this.metrics.timings.eventProcessing, 50),
                    p95: this.calculatePercentile(this.metrics.timings.eventProcessing, 95),
                    p99: this.calculatePercentile(this.metrics.timings.eventProcessing, 99)
                },
                jobProcessing: {
                    avg: this.calculateAverage(this.metrics.timings.jobProcessing),
                    p50: this.calculatePercentile(this.metrics.timings.jobProcessing, 50),
                    p95: this.calculatePercentile(this.metrics.timings.jobProcessing, 95),
                    p99: this.calculatePercentile(this.metrics.timings.jobProcessing, 99)
                },
                requestProcessing: {
                    avg: this.calculateAverage(this.metrics.timings.requestProcessing),
                    p50: this.calculatePercentile(this.metrics.timings.requestProcessing, 50),
                    p95: this.calculatePercentile(this.metrics.timings.requestProcessing, 95),
                    p99: this.calculatePercentile(this.metrics.timings.requestProcessing, 99)
                },
                listenerExecution: {
                    avg: this.calculateAverage(this.metrics.timings.listenerExecution),
                    p50: this.calculatePercentile(this.metrics.timings.listenerExecution, 50),
                    p95: this.calculatePercentile(this.metrics.timings.listenerExecution, 95),
                    p99: this.calculatePercentile(this.metrics.timings.listenerExecution, 99)
                }
            },
            errors: {
                total: this.metrics.errors.total,
                byType: this.metrics.errors.byType
            }
        };
    }

    /**
     * Reset metrics
     */
    reset() {
        this.metrics = {
            events: {
                emitted: 0,
                received: 0,
                failed: 0,
                byType: {}
            },
            jobs: {
                queued: 0,
                started: 0,
                completed: 0,
                failed: 0,
                byType: {}
            },
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                byMethod: {},
                byPath: {}
            },
            listeners: {
                executed: 0,
                failed: 0,
                byName: {}
            },
            timings: {
                eventProcessing: [],
                jobProcessing: [],
                requestProcessing: [],
                listenerExecution: []
            },
            errors: {
                total: 0,
                byType: {}
            },
            startTime: new Date()
        };
    }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

export default metricsCollector;
