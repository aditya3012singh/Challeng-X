import logger from "../utils/logger.js";
import TeamBattleNewService from "../services/teamBattleNew.service.js";
import RedisClient from "../cache/redis.client.js";

export const joinBattleRoom = (io, socket, payload) => {
    const { battleId } = payload;
    if (!battleId) return;

    const roomName = battleId;
    socket.join(roomName);
    logger.info(`User ${socket.id} joined battle room ${roomName}`);

    // Acknowledge join
    const sockets = io.sockets.adapter.rooms.get(roomName);
    const count = sockets ? (sockets.size || sockets.length) : 0;
    logger.info(`🏰 Room ${roomName} now has ${count} member(s)`);
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

export const joinSpectatorRoom = async (io, socket, payload) => {
    const { battleId } = payload;
    if (!battleId) return;

    const spectatorRoomName = `spectator_${battleId}`;
    socket.join(spectatorRoomName);
    logger.info(`Spectator ${socket.id} joined spectator room ${spectatorRoomName}`);

    // Instantly catch them up with any existing P1/P2 code state from Redis
    try {
        const stateKey = `battle_code_state:${battleId}`;
        const outputKey = `battle_output_state:${battleId}`;
        const [cachedState, cachedOutput] = await Promise.all([
            RedisClient.client.hgetall(stateKey),
            RedisClient.client.hgetall(outputKey)
        ]);

        socket.emit("spectator_initial_state", {
            codeState: cachedState || {},
            outputState: cachedOutput || {}
        });
    } catch (err) {
        logger.error(`Error fetching spectator initial state: ${err.message}`);
    }
};

export const handleSpectatorCodeSync = async (io, socket, payload) => {
    const { battleId, userId, code, language } = payload;
    if (!battleId || !userId) return;

    // Cache the latest code text in Redis so new spectators can instantly see it
    try {
        const stateKey = `battle_code_state:${battleId}`;
        await RedisClient.client.hset(stateKey, userId, JSON.stringify({ code, language }));

        // Broadcast the real-time code delta instantly to ONLY the spectator room
        socket.to(`spectator_${battleId}`).emit("spectator_code_update", {
            userId,
            code,
            language
        });
    } catch (err) {
        logger.error(`Error syncing code to spectator: ${err.message}`);
    }
};

export const handleSpectatorOutputSync = async (io, socket, payload) => {
    const { battleId, userId, output, status, testCaseResults, beatsPercentile, loadingAction } = payload;
    if (!battleId || !userId) return;

    try {
        const outputKey = `battle_output_state:${battleId}`;
        const outputData = JSON.stringify({ output, status, testCaseResults, beatsPercentile, loadingAction });
        await RedisClient.client.hset(outputKey, userId, outputData);

        // Broadcast the real-time output panel data instantly
        socket.to(`spectator_${battleId}`).emit("spectator_output_update", {
            userId,
            output,
            status,
            testCaseResults,
            beatsPercentile,
            loadingAction
        });
    } catch (err) {
        logger.error(`Error syncing output to spectator: ${err.message}`);
    }
};

export const handleAntiCheatFlag = async (io, socket, payload) => {
    const { battleId, userId, username, type, charCount, flagCount, timestamp } = payload;
    if (!battleId || !userId) return;

    logger.info(`🚨 ANTI-CHEAT FLAG: ${type} by ${username} (${userId}) in battle ${battleId} — Flag #${flagCount}${charCount ? ` (${charCount} chars)` : ""}`);

    try {
        // Cache cumulative flag counts in Redis
        const flagKey = `anti_cheat:${battleId}:${userId}`;
        await RedisClient.client.hincrby(flagKey, type, 1);
        await RedisClient.client.expire(flagKey, 3600); // TTL 1 hour

        const flagData = {
            userId,
            username,
            type,
            charCount,
            flagCount,
            timestamp
        };

        // Broadcast to the spectator room so viewers see the cheat alert
        socket.to(`spectator_${battleId}`).emit("anti_cheat_alert", flagData);

        // Also broadcast to the battle room so the opponent sees it
        socket.to(battleId).emit("opponent_cheat_flag", flagData);
    } catch (err) {
        logger.error(`Error handling anti-cheat flag: ${err.message}`);
    }
};

/**
 * TEAM BATTLE SPECIFIC HANDLERS
 */

// Join the team battle lobby room
export const joinTeamBattleLobby = (io, socket, payload) => {
    const { battleId, teamId, username } = payload;
    if (!battleId) return;

    const roomName = `battle_room_${battleId}`;
    socket.join(roomName);

    // Also join a private team-specific room for team chat
    if (teamId) {
        const teamRoom = `team_${teamId}_${battleId}`;
        socket.join(teamRoom);
        logger.info(`User ${socket.userId} joined team chat room: ${teamRoom}`);
    }

    logger.info(`User ${socket.userId} (${username}) joined team battle lobby: ${roomName}`);

    // Notify others in the lobby that someone joined
    socket.to(roomName).emit("player_joined_lobby", {
        userId: socket.userId,
        username,
        teamId
    });

    // Acknowledge
    socket.emit("lobby_joined", { status: "success", battleId });
};

// Start the 5-second countdown (usually triggered by Team1 leader)
export const handleStartCountdown = (io, socket, payload) => {
    const { battleId } = payload;
    if (!battleId) return;

    const roomName = `battle_room_${battleId}`;
    logger.info(`Countdown started for battle ${battleId} by ${socket.userId}`);
    
    // Broadcast to everyone in the room
    io.to(roomName).emit("battle_countdown_start", { seconds: 5 });
};

// Trigger the final redirect for all players after countdown ends
export const handleFinalBattleStart = async (io, socket, payload) => {
    const { battleId } = payload;
    if (!battleId) return;

    try {
        const battle = await TeamBattleNewService.getTeamBattleService(battleId);
        if (!battle) return;

        const roomName = `battle_room_${battleId}`;
        logger.info(`Final battle start trigger for team battle ${battleId}`);

        // Notify each player of their specific 1v1 match ID
        if (battle.matches && battle.matches.length > 0) {
            battle.matches.forEach(match => {
                // Emit to private user rooms
                io.to(`user_${match.player1Id}`).emit("team_battle_match_start", { matchId: match.id });
                io.to(`user_${match.player2Id}`).emit("team_battle_match_start", { matchId: match.id });
            });
        }

        // Broadcast a generic signal for spectators or as fallback
        io.to(roomName).emit("battle_start_redirect", { 
            battleCode: battle.battleCode,
            isTeamBattle: true 
        });
    } catch (err) {
        logger.error(`Error in handleFinalBattleStart: ${err.message}`);
    }
};
