import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Fetch chat history with a friend
export const getChatHistory = createAsyncThunk(
    "chat/getHistory",
    async (friendId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/social/chat/${friendId}`);
            return { friendId, messages: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);
