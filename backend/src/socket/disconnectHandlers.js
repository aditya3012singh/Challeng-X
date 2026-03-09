import logger from "../utils/logger.js";

export const handleDisconnect = (io, socket) => {
    logger.info(`🔴 User disconnected: ${socket.id}, userId: ${socket.userId}`);

    if (socket.userId) {
        // Notify relevant rooms or start a reconnect timer based on userId
        // e.g., if we kept track of which battle they were in.
        // For now, emit globally or to tracking channels
        // io.emit("player_disconnected", { player: socket.userId });
    }
};

export const handleReconnect = (io, socket, payload) => {
    const { battleId } = payload;

    if (battleId) {
        const roomName = battleId;
        socket.join(roomName);
        logger.info(`User ${socket.id} re-joined ${roomName}`);

        // Server restores state (send current battle state, time remaining, etc.)
    }
};
