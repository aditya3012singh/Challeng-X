// configure and export socket.io instance
class SocketEmitter {
    static io = null;

    static setIo(io) {
        this.io = io;
    }
    static emitToBattle(battleId, event, data) {
        if (!this.io) {
            return;
        }
        this.io.to(battleId).emit(event, data);
    }
}

export default SocketEmitter;