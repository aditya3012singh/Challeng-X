import { createSlice } from "@reduxjs/toolkit";
import {
    createSquidGame,
    joinSquidGame,
    getSquidGameStatus,
    startSquidGame,
    submitSquidGameSolution,
    getSquidGameLeaderboard,
    getSquidGameHistory
} from "../api/squidGame.thunk";

const initialState = {
    tournament: null,
    leaderboard: [],
    history: [],
    loading: false,
    error: null,
};

const squidGameSlice = createSlice({
    name: "squidGame",
    initialState,
    reducers: {
        clearSquidGameError: (state) => {
            state.error = null;
        },
        clearTournament: (state) => {
            state.tournament = null;
            state.leaderboard = [];
            state.error = null;
        },
        updateTournament: (state, action) => {
            state.tournament = { ...state.tournament, ...action.payload };
        },
        setLeaderboard: (state, action) => {
            state.leaderboard = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create tournament
            .addCase(createSquidGame.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSquidGame.fulfilled, (state, action) => {
                state.loading = false;
                state.tournament = action.payload.tournament;
            })
            .addCase(createSquidGame.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to create tournament";
            })
            // Join tournament
            .addCase(joinSquidGame.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinSquidGame.fulfilled, (state, action) => {
                state.loading = false;
                state.tournament = action.payload.tournament || action.payload;
            })
            .addCase(joinSquidGame.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to join tournament";
            })
            // Get status
            .addCase(getSquidGameStatus.fulfilled, (state, action) => {
                state.tournament = action.payload;
            })
            // Start tournament
            .addCase(startSquidGame.fulfilled, (state, action) => {
                state.tournament = action.payload.tournament || action.payload;
            })
            // Submit solution
            .addCase(submitSquidGameSolution.pending, (state) => {
                state.loading = true;
            })
            .addCase(submitSquidGameSolution.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(submitSquidGameSolution.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Submission failed";
            })
            // Leaderboard
            .addCase(getSquidGameLeaderboard.fulfilled, (state, action) => {
                state.leaderboard = action.payload.leaderboard || action.payload;
            })
            // History
            .addCase(getSquidGameHistory.fulfilled, (state, action) => {
                state.history = action.payload.tournaments || [];
            });
    },
});

export const { clearSquidGameError, clearTournament, updateTournament, setLeaderboard } = squidGameSlice.actions;
export default squidGameSlice.reducer;
