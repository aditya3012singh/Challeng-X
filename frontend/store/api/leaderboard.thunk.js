import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Fetch leaderboard
export const fetchLeaderboard = createAsyncThunk(
    "leaderboard/fetch",
    async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
        try {
            const res = await api.get("/leaderboard", { params: { page, limit } });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);
