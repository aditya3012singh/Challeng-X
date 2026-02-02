import { createSlice } from "@reduxjs/toolkit";
import { createTeam, getTeam, joinTeam, leaveTeam, disbandTeam, getUserTeams } from "../api/team.thunk";

const initialState = {
    currentTeam: null,
    userTeams: [],
    loading: false,
    error: null,
    successMessage: null,
};

const teamSlice = createSlice({
    name: "team",
    initialState,
    reducers: {
        clearTeamError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Team
            .addCase(createTeam.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTeam.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTeam = action.payload;
                state.userTeams.push(action.payload);
                state.successMessage = "Team created successfully";
            })
            .addCase(createTeam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to create team";
            })
            // Get Team
            .addCase(getTeam.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTeam.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTeam = action.payload;
            })
            .addCase(getTeam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch team";
            })
            // Join Team
            .addCase(joinTeam.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinTeam.fulfilled, (state) => {
                state.loading = false;
                state.successMessage = "Joined team successfully";
            })
            .addCase(joinTeam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to join team";
            })
            // Leave Team
            .addCase(leaveTeam.pending, (state) => {
                state.loading = true;
            })
            .addCase(leaveTeam.fulfilled, (state, action) => {
                state.loading = false;
                state.userTeams = state.userTeams.filter(t => t.id !== state.currentTeam?.id);
                state.currentTeam = null;
                state.successMessage = "Left team successfully";
            })
            .addCase(leaveTeam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to leave team";
            })
            // Disband Team
            .addCase(disbandTeam.pending, (state) => {
                state.loading = true;
            })
            .addCase(disbandTeam.fulfilled, (state, action) => {
                state.loading = false;
                state.userTeams = state.userTeams.filter(t => t.id !== state.currentTeam?.id);
                state.currentTeam = null;
                state.successMessage = "Team disbanded successfully";
            })
            .addCase(disbandTeam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to disband team";
            })
            // Get User Teams
            .addCase(getUserTeams.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserTeams.fulfilled, (state, action) => {
                state.loading = false;
                state.userTeams = action.payload.teams;
            })
            .addCase(getUserTeams.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch teams";
            });
    },
});

export const { clearTeamError, clearSuccessMessage } = teamSlice.actions;
export default teamSlice.reducer;
