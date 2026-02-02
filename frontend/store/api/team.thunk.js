import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Create team
export const createTeam = createAsyncThunk(
    "team/create",
    async ({ teamName, maxTeamSize }, { rejectWithValue }) => {
        try {
            const res = await api.post("/team/create", { teamName, maxTeamSize });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get team details
export const getTeam = createAsyncThunk(
    "team/getTeam",
    async (teamId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/team/${teamId}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Join team
export const joinTeam = createAsyncThunk(
    "team/join",
    async ({ teamCode }, { rejectWithValue }) => {
        try {
            const res = await api.post("/team/join", { teamCode });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Leave team
export const leaveTeam = createAsyncThunk(
    "team/leave",
    async (teamId, { rejectWithValue }) => {
        try {
            const res = await api.post(`/team/${teamId}/leave`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Disband team
export const disbandTeam = createAsyncThunk(
    "team/disband",
    async (teamId, { rejectWithValue }) => {
        try {
            const res = await api.post(`/team/${teamId}/disband`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Get user's teams
export const getUserTeams = createAsyncThunk(
    "team/getUserTeams",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/team/my");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);
