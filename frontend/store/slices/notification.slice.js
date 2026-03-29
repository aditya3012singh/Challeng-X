import { createSlice } from "@reduxjs/toolkit";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../api/notification.thunk";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null
    },
    reducers: {
        addNotification: (state, action) => {
            const exists = state.notifications.find(n => n.id === action.payload.id);
            if (!exists) {
                state.notifications.unshift(action.payload);
                state.unreadCount += 1;
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // getNotifications
            .addCase(getNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
            })
            .addCase(getNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // markAsRead
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload.id);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // markAllAsRead
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => n.isRead = true);
                state.unreadCount = 0;
            })
            // deleteNotification
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(n => n.id === action.payload.id);
                if (index !== -1) {
                    const wasUnread = !state.notifications[index].isRead;
                    state.notifications.splice(index, 1);
                    if (wasUnread) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                }
            });
    }
});

export const { addNotification, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
