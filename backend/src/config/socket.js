// configure and export socket.io instance

import { io } from "../server.js";

export function emitToBattle(battleId, event, data) {
    io.to(battleId).emit(event, data);
}