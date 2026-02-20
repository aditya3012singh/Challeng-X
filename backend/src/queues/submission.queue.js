import {Queue} from 'bullmq';
import IORedis from 'ioredis';

const connection= new IORedis(process.env.REDIS_URL);


export const submissionQueue = new Queue('submissionQueue', {
    connection,
    defaultJobOptions:{
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000, // 5 seconds
        },
        removeOnComplete: true,
        removeOnFail: false,
    }
});