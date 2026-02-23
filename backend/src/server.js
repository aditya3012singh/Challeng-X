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
      socket.on("submissionProgress", (data) => {
        const { submissionId, battleId } = data;
        if (battleId) {
          io.to(battleId).emit("submissionProgress", data);
        } else {
          // Practice mode or non-battle submission
          io.emit("submissionProgress", data); // Fallback broadcast
        }
      });

      socket.on("submissionResult", async (data) => {
        const { submissionId, userId, battleId, status, type, testCaseResults, executionTimeMs } = data;
        console.log(`📨 submissionResult: battle=${battleId} user=${userId} type=${type} status=${status}`);

        try {
          if (battleId) {
            if (status === "PASSED" && type === "SUBMIT") {
              // 1. Forward the individual success result immediately (Progress feedback)
              io.to(battleId).emit("submissionResult", data);

              // 2. Await the CRITICAL status change in DB before notifying the room of completion
              // This prevents the loser from re-fetching before the status is 'FINISHED'
              BattleService.finishBattleService(battleId, userId)
                .then((result) => {
                  if (result) {
                    console.log(`🏆 Battle ${battleId} finished in DB. Winner: ${userId}. Notifying room...`);
                    io.to(battleId).emit("battleFinished", { winnerId: userId });
                  } else {
                    console.log(`ℹ️ Battle ${battleId} already has a winner. Skipping notification for ${userId}.`);
                  }
                })
                .catch((err) => console.error(`❌ finishBattleService error: ${err.message}`));

            } else {
              // Standard forwarding for failures or RUN types
              io.to(battleId).emit("submissionResult", data);
            }
          }
        } catch (error) {
          console.error("Socket submissionResult handler error:", error);
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

export default ServerApp;

