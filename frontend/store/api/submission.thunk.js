import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Submit code (async - returns immediately with submissionId)
export const submitCode = createAsyncThunk(
    "submission/submit",
    async ({ code, language, problemId, battleId }, { rejectWithValue }) => {
        try {
            const res = await api.post("/submissions/submit", {
                code,
                language,
                problemId,
                battleId,
            });
            return res.data; // Returns: { submissionId, status: "QUEUED", message }
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

// Get submission status by ID
export const getSubmissionStatus = createAsyncThunk(
    "submission/getStatus",
    async ({ submissionId }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/submissions/${submissionId}`);
            return res.data; // Returns: { id, status, passedTests, totalTests, executionTimeMs }
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to get submission status" });
        }
    }
);
