import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";

const server= http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
