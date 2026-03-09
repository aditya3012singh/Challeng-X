import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Create battle with random question
export const createBattleRandom = createAsyncThunk(
    "battle/createRandom",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.post("/battle/create/random");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Create battle with selected question
export const createBattleSelected = createAsyncThunk(
    "battle/createSelected",
    async ({ problemId }, { rejectWithValue }) => {
        try {
            const res = await api.post("/battle/create/selected", { problemId });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Join battle
export const joinBattle = createAsyncThunk(
    "battle/join",
    async ({ battleCode }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/battle/join`, { battleCode });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get battle details
export const getBattle = createAsyncThunk(
    "battle/get",
    async ({ battleId }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/battle/${battleId}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Submit battle code
export const submitBattleCode = createAsyncThunk(
    "battle/submitCode",
    async ({ battleId, code, language, type }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/battle/${battleId}/submit`, { code, language, type });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get battle history
export const getBattleHistory = createAsyncThunk(
    "battle/history",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/battle/history`, { params: { page, limit } });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Forfeit battle
export const forfeitBattle = createAsyncThunk(
    "battle/forfeit",
    async ({ battleId }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/battle/${battleId}/forfeit`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Fetch live battles for spectator directory
export const fetchLiveBattles = createAsyncThunk(
    "battle/fetchLive",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/battle/live");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Find battle by battleCode (for spectate-by-code)
export const findBattleByCode = createAsyncThunk(
    "battle/findByCode",
    async ({ battleCode }, { rejectWithValue }) => {
        try {
            const res = await api.get("/battle/live");
            const battles = res.data;
            const match = battles.find(b => b.battleCode === battleCode);
            if (!match) throw new Error("No active battle found with that code");
            return match;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);
