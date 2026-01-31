import { createSlice } from "@reduxjs/toolkit"
import { login, register } from "../api/auth.thunk";

const initialState = {
    user: null,
    loading:false,
    error:null,
    isAuthenticated: false,
}

const authSlice= createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Login failed";
        })
        .addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        })
        .addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Registration failed";
        });
    },
})

export default authSlice.reducer;