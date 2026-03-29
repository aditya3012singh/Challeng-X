import logger from "../utils/logger.js";
import RedisClient from "../cache/redis.client.js";
import Database from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import NotificationService from "../services/notification.service.js";

export const handleLobbyEvents = (io, socket) => {
    
    // 1. Create/Join initial solo lobby on connection (or fetch existing)
    socket.on("lobby:get_status", async () => {
        try {
            const lobbyId = await RedisClient.client.get(`user_lobby:${socket.userId}`);
            if (lobbyId) {
                const lobby = await getLobby(lobbyId);
                if (lobby) {
                    socket.join(`lobby_${lobbyId}`);
                    socket.emit("lobby:update", lobby);
                }
            }
        } catch (err) {
            logger.error(`Error in lobby:get_status: ${err.message}`);
        }
    });

    // 2. Invite a friend
    socket.on("lobby:invite", async (payload) => {
        const { friendId } = payload;
        if (!friendId) return;

        try {
            // Get or create current lobby for source user
            let lobbyId = await RedisClient.client.get(`user_lobby:${socket.userId}`);
            if (!lobbyId) {
                lobbyId = uuidv4();
                await createLobby(lobbyId, socket.userId);
            }

            const lobby = await getLobby(lobbyId);
            if (lobby.leaderId !== socket.userId) {
                return socket.emit("lobby:error", { message: "Only the leader can invite players" });
            }

            if (lobby.members.length >= 5) {
                return socket.emit("lobby:error", { message: "Lobby is full" });
            }

            // Emit invite event to friend's private room
            io.to(`user_${friendId}`).emit("lobby:invitation_received", {
                from: {
                    id: socket.userId,
                    username: socket.user.username,
                    profilePic: socket.user.profilePic
                },
                lobbyId
            });

            // Trigger Persistent Notification
            await NotificationService.createNotification(friendId, {
                type: 'MATCH_INVITE',
                title: 'Match Invitation',
                message: `${socket.user.username} invited you to join a lobby.`,
                link: `/battles` // Or a specific lobby link if we had one
            });

            logger.info(`Lobby invite sent from ${socket.userId} to ${friendId}`);
        } catch (err) {
            logger.error(`Error in lobby:invite: ${err.message}`);
        }
    });

    // 3. Accept invitation
    socket.on("lobby:accept_invite", async (payload) => {
        const { lobbyId } = payload;
        if (!lobbyId) return;

        try {
            // Leave old lobby if any
            const oldLobbyId = await RedisClient.client.get(`user_lobby:${socket.userId}`);
            if (oldLobbyId) {
                await leaveLobby(io, socket, oldLobbyId);
            }

            const lobby = await getLobby(lobbyId);
            if (!lobby) {
                return socket.emit("lobby:error", { message: "Lobby no longer exists" });
            }

            if (lobby.members.length >= 5) {
                return socket.emit("lobby:error", { message: "Lobby is full" });
            }

            // Join new lobby
            lobby.members.push({
                id: socket.userId,
                username: socket.user.username,
                profilePic: socket.user.profilePic,
                rankPoints: socket.user.rankPoints
            });

            await RedisClient.client.set(`lobby:${lobbyId}`, JSON.stringify(lobby));
            await RedisClient.client.set(`user_lobby:${socket.userId}`, lobbyId);

            socket.join(`lobby_${lobbyId}`);
            io.to(`lobby_${lobbyId}`).emit("lobby:update", lobby);
            
            logger.info(`User ${socket.userId} joined lobby ${lobbyId}`);
        } catch (err) {
            logger.error(`Error in lobby:accept_invite: ${err.message}`);
        }
    });

    // 4. Leave lobby
    socket.on("lobby:leave", async () => {
        try {
            const lobbyId = await RedisClient.client.get(`user_lobby:${socket.userId}`);
            if (lobbyId) {
                await leaveLobby(io, socket, lobbyId);
                socket.emit("lobby:update", null);
            }
        } catch (err) {
            logger.error(`Error in lobby:leave: ${err.message}`);
        }
    });

    // 5. Toggle matchmaking mode
    socket.on("lobby:set_mode", async (payload) => {
        const { mode } = payload; // 'SOLO' or 'TEAM'
        try {
            let lobbyId = await RedisClient.client.get(`user_lobby:${socket.userId}`);
            
            if (!lobbyId) {
                lobbyId = uuidv4();
                await createLobby(lobbyId, socket.userId);
            }

            const lobby = await getLobby(lobbyId);
            if (lobby.leaderId !== socket.userId) return;

            lobby.mode = mode;
            await RedisClient.client.set(`lobby:${lobbyId}`, JSON.stringify(lobby));
            io.to(`lobby_${lobbyId}`).emit("lobby:update", lobby);
        } catch (err) {
            logger.error(`Error in lobby:set_mode: ${err.message}`);
        }
    });
};

// Helper functions for Lobby storage in Redis
const createLobby = async (lobbyId, creatorId) => {
    // Fetch full user info for the lobby state
    const user = await Database.client.user.findUnique({
        where: { id: creatorId },
        select: {
            id: true,
            username: true,
            profilePic: true,
            rankPoints: true
        }
    });

    const lobby = {
        id: lobbyId,
        leaderId: creatorId,
        members: [user || { id: creatorId }],
        mode: 'SOLO'
    };
    await RedisClient.client.set(`lobby:${lobbyId}`, JSON.stringify(lobby));
    await RedisClient.client.set(`user_lobby:${creatorId}`, lobbyId);
    return lobby;
};

const getLobby = async (lobbyId) => {
    const data = await RedisClient.client.get(`lobby:${lobbyId}`);
    return data ? JSON.parse(data) : null;
};

const leaveLobby = async (io, socket, lobbyId) => {
    const lobby = await getLobby(lobbyId);
    if (!lobby) return;

    lobby.members = lobby.members.filter(m => m.id !== socket.userId);
    socket.leave(`lobby_${lobbyId}`);
    await RedisClient.client.del(`user_lobby:${socket.userId}`);

    if (lobby.members.length === 0) {
        await RedisClient.client.del(`lobby:${lobbyId}`);
    } else {
        // If leader leaves, pick a new leader
        if (lobby.leaderId === socket.userId) {
            lobby.leaderId = lobby.members[0].id;
        }
        await RedisClient.client.set(`lobby:${lobbyId}`, JSON.stringify(lobby));
        io.to(`lobby_${lobbyId}`).emit("lobby:update", lobby);
    }
};
