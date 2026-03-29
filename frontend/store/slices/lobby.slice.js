import { createSlice } from "@reduxjs/toolkit";
import { getFriends } from "../api/social.thunk";

const initialState = {
    currentLobby: null, // { id, leaderId, members: [], mode: 'SOLO' }
    invites: [],
    friends: [],
    isLoading: false,
    error: null
};

const lobbySlice = createSlice({
    name: "lobby",
    initialState,
    reducers: {
        setLobby: (state, action) => {
            state.currentLobby = action.payload;
        },
        addInvite: (state, action) => {
            // Check if invite from this lobby already exists
            if (!state.invites.find(inv => inv.lobbyId === action.payload.lobbyId)) {
                state.invites.push(action.payload);
            }
        },
        removeInvite: (state, action) => {
            state.invites = state.invites.filter(inv => inv.lobbyId !== action.payload);
        },
        updateUserPresence: (state, action) => {
            const { userId, isOnline } = action.payload;
            const friendIndex = state.friends.findIndex(f => f.id === userId);
            if (friendIndex !== -1) {
                state.friends[friendIndex].isOnline = isOnline;
            }
        },
        resetLobby: (state) => {
            state.currentLobby = null;
            state.invites = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFriends.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getFriends.fulfilled, (state, action) => {
                state.isLoading = false;
                state.friends = action.payload;
            })
            .addCase(getFriends.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch friends";
            });
    }
});

export const { setLobby, addInvite, removeInvite, updateUserPresence, resetLobby } = lobbySlice.actions;
export default lobbySlice.reducer;
