module.exports = {
    apps: [
        {
            name: "codearena-api",
            script: "./src/index.js",
            instances: 1, // Scale across available CPU cores in OCI Ampere A1
            exec_mode: "fork", // Enables PM2 load balancing between Node.js instances
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
            env: {
                NODE_ENV: "production",
                PORT: 4000
            },
            node_args: "--max-old-space-size=1024" // Prevent V8 garbage collection OOMs
        },
        {
            name: "codearena-worker",
            script: "./worker/worker.js",
            instances: 1, // BullMQ manages concurrency internally, multiple workers are okay but 1 is safer for simple DB connections
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
            env: {
                NODE_ENV: "production",
                WORKER_CONCURRENCY: 5, // Increased to 10 since we dropped Python/JS/C wrappers
                JUDGE_POOL_SIZE: 5
            },
            node_args: "--max-old-space-size=1024"
        }
    ]
};
