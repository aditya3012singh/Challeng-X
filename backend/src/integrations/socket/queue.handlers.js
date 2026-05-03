import logger from "../../core/logger/logger.js";

export const handleQueue = (io, socket, payload) => {
    logger.info(`Player ${socket.userId || socket.id} joined queue:`, payload);

    // Acknowledge queue join
    socket.emit("queue_joined", { status: "success", mode: payload.mode });

    // In a real app, you'd add the user to a Redis matchmaking queue here.
    // For now, we'll simulate finding a match if requested, or just acknowledge.
    // Normally MatchmakingService would pick this up and emit 'match_found'.
};
