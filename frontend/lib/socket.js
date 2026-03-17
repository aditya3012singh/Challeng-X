import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "https://api-codearena.duckdns.org";

let socket = null;

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
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
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
    socket.disconnect();
    socket = null;
  }
};
