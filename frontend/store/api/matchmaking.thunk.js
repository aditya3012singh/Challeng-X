import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Join matchmaking queue
export const joinMatchmaking = createAsyncThunk(
    "matchmaking/join",
    async ({ difficulty, socketId }, { rejectWithValue }) => {
        try {
            const res = await api.post("/matchmaking/join", { difficulty, socketId });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Leave matchmaking queue
export const leaveMatchmaking = createAsyncThunk(
    "matchmaking/leave",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.post("/matchmaking/leave");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get queue status
export const getQueueStatus = createAsyncThunk(
    "matchmaking/status",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/matchmaking/status");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);
