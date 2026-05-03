import dotenv from 'dotenv';

dotenv.config();

export default {
    // Service
    JUDGE_SERVICE_PORT: process.env.JUDGE_SERVICE_PORT || 3001,
    JUDGE_SERVICE_NAME: process.env.JUDGE_SERVICE_NAME || 'judge-service',
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Redis
    REDIS_URL: process.env.REDIS_URL,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    // Judge
    JUDGE_POOL_SIZE: parseInt(process.env.JUDGE_POOL_SIZE || '4'),
    JUDGE_TIMEOUT_MS: parseInt(process.env.JUDGE_TIMEOUT_MS || '60000'),
    CODEARENA_RUNNERS_PATH: process.env.CODEARENA_RUNNERS_PATH || '../runners',

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
