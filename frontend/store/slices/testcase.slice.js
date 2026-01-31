import { createSlice } from "@reduxjs/toolkit";
import { addTestcases } from "../api/testcase.thunk";

const initialState = {
    testcases: [],
    loading: false,
    error: null,
};

const testcaseSlice = createSlice({
    name: "testcase",
    initialState,
    reducers: {
        clearTestcaseError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addTestcases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addTestcases.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(addTestcases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to add testcases";
            });
    },
});

export const { clearTestcaseError } = testcaseSlice.actions;
export default testcaseSlice.reducer;
