import logger from "../utils/logger.js";

export const joinBattleRoom = (io, socket, payload) => {
    const { battleId } = payload;
    if (!battleId) return;

    const roomName = battleId;
    socket.join(roomName);
    logger.info(`User ${socket.id} joined battle room ${roomName}`);

    // Acknowledge join
    socket.emit("battle_joined", { battleId, status: "success" });

    // Simulate a countdown and start if this was the last player
    // In a real scenario, you'd check Redis to see if both players joined
    // Here we just provide the structure for the events

    /*
    io.to(roomName).emit("battle_countdown", { seconds: 5 });
    setTimeout(() => {
      io.to(roomName).emit("battle_start", {
        battleId,
        problem: {
          id: "two_sum",
          title: "Two Sum",
          timeLimit: 15
        }
      });
    }, 5000);
    */
};

export const handleSubmission = (io, socket, payload) => {
    const { battleId, code, language } = payload;
    const roomName = battleId;

    logger.info(`Code submitted in battle room ${roomName} by ${socket.id}`);

    // Push to judge queue (e.g., BullMQ) in reality.
    // We notify the opponent to keep suspense
    socket.to(roomName).emit("opponent_submitted", { status: "pending" });

    // The actual submission result would come from the worker/Redis pub-sub.
};
