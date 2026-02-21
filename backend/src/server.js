import dotenv from "dotenv";
dotenv.config();
import App from "./app.js";
import http from "http";
import { Server } from "socket.io";
import SquidGameSocket from "./config/squidGameSocket.js";
import BattleService from "./services/battle.service.js";

class ServerApp {
  static io = null;

  static createServer(app) {
    return http.createServer(app);
  }

  static createIo(server) {
    return new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
  }

  static registerBaseSocketHandlers(io) {
    io.on("connection", (socket) => {
      console.log("🟢 User connected:", socket.id);

      socket.on("joinBattle", (battleId) => {
        socket.join(battleId);
        console.log(`User joined room ${battleId}`);
      });

      // ──────────────────────────────────────────────────────────────────────
      // Worker → Server: result of a judged submission
      // The worker emits this after running all test cases.
      // ──────────────────────────────────────────────────────────────────────
      socket.on("submissionResult", async ({ submissionId, userId, battleId, status, passedTests, totalTests, executionTimeMs, failedTestCase, input, expectedOutput, actualOutput, errorMessage }) => {
        console.log(`📨 submissionResult: battle=${battleId} user=${userId} status=${status}`);

        try {
          if (battleId) {
            if (status === "PASSED") {
              // Fetch battle to ensure it's still ONGOING (guard against race)
              const battle = await BattleService.getBattle(battleId);
              if (battle && battle.status === "ONGOING") {
                // Finish battle — updates DB, updates ranks, emits battleFinished
                await BattleService.finishBattleService(battleId, userId);
                console.log(`🏆 Battle ${battleId} finished. Winner: ${userId}`);
              }
            } else {
              // Send the failure result back to both players in the room
              io.to(battleId).emit("submissionResult", {
                submissionId,
                userId,
                status,
                passedTests,
                totalTests,
                failedTestCase,
                input,
                expectedOutput,
                actualOutput,
                errorMessage,
              });
            }
          }
        } catch (err) {
          console.error("❌ Error handling submissionResult:", err.message);
        }
      });

      socket.on("disconnect", () => {
        console.log("🔴 User disconnected");
      });
    });
  }

  static start() {
    const app = App.createApp();
    const server = this.createServer(app);

    this.io = this.createIo(server);
    this.registerBaseSocketHandlers(this.io);

    // Initialize Squid Game socket handlers
    SquidGameSocket.initializeSquidGameSocket(this.io);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }
}

ServerApp.start();

export default ServerApp;

