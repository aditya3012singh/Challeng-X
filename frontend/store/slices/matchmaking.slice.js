import { createSlice } from "@reduxjs/toolkit";
import { joinMatchmaking, leaveMatchmaking, getQueueStatus } from "../api/matchmaking.thunk";
import { login, register, logoutUser } from "../api/auth.thunk";

const initialState = {
    inQueue: false,
    loading: false,
    error: null,
    difficulty: null,
    queueSize: 0,
    waitTime: 0,
    estimatedWait: 0,
    matchFound: false,
    battleId: null,
    battleCode: null,
    opponent: null,
};

const matchmakingSlice = createSlice({
    name: "matchmaking",
    initialState,
    reducers: {
        clearMatchmakingError: (state) => {
            state.error = null;
        },
        setMatchFound: (state, action) => {
            state.matchFound = true;
            state.battleId = action.payload.battleId;
            state.battleCode = action.payload.battleCode;
            state.opponent = action.payload.opponent;
            state.inQueue = false;
        },
        resetMatchmaking: (state) => {
            state.inQueue = false;
            state.matchFound = false;
            state.battleId = null;
            state.battleCode = null;
            state.opponent = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Join Queue
            .addCase(joinMatchmaking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinMatchmaking.fulfilled, (state, action) => {
                state.loading = false;
                state.inQueue = true;
                state.difficulty = action.payload.queueData?.difficulty;
                state.error = null;
            })
            .addCase(joinMatchmaking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to join queue";
            })
            // Leave Queue
            .addCase(leaveMatchmaking.pending, (state) => {
                state.loading = true;
            })
            .addCase(leaveMatchmaking.fulfilled, (state) => {
                state.loading = false;
                state.inQueue = false;
                state.difficulty = null;
                state.queueSize = 0;
                state.waitTime = 0;
            })
            .addCase(leaveMatchmaking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to leave queue";
            })
            // Get Queue Status
            .addCase(getQueueStatus.fulfilled, (state, action) => {
                if (action.payload.inQueue) {
                    state.queueSize = action.payload.queueSize;
                    state.waitTime = action.payload.waitTime;
                    state.estimatedWait = action.payload.estimatedWait;
                }
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

export const { clearMatchmakingError, setMatchFound, resetMatchmaking } = matchmakingSlice.actions;
export default matchmakingSlice.reducer;
