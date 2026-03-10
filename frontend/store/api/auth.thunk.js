import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";


export const login = createAsyncThunk(
    "auth/login",
    async ({email, password}, {rejectWithValue}) => {
        try{
            const res = await api.post("/auth/login", {email, password});
            return res.data;
        }catch(err){
            return rejectWithValue(err.response.data);
        }
    }
)

export const register = createAsyncThunk(
    "auth/register",
    async ({username, email, password}, {rejectWithValue}) => {
        try{
            const res = await api.post("/auth/register", {username, email, password});
            return res.data;
        }catch(err){
            return rejectWithValue(err.response.data);
        }
    }
)

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, {rejectWithValue}) => {
        try{
            const res = await api.post("/auth/logout");
            return res.data;
        }catch(err){
            return rejectWithValue(err.response?.data || { message: "Logout failed" });
        }
    }
)

export const fetchUserProfile = createAsyncThunk(
    "auth/fetchProfile",
    async (_, {rejectWithValue}) => {
        try{
            const res = await api.get("/auth/profile");
            return res.data;
        }catch(err){
            return rejectWithValue(err.response?.data || { message: "Failed to fetch profile" });
        }
    }
)

export const refreshAccessToken = createAsyncThunk(
    "auth/refresh",
    async (_, {rejectWithValue}) => {
        try{
            const res = await api.post("/auth/refresh");
            return res.data;
        }catch(err){
            return rejectWithValue(err.response?.data || { message: "Token refresh failed" });
        }
    }
)

export const getPublicProfile = createAsyncThunk(
    "auth/getPublicProfile",
    async (username, {rejectWithValue}) => {
        try{
            const res = await api.get(`/auth/user/${username}`);
            return res.data;
        }catch(err){
            return rejectWithValue(err.response?.data || { message: "Failed to fetch user profile" });
        }
    }
)

export const updateUserProfile = createAsyncThunk(
    "auth/updateProfile",
    async (profileData, { rejectWithValue }) => {
        try {
            const res = await api.put("/auth/profile", profileData);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to update profile" });
        }
    }
)