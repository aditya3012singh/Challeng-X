import env from "./config/env.js";
import logger from "./utils/logger.js";
import { startGrpcServer } from "./grpc/server.js";

/**
 * Judge Service Application
 */
class JudgeApp {
    static async start() {
        logger.info("[Judge] Starting Judge Service...");

        // Start gRPC server
        startGrpcServer();

        // Health check endpoint (simple HTTP server)
        const http = await import("http");
        http.createServer((req, res) => {
            if (req.url === "/health" && req.method === "GET") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    status: "ok",
                    grpc: true,
                    containerPool: {},
                    timestamp: new Date().toISOString(),
                }));
            } else {
                res.writeHead(404);
                res.end("Not Found");
            }
        }).listen(8080, () => {
            logger.info("[Judge] Health check server running on port 8080");
        });
    }
}

export default JudgeApp;
