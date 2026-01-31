import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Submit code
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
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);
