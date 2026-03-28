import { createSlice } from "@reduxjs/toolkit"
import { login, register, logoutUser, fetchUserProfile, refreshAccessToken, getPublicProfile, updateUserProfile } from "../api/auth.thunk";

const initialState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    profileLoading: true,
    publicProfile: null,
    publicProfileLoading: false,
    publicProfileError: null,
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
        clearPublicProfile: (state) => {
            state.publicProfile = null;
            state.publicProfileError = null;
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
                if (action.payload.accessToken) {
                    localStorage.setItem("accessToken", action.payload.accessToken);
                }
                if (action.payload.refreshToken) {
                    localStorage.setItem("refreshToken", action.payload.refreshToken);
                }
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
                state.isAuthenticated = true;
                state.user = action.payload.user;
                if (action.payload.accessToken) {
                    localStorage.setItem("accessToken", action.payload.accessToken);
                }
                if (action.payload.refreshToken) {
                    localStorage.setItem("refreshToken", action.payload.refreshToken);
                }
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
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                // Still clear state even if logout fails
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
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
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                // Token refreshed successfully, cookies updated
                state.isAuthenticated = true;
                if (action.payload.accessToken) {
                    localStorage.setItem("accessToken", action.payload.accessToken);
                }
                if (action.payload.refreshToken) {
                    localStorage.setItem("refreshToken", action.payload.refreshToken);
                }
            })
            .addCase(refreshAccessToken.rejected, (state) => {
                // Token refresh failed, user needs to login again
                state.isAuthenticated = false;
                state.user = null;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            })
            // Get Public Profile
            .addCase(getPublicProfile.pending, (state) => {
                state.publicProfileLoading = true;
                state.publicProfileError = null;
            })
            .addCase(getPublicProfile.fulfilled, (state, action) => {
                state.publicProfileLoading = false;
                state.publicProfile = action.payload.user;
                state.publicProfileError = null;
            })
            .addCase(getPublicProfile.rejected, (state, action) => {
                state.publicProfileLoading = false;
                state.publicProfileError = action.payload?.message || "Failed to load profile";
            })
            // Update Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update profile";
            });
    },
})

export const { clearError, setAuthenticated, clearPublicProfile } = authSlice.actions;

export default authSlice.reducer;