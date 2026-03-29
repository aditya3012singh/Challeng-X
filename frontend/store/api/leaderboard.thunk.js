import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Fetch leaderboard
export const fetchLeaderboard = createAsyncThunk(
    "leaderboard/fetch",
    async ({ page = 1, limit = 20, filter = 'GLOBAL' } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get("/leaderboard", { params: { page, limit, filter } });
            return res.data; // Return the whole object to get totalPages etc.
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch leaderboard");
        }
    }
);
