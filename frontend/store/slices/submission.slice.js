import { createSlice } from "@reduxjs/toolkit";
import { submitCode, getSubmissionStatus } from "../api/submission.thunk";

const initialState = {
    submissions: [],
    currentSubmission: null,
    submissionStatus: null, // Current submission being tracked
    loading: false,
    statusLoading: false,
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
            state.submissionStatus = null;
        },
        updateSubmissionStatus: (state, action) => {
            // Update from socket event
            state.submissionStatus = action.payload;
            if (state.currentSubmission?.submissionId === action.payload.submissionId) {
                state.currentSubmission = {
                    ...state.currentSubmission,
                    ...action.payload
                };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Submit code
            .addCase(submitCode.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.submissionStatus = null;
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
            })
            
            // Get submission status
            .addCase(getSubmissionStatus.pending, (state) => {
                state.statusLoading = true;
            })
            .addCase(getSubmissionStatus.fulfilled, (state, action) => {
                state.statusLoading = false;
                state.submissionStatus = action.payload;
                
                // Update currentSubmission if it matches
                if (state.currentSubmission?.submissionId === action.payload.id) {
                    state.currentSubmission = {
                        ...state.currentSubmission,
                        ...action.payload
                    };
                }
            })
            .addCase(getSubmissionStatus.rejected, (state, action) => {
                state.statusLoading = false;
                state.error = action.payload?.message || "Failed to get submission status";
            });
    },
});

export const { 
    clearSubmissionError, 
    clearCurrentSubmission,
    updateSubmissionStatus 
} = submissionSlice.actions;

export default submissionSlice.reducer;
