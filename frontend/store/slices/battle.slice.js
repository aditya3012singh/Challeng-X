import { createSlice } from "@reduxjs/toolkit";
import {
    createBattleRandom,
    createBattleSelected,
    joinBattle,
    getBattle,
    submitBattleCode,
    getBattleHistory,
    forfeitBattle,
    fetchLiveBattles,
    findBattleByCode
} from "../api/battle.thunk";
import { login, register, logoutUser } from "../api/auth.thunk";

const initialState = {
    currentBattle: null,
    battleHistory: [],
    liveBattles: [],
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
        clearCurrentBattle: (state) => {
            state.currentBattle = null;
            state.submissionResult = null;
            state.error = null;
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
            })
            // Forfeit battle
            .addCase(forfeitBattle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forfeitBattle.fulfilled, (state) => {
                state.loading = false;
                state.currentBattle = null;
                state.submissionResult = null;
                state.error = null;
            })
            .addCase(forfeitBattle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to forfeit battle";
            })
            // Fetch live battles
            .addCase(fetchLiveBattles.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchLiveBattles.fulfilled, (state, action) => {
                state.liveBattles = action.payload;
            })
            .addCase(fetchLiveBattles.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch live battles";
            })
            // Find battle by code
            .addCase(findBattleByCode.fulfilled, (state, action) => {
                // We don't need to store this; the component will use unwrap()
            })
            .addCase(findBattleByCode.rejected, (state, action) => {
                state.error = action.payload || "Battle not found";
            })
            // Reset state on auth changes
            .addCase(login.fulfilled, (state) => {
                return initialState;
            })
            .addCase(register.fulfilled, (state) => {
                return initialState;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                return initialState;
            });
    },
});

export const { clearBattleError, clearSubmissionResult, clearCurrentBattle } = battleSlice.actions;
export default battleSlice.reducer;
