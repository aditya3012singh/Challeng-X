import { createSlice } from "@reduxjs/toolkit";
import {
  createTeamBattleByLeader,
  getAvailableBattles,
  joinTeamBattleWithCode,
  createTeamBattle,
  getTeamBattle,
  getTeamBattles,
  startTeamBattle,
  submitMatchSolution,
  determineMatchWinner,
  completeTeamBattle,
  getActiveTeamBattles,
} from "../api/teamBattle.thunk";

const initialState = {
  // NEW JOIN-CODE FLOW STATE
  currentBattle: null,
  availableBattles: [],
  joinCode: null,
  
  // LEGACY STATE
  teamBattles: [],
  activeBattles: [],
  currentMatches: [],
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
      state.currentMatches = action.payload?.matches || [];
    },
  },
  extraReducers: (builder) => {
    // ============================================
    // NEW JOIN-CODE FLOW HANDLERS
    // ============================================
    
    // Create Team Battle By Leader
    builder
      .addCase(createTeamBattleByLeader.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamBattleByLeader.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
        state.joinCode = action.payload.joinCode;
        state.successMessage = `Battle created! Join code: ${action.payload.joinCode}`;
      })
      .addCase(createTeamBattleByLeader.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Available Battles
    builder
      .addCase(getAvailableBattles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableBattles.fulfilled, (state, action) => {
        state.loading = false;
        state.availableBattles = action.payload || [];
      })
      .addCase(getAvailableBattles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Join Team Battle With Code
    builder
      .addCase(joinTeamBattleWithCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinTeamBattleWithCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
        state.successMessage = "Successfully joined battle! Battle is starting...";
      })
      .addCase(joinTeamBattleWithCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ============================================
    // LEGACY TOURNAMENT-STYLE HANDLERS
    // ============================================
    
    // Create Team Battle
    builder
      .addCase(createTeamBattle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamBattle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBattle = action.payload;
        state.currentMatches = action.payload?.matches || [];
        state.successMessage = "Tournament battle created! Matches are ready.";
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
        state.currentMatches = action.payload?.matches || [];
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
        state.currentMatches = action.payload?.matches || [];
        state.successMessage = "Battle started! All matches are live.";
      })
      .addCase(startTeamBattle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Submit Match Solution
    builder
      .addCase(submitMatchSolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitMatchSolution.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific match
        const matchIndex = state.currentMatches.findIndex(
          (m) => m.id === action.payload.id
        );
        if (matchIndex !== -1) {
          state.currentMatches[matchIndex] = action.payload;
        }
        state.successMessage = "Solution submitted for match!";
      })
      .addCase(submitMatchSolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Determine Match Winner
    builder
      .addCase(determineMatchWinner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(determineMatchWinner.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific match
        const matchIndex = state.currentMatches.findIndex(
          (m) => m.id === action.payload.id
        );
        if (matchIndex !== -1) {
          state.currentMatches[matchIndex] = action.payload;
        }
        // Update team win counts in current battle
        if (state.currentBattle) {
          state.currentBattle.team1Wins = action.payload.teamBattle?.team1Wins || 0;
          state.currentBattle.team2Wins = action.payload.teamBattle?.team2Wins || 0;
        }
        state.successMessage = "Match winner determined!";
      })
      .addCase(determineMatchWinner.rejected, (state, action) => {
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
        state.successMessage = `Tournament completed! ${action.payload.winnerTeamId === action.payload.team1Id ? action.payload.team1?.name : action.payload.team2?.name} won!`;
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
