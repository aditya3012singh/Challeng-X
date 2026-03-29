import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/notifications";

export const getNotifications = createAsyncThunk(
    "notification/getNotifications",
    async ({ limit = 20, offset = 0 } = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}?limit=${limit}&offset=${offset}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
        }
    }
);

export const markAsRead = createAsyncThunk(
    "notification/markAsRead",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/read`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    "notification/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_URL}/read-all`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
        }
    }
);

export const deleteNotification = createAsyncThunk(
    "notification/deleteNotification",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete notification");
        }
    }
);
