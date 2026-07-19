import { createSlice } from "@reduxjs/toolkit"
import { login, register, logoutUser, fetchUserProfile, refreshAccessToken, getPublicProfile, updateUserProfile } from "../api/auth.thunk";

const savedUser = (() => {
    try {
        const cached = localStorage.getItem("user");
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        return null;
    }
})();

const initialState = {
    user: savedUser,
    loading: false,
    error: null,
    isAuthenticated: !!savedUser,
    profileLoading: !savedUser,
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
        stopProfileLoading: (state) => {
            state.profileLoading = false;
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
                if (action.payload.user) {
                    try { localStorage.setItem("user", JSON.stringify(action.payload.user)); } catch (e) {}
                }
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
                const payload = action.payload;
                state.error = typeof payload === 'object'
                    ? (payload?.message || payload?.error || "Invalid email or password")
                    : (payload || "Invalid email or password");
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
                if (action.payload.user) {
                    try { localStorage.setItem("user", JSON.stringify(action.payload.user)); } catch (e) {}
                }
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
                localStorage.removeItem("user");
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                // Still clear state even if logout fails
                state.user = null;
                state.isAuthenticated = false;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
            })
            // Fetch Profile
            .addCase(fetchUserProfile.pending, (state) => {
                // If user is already hydrated from localStorage, keep profileLoading false
                if (!state.user) {
                    state.profileLoading = true;
                }
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                if (action.payload.user) {
                    try { localStorage.setItem("user", JSON.stringify(action.payload.user)); } catch (e) {}
                }
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                localStorage.removeItem("user");
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

export const { clearError, setAuthenticated, clearPublicProfile, stopProfileLoading } = authSlice.actions;

export default authSlice.reducer;