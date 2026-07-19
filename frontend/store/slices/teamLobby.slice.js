import { createSlice } from "@reduxjs/toolkit";
import {
  createLobbyThunk,
  getLobbyThunk,
  joinLobbyThunk,
  switchTeamThunk,
  toggleReadyThunk,
  leaveLobbyThunk,
  startBattleThunk
} from "../api/teamLobby.thunk";

const initialState = {
  currentLobby: null,
  loading: false,
  error: null,
  isStarting: false
};

const teamLobbySlice = createSlice({
  name: "teamLobby",
  initialState,
  reducers: {
    setLobbyState: (state, action) => {
      state.currentLobby = action.payload;
    },
    optimisticSwitchTeam: (state, action) => {
      const { userId, targetTeam } = action.payload;
      if (!state.currentLobby) return;

      const alphaIdx = state.currentLobby.teamAlpha.findIndex(s => s && s.userId === userId);
      const bravoIdx = state.currentLobby.teamBravo.findIndex(s => s && s.userId === userId);
      let playerObj = null;

      if (alphaIdx !== -1) playerObj = state.currentLobby.teamAlpha[alphaIdx];
      if (bravoIdx !== -1) playerObj = state.currentLobby.teamBravo[bravoIdx];

      if (!playerObj) return;

      if (targetTeam === "ALPHA" && alphaIdx === -1) {
        const openIdx = state.currentLobby.teamAlpha.findIndex(s => s === null);
        if (openIdx !== -1) {
          state.currentLobby.teamBravo[bravoIdx] = null;
          state.currentLobby.teamAlpha[openIdx] = playerObj;
        }
      } else if (targetTeam === "BRAVO" && bravoIdx === -1) {
        const openIdx = state.currentLobby.teamBravo.findIndex(s => s === null);
        if (openIdx !== -1) {
          state.currentLobby.teamAlpha[alphaIdx] = null;
          state.currentLobby.teamBravo[openIdx] = playerObj;
        }
      }
    },
    updateScoreboard: (state, action) => {
      if (state.currentLobby) {
        const { teamAlphaScore, teamBravoScore, matches, overallWinnerTeam } = action.payload;
        state.currentLobby.teamAlphaScore = teamAlphaScore;
        state.currentLobby.teamBravoScore = teamBravoScore;
        state.currentLobby.matches = matches;
        state.currentLobby.overallWinnerTeam = overallWinnerTeam;
      }
    },
    resetLobby: (state) => {
      state.currentLobby = null;
      state.loading = false;
      state.error = null;
      state.isStarting = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Lobby
      .addCase(createLobbyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLobbyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLobby = action.payload;
      })
      .addCase(createLobbyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Lobby
      .addCase(getLobbyThunk.fulfilled, (state, action) => {
        state.currentLobby = action.payload;
      })
      // Join Lobby
      .addCase(joinLobbyThunk.fulfilled, (state, action) => {
        state.currentLobby = action.payload;
      })
      // Switch Team
      .addCase(switchTeamThunk.fulfilled, (state, action) => {
        state.currentLobby = action.payload;
      })
      // Toggle Ready
      .addCase(toggleReadyThunk.fulfilled, (state, action) => {
        state.currentLobby = action.payload;
      })
      // Leave Lobby
      .addCase(leaveLobbyThunk.fulfilled, (state) => {
        state.currentLobby = null;
      })
      // Start Battle
      .addCase(startBattleThunk.pending, (state) => {
        state.isStarting = true;
      })
      .addCase(startBattleThunk.fulfilled, (state, action) => {
        state.isStarting = false;
        state.currentLobby = action.payload;
      })
      .addCase(startBattleThunk.rejected, (state, action) => {
        state.isStarting = false;
        state.error = action.payload;
      });
  }
});

export const { setLobbyState, optimisticSwitchTeam, updateScoreboard, resetLobby } = teamLobbySlice.actions;
export default teamLobbySlice.reducer;
