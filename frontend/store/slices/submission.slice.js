import { createSlice } from "@reduxjs/toolkit";
import { submitCode } from "../api/submission.thunk";

const initialState = {
    submissions: [],
    currentSubmission: null,
    loading: false,
    error: null,
};

const submissionSlice = createSlice({
    name: "submission",
    initialState,
    reducers: {
        clearSubmissionError: (state) => {
            state.error = null;
        },
        clearCurrentSubmission: (state) => {
            state.currentSubmission = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitCode.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitCode.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSubmission = action.payload;
                state.submissions.push(action.payload);
                state.error = null;
            })
            .addCase(submitCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to submit code";
            });
    },
});

export const { clearSubmissionError, clearCurrentSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
