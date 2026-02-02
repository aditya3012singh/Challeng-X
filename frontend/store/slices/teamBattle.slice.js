import { createSlice } from "@reduxjs/toolkit";
import {
  createTeamBattle,
  getTeamBattle,
  getTeamBattles,
  startTeamBattle,
  submitTeamBattleSolution,
  getTeamBattleSubmissions,
  completeTeamBattle,
  getActiveTeamBattles,
} from "../api/teamBattle.thunk";

const initialState = {
  currentBattle: null,
  teamBattles: [],
  activeBattles: [],
  submissions: [],
  loading: false,
  error: null,
  successMessage: null,
};

const teamBattleSlice = createSlice({
  name: "teamBattle",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentBattle: (state, action) => {
      state.currentBattle = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Team Battle
    builder
      .addCase(createTeamBattle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamBattle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
        state.successMessage = "Team battle created successfully!";
      })
      .addCase(createTeamBattle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Team Battle
    builder
      .addCase(getTeamBattle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamBattle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
      })
      .addCase(getTeamBattle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Team Battles
    builder
      .addCase(getTeamBattles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamBattles.fulfilled, (state, action) => {
        state.loading = false;
        state.teamBattles = action.payload || [];
      })
      .addCase(getTeamBattles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Start Team Battle
    builder
      .addCase(startTeamBattle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTeamBattle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
        state.successMessage = "Team battle started!";
      })
      .addCase(startTeamBattle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Submit Solution
    builder
      .addCase(submitTeamBattleSolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTeamBattleSolution.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions.push(action.payload);
        state.successMessage = "Solution submitted!";
      })
      .addCase(submitTeamBattleSolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Submissions
    builder
      .addCase(getTeamBattleSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamBattleSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload || [];
      })
      .addCase(getTeamBattleSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Complete Team Battle
    builder
      .addCase(completeTeamBattle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTeamBattle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
        state.successMessage = "Team battle completed!";
      })
      .addCase(completeTeamBattle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Active Battles
    builder
      .addCase(getActiveTeamBattles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveTeamBattles.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBattles = action.payload || [];
      })
      .addCase(getActiveTeamBattles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, setCurrentBattle } =
  teamBattleSlice.actions;
export default teamBattleSlice.reducer;
