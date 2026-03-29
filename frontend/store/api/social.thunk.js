import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const toggleFollow = createAsyncThunk(
    "social/toggleFollow",
    async (targetUserId, { rejectWithValue }) => {
        try {
            const res = await api.post("/social/follow", { targetUserId });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to follow user" });
        }
    }
);

export const sendFriendRequest = createAsyncThunk(
    "social/sendFriendRequest",
    async (receiverId, { rejectWithValue }) => {
        try {
            const res = await api.post("/social/friend-request", { receiverId });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to send friend request" });
        }
    }
);

export const respondToFriendRequest = createAsyncThunk(
    "social/respondToFriendRequest",
    async ({ requestId, status }, { rejectWithValue }) => {
        try {
            const res = await api.post("/social/friend-respond", { requestId, status });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to respond to request" });
        }
    }
);

export const getIncomingRequests = createAsyncThunk(
    "social/getIncomingRequests",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/social/requests/incoming");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to fetch requests" });
        }
    }
);

export const getSocialStatus = createAsyncThunk(
    "social/getSocialStatus",
    async (targetUserId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/social/status/${targetUserId}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to fetch social status" });
        }
    }
);

export const getFriends = createAsyncThunk(
    "social/getFriends",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/social/friends");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Failed to fetch friends" });
        }
    }
);
