module.exports = {
    apps: [
        {
            name: "codearena-api",
            script: "./src/server.js",
            instances: 1, // You can increase this if you want to run API in cluster mode
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "production",
                PORT: 4000
                // Ensure you have a .env file in the backend folder or provide variables here
            }
        },
        {
            name: "codearena-worker",
            script: "./worker/worker.js",
            instances: 1, // Worker handles concurrency internally with bullmq
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "production",
                WORKER_CONCURRENCY: 10,
                JUDGE_POOL_SIZE: 5 // Corresponds to number of warm containers
            }
        }
    ]
};
