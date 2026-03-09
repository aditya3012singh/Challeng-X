import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Create a new Squid Game tournament
export const createSquidGame = createAsyncThunk(
    "squidGame/create",
    async ({ name, maxPlayers = 50 }, { rejectWithValue }) => {
        try {
            const res = await api.post("/squid-game", { name, maxPlayers });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Join an existing tournament
export const joinSquidGame = createAsyncThunk(
    "squidGame/join",
    async ({ squidGameId }, { rejectWithValue }) => {
        try {
            const res = await api.post("/squid-game/join", { squidGameId });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get tournament status
export const getSquidGameStatus = createAsyncThunk(
    "squidGame/getStatus",
    async ({ squidGameId }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/squid-game/${squidGameId}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Start a tournament
export const startSquidGame = createAsyncThunk(
    "squidGame/start",
    async ({ squidGameId }, { rejectWithValue }) => {
        try {
            const res = await api.post("/squid-game/start", { squidGameId });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Submit solution during a round
export const submitSquidGameSolution = createAsyncThunk(
    "squidGame/submit",
    async ({ squidGameId, code, language, status, executionTimeMs, testCasesPassed, totalTestCases }, { rejectWithValue }) => {
        try {
            const res = await api.post("/squid-game/submit", {
                squidGameId, code, language, status, executionTimeMs, testCasesPassed, totalTestCases
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get leaderboard
export const getSquidGameLeaderboard = createAsyncThunk(
    "squidGame/leaderboard",
    async ({ squidGameId }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/squid-game/${squidGameId}/leaderboard`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get user's tournament history
export const getSquidGameHistory = createAsyncThunk(
    "squidGame/history",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/squid-game/history/my");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);
