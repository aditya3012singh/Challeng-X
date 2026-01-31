import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Create problem
export const createProblem = createAsyncThunk(
    "problem/create",
    async (problemData, { rejectWithValue }) => {
        try {
            const res = await api.post("/problem/create", problemData);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

// Get all problems
export const getAllProblems = createAsyncThunk(
    "problem/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/problem/list");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

// Get problem by ID
export const getProblemById = createAsyncThunk(
    "problem/getById",
    async ({ id }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/problem/${id}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);
