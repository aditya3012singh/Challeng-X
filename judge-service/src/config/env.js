import dotenv from 'dotenv';

dotenv.config();

export default {
    // gRPC
    JUDGE_GRPC_PORT: parseInt(process.env.JUDGE_GRPC_PORT || '50051'),

    // Container Pool
    JUDGE_POOL_SIZE: parseInt(process.env.JUDGE_POOL_SIZE || '2'),

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    // Container memory limit
    CONTAINER_MEMORY_LIMIT: process.env.CONTAINER_MEMORY_LIMIT || '256m',

    // Runners Path on Host (for Docker-out-of-Docker sibling mounts)
    CODEARENA_RUNNERS_PATH: process.env.CODEARENA_RUNNERS_PATH || '/runners',
};

