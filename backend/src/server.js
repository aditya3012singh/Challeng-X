import dotenv from "dotenv";
dotenv.config();
import App from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { initializeSquidGameSocket } from "./config/squidGameSocket.js";

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
    initializeSquidGameSocket(this.io);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }
}

ServerApp.start();

export default ServerApp;

