import { createSlice } from "@reduxjs/toolkit"
import { login, register, logoutUser, fetchUserProfile, refreshAccessToken } from "../api/auth.thunk";

const initialState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    profileLoading: false,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload || "Login failed";
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Registration failed";
            })
            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                // Still clear state even if logout fails
                state.user = null;
                state.isAuthenticated = false;
            })
            // Fetch Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.profileLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Refresh Token
            .addCase(refreshAccessToken.fulfilled, (state) => {
                // Token refreshed successfully, cookies updated
                state.isAuthenticated = true;
            })
            .addCase(refreshAccessToken.rejected, (state) => {
                // Token refresh failed, user needs to login again
                state.isAuthenticated = false;
                state.user = null;
            });
    },
})

export const { clearError, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;