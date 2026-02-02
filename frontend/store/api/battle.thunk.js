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
    async ({ battleId }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/battle/join/${battleId}`);
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
    async ({ battleId, code, language }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/battle/${battleId}/submit`, { code, language });
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
