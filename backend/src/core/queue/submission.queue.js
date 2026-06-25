import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import env from '../config/env.js';

const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 50, 2000),
};

// Support both REDIS_URL and individual host/port config
const connection = env.REDIS_URL
    ? new IORedis(env.REDIS_URL.trim(), redisOptions)
    : new IORedis({
        ...redisOptions,
        host: env.REDIS_HOST || 'localhost',
        port: env.REDIS_PORT || 6379,
        password: env.REDIS_PASSWORD || undefined,
    });

connection.on('error', (err) => {
    console.error('[SubmissionQueue] Redis connection error:', err.message);
});

export const submissionQueue = new Queue('submissionQueue', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    }
});
