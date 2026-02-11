// configure and export socket.io instance

import ServerApp from "../server.js";

class SocketEmitter {
    static emitToBattle(battleId, event, data) {
        if (!ServerApp.io) {
            return;
        }
        ServerApp.io.to(battleId).emit(event, data);
    }
}

export default SocketEmitter;