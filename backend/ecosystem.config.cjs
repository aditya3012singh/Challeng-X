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
                WORKER_CONCURRENCY: 5,
                JUDGE_POOL_SIZE: 5,
                S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
                S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
                S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
                S3_ENDPOINT: process.env.S3_ENDPOINT,
                S3_REGION: process.env.S3_REGION || "auto"
            },
            node_args: "--max-old-space-size=1024"
        }
    ]
};
