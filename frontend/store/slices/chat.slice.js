import { createSlice } from "@reduxjs/toolkit";
import { getChatHistory } from "../api/chat.thunk";

const initialState = {
    conversations: {}, // { friendId: [messages] }
    activeChatId: null, // Current friend being chatted with
    isLoading: false,
    error: null
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setActiveChat: (state, action) => {
            state.activeChatId = action.payload;
        },
        addPrivateMessage: (state, action) => {
            const { message, myUserId } = action.payload;
            const friendId = message.senderId === myUserId ? message.receiverId : message.senderId;
            
            if (!state.conversations[friendId]) {
                state.conversations[friendId] = [];
            }
            state.conversations[friendId].push(message);
        },
        clearActiveChat: (state) => {
            state.activeChatId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getChatHistory.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getChatHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                const { friendId, messages } = action.payload;
                state.conversations[friendId] = messages;
            })
            .addCase(getChatHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to load chat";
            });
    }
});

export const { setActiveChat, addPrivateMessage, clearActiveChat } = chatSlice.actions;
export default chatSlice.reducer;
