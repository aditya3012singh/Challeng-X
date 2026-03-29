import { createSlice } from "@reduxjs/toolkit";
import { getSocialStatus, toggleFollow, sendFriendRequest, respondToFriendRequest, getIncomingRequests } from "../api/social.thunk";

const initialState = {
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
    friendStatus: null, // PENDING, ACCEPTED, REJECTED, or null
    incomingRequests: [],
    isLoading: false,
    error: null
};

const socialSlice = createSlice({
    name: "social",
    initialState,
    reducers: {
        resetSocialState: (state) => {
            Object.assign(state, initialState);
        }
    },
    extraReducers: (builder) => {
        builder
            // getSocialStatus
            .addCase(getSocialStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getSocialStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.followersCount = action.payload.followersCount;
                state.followingCount = action.payload.followingCount;
                state.isFollowing = action.payload.isFollowing;
                state.friendStatus = action.payload.friendStatus;
            })
            .addCase(getSocialStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch social status";
            })
            // getIncomingRequests
            .addCase(getIncomingRequests.fulfilled, (state, action) => {
                state.incomingRequests = action.payload;
            })
            // toggleFollow
            .addCase(toggleFollow.fulfilled, (state, action) => {
                state.isFollowing = action.payload.followed;
                state.followersCount += action.payload.followed ? 1 : -1;
            })
            // sendFriendRequest
            .addCase(sendFriendRequest.fulfilled, (state) => {
                state.friendStatus = "PENDING";
            })
            // respondToFriendRequest
            .addCase(respondToFriendRequest.fulfilled, (state, action) => {
                const { requestId, status } = action.meta.arg;
                
                // Remove from incomingRequests if present
                state.incomingRequests = state.incomingRequests.filter(req => req.id !== requestId);

                if (status === "ACCEPTED") {
                    state.friendStatus = "ACCEPTED";
                } else {
                    state.friendStatus = null;
                }
            });
    }
});

export const { resetSocialState } = socialSlice.actions;
export default socialSlice.reducer;
