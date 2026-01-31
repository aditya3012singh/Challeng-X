import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Add testcases
export const addTestcases = createAsyncThunk(
    "testcase/add",
    async ({ id, testcases }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/testcase/add/${id}`, { testcases });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);
