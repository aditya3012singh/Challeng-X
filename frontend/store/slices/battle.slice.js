import { createSlice } from "@reduxjs/toolkit";
import {
    createBattleRandom,
    createBattleSelected,
    joinBattle,
    getBattle,
    submitBattleCode,
    getBattleHistory
} from "../api/battle.thunk";

const initialState = {
    currentBattle: null,
    battleHistory: [],
    loading: false,
    error: null,
    submissionResult: null,
    totalPages: 0,
};

const battleSlice = createSlice({
    name: "battle",
    initialState,
    reducers: {
        clearBattleError: (state) => {
            state.error = null;
        },
        clearSubmissionResult: (state) => {
            state.submissionResult = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create battle random
            .addCase(createBattleRandom.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBattleRandom.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBattle = action.payload;
                state.error = null;
            })
            .addCase(createBattleRandom.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create battle";
            })
            // Create battle selected
            .addCase(createBattleSelected.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBattleSelected.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBattle = action.payload;
                state.error = null;
            })
            .addCase(createBattleSelected.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create battle";
            })
            // Join battle
            .addCase(joinBattle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinBattle.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBattle = action.payload;
                state.error = null;
            })
            .addCase(joinBattle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to join battle";
            })
            // Get battle
            .addCase(getBattle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBattle.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBattle = action.payload;
                state.error = null;
            })
            .addCase(getBattle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to get battle";
            })
            // Submit battle code
            .addCase(submitBattleCode.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitBattleCode.fulfilled, (state, action) => {
                state.loading = false;
                state.submissionResult = action.payload;
                state.error = null;
            })
            .addCase(submitBattleCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to submit code";
            })
            // Get battle history
            .addCase(getBattleHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBattleHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.battleHistory = action.payload.battles || action.payload;
                state.totalPages = action.payload.totalPages || 1;
                state.error = null;
            })
            .addCase(getBattleHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to get battle history";
            });
    },
});

export const { clearBattleError, clearSubmissionResult } = battleSlice.actions;
export default battleSlice.reducer;
