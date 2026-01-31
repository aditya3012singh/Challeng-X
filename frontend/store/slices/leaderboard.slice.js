import { createSlice } from "@reduxjs/toolkit";
import { fetchLeaderboard } from "../api/leaderboard.thunk";

const initialState = {
    rankings: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
};

const leaderboardSlice = createSlice({
    name: "leaderboard",
    initialState,
    reducers: {
        clearLeaderboardError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaderboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => {
                state.loading = false;
                state.rankings = action.payload.leaderboard || action.payload;
                state.currentPage = action.payload.page || 1;
                state.totalPages = action.payload.totalPages || 1;
                state.error = null;
            })
            .addCase(fetchLeaderboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch leaderboard";
            });
    },
});

export const { clearLeaderboardError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
