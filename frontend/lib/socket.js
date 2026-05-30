import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "https://api-codearena.duckdns.org";
const HEARTBEAT_INTERVAL = 10000; // 10 seconds

let socket = null;
let heartbeatInterval = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: (cb) => {
        cb({ token: localStorage.getItem("accessToken") });
      },
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      startHeartbeat();
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      stopHeartbeat();
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      stopHeartbeat();
    });
  }

  return socket;
};

export const isSocketConnected = () => {
  return socket && socket.connected;
};

export const refreshSocketToken = (newToken) => {
  if (socket) {
    socket.auth = { token: newToken };
    console.log("🔄 Socket auth token updated");
  }
};

export const disconnectSocket = () => {
  if (socket) {
    stopHeartbeat();
    socket.disconnect();
    socket = null;
  }
};

// Heartbeat to keep presence updated
const startHeartbeat = () => {
  if (heartbeatInterval) return;
  
  heartbeatInterval = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit("heartbeat", { timestamp: Date.now() });
    }
  }, HEARTBEAT_INTERVAL);
};

const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};
