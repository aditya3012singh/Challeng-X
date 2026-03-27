import logger from "../utils/logger.js";

/**
 * Handle real-time team communication
 */
export const handleTeamMessage = (io, socket, payload) => {
    const { battleId, teamId, text, username } = payload;
    
    if (!battleId || !teamId || !text) {
        return;
    }

    // Identify the specific team room for this battle
    const teamRoom = `team_${teamId}_${battleId}`;
    
    logger.info(`💬 Team Chat: [${username}] in ${teamRoom}: ${text}`);

    const messagePayload = {
        id: Date.now(),
        sender: username || "System",
        userId: socket.userId,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "user"
    };

    // Broadcast ONLY to the specific team room (teammates)
    io.to(teamRoom).emit("new_team_message", messagePayload);
};
