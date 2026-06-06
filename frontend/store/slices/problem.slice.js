import { createSlice } from "@reduxjs/toolkit";
import { createProblem, getAllProblems, getProblemById } from "../api/problem.thunk";

const initialState = {
    problems: [],
    currentProblem: null,
    loading: false,
    error: null,
};

const problemSlice = createSlice({
    name: "problem",
    initialState,
    reducers: {
        clearProblemError: (state) => {
            state.error = null;
        },
        clearCurrentProblem: (state) => {
            state.currentProblem = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create problem
            .addCase(createProblem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProblem.fulfilled, (state, action) => {
                state.loading = false;
                state.problems.push(action.payload.problem);
                state.error = null;
            })
            .addCase(createProblem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create problem";
            })
            // Get all problems
            .addCase(getAllProblems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllProblems.fulfilled, (state, action) => {
                state.loading = false;
                state.problems = action.payload.data || action.payload;
                state.error = null;
            })
            .addCase(getAllProblems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch problems";
            })
            // Get problem by ID
            .addCase(getProblemById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProblemById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProblem = action.payload.problem || action.payload;
                state.error = null;
            })
            .addCase(getProblemById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch problem";
            });
    },
});

export const { clearProblemError, clearCurrentProblem } = problemSlice.actions;
export default problemSlice.reducer;
