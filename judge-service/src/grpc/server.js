import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import JudgeServiceImpl from "./handlers/judge.service.js";
import { initializePools, shutdownPools } from "./handlers/runCode.handler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load gRPC proto file
 */
function loadProto() {
    const protoPath = path.join(__dirname, "judge.proto");
    
    try {
        const packageDefinition = protoLoader.loadSync(protoPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        
        return grpc.loadPackageDefinition(packageDefinition);
    } catch (error) {
        console.error(`[ERROR] Failed to load proto: ${error.message}`);
        console.error(`[ERROR] Proto path: ${protoPath}`);
        throw error;
    }
}

/**
 * Create gRPC server
 */
function createServer() {
    const proto = loadProto();
    
    // Proto structure should be: proto.judge.JudgeService
    const judgePackage = proto.judge;
    
    if (!judgePackage) {
        console.error("[ERROR] proto.judge is undefined");
        console.error("[ERROR] Proto keys:", Object.keys(proto));
        throw new Error("proto.judge not found");
    }
    
    const judgeService = judgePackage.JudgeService;
    
    if (!judgeService) {
        console.error("[ERROR] judgeService is undefined");
        console.error("[ERROR] judge package keys:", Object.keys(judgePackage));
        throw new Error("JudgeService not found in proto.judge");
    }
    
    console.error("[DEBUG] judgeService type:", typeof judgeService);
    console.error("[DEBUG] judgeService keys:", Object.keys(judgeService));
    console.error("[DEBUG] judgeService:", JSON.stringify(judgeService, null, 2));
    
    // The service definition is directly judgeService, not judgeService.service
    // Proto-loader returns { service: { ... }, ... } structure
    const serviceDef = judgeService.service || judgeService;
    
    if (!serviceDef) {
        console.error("[ERROR] Could not find service definition");
        throw new Error("Service definition not found");
    }
    
    const judgeImpl = new JudgeServiceImpl();
    const server = new grpc.Server();

    // server.addService requires (serviceDef, implementations)
    // The implementations object keys must match the RPC method names
    server.addService(serviceDef, {
        runCode: judgeImpl.runCode.bind(judgeImpl),
    });

    return server;
}

/**
 * Start gRPC server
 */
export function startGrpcServer() {
    const port = env.JUDGE_GRPC_PORT || 50051;
    const server = createServer();

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
            if (err) {
                logger.error(`[Judge] gRPC server bind error: ${err.message}`);
                process.exit(1);
            }

            logger.info(`[Judge] gRPC server started on port ${port}`);

            // Initialize container pools
            const poolSize = parseInt(env.JUDGE_POOL_SIZE || "2", 10);
            initializePools(poolSize);

            server.start();
        }
    );

    // Graceful shutdown
    const shutdown = () => {
        logger.info("[Judge] Shutting down gRPC server...");
        server.forceShutdown();
        shutdownPools();
        process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    return server;
}

/**
 * Get gRPC server
 */
export function getServer() {
    return createServer();
}
