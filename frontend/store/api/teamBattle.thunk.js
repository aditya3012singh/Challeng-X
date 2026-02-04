import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// ============================================
// NEW JOIN-CODE FLOW THUNKS
// ============================================

// Create team battle (Team1 leader)
export const createTeamBattleByLeader = createAsyncThunk(
  "teamBattle/createByLeader",
  async ({ team1Id, maxTeamSize }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle/create", {
        team1Id,
        maxTeamSize,
      });
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create team battle"
      );
    }
  }
);

// Get available battles for Team2 to join
export const getAvailableBattles = createAsyncThunk(
  "teamBattle/available",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/team-battle/available");
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch available battles"
      );
    }
  }
);

// Join battle with join code (Team2 leader)
export const joinTeamBattleWithCode = createAsyncThunk(
  "teamBattle/joinWithCode",
  async ({ joinCode, team2Id }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle/join", {
        joinCode,
        team2Id,
      });
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to join team battle"
      );
    }
  }
);

// ============================================
// LEGACY TOURNAMENT-STYLE THUNKS
// ============================================

export const createTeamBattle = createAsyncThunk(
  "teamBattle/create",
  async ({ team1Id, team2Id, maxTeamSize }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle", {
        team1Id,
        team2Id,
        maxTeamSize,
      });
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create team battle"
      );
    }
  }
);

export const getTeamBattle = createAsyncThunk(
  "teamBattle/getOne",
  async (battleCode, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/team-battle/${battleCode}`);
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch team battle"
      );
    }
  }
);

export const getTeamBattles = createAsyncThunk(
  "teamBattle/getTeamBattles",
  async (teamId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/team-battle/team/${teamId}`);
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch team battles"
      );
    }
  }
);

export const startTeamBattle = createAsyncThunk(
  "teamBattle/start",
  async (battleCode, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/team-battle/${battleCode}/start`);
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to start team battle"
      );
    }
  }
);

export const submitMatchSolution = createAsyncThunk(
  "teamBattle/submitMatch",
  async ({ battleCode, matchId, code, language, output }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/team-battle/${battleCode}/${matchId}/submit`,
        { code, language, output }
      );
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to submit solution"
      );
    }
  }
);

export const determineMatchWinner = createAsyncThunk(
  "teamBattle/determineWinner",
  async ({ matchId, winnerId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/team-battle/${matchId}/winner`, {
        winnerId,
      });
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to determine winner"
      );
    }
  }
);

export const completeTeamBattle = createAsyncThunk(
  "teamBattle/complete",
  async (battleCode, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/team-battle/${battleCode}/complete`);
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to complete team battle"
      );
    }
  }
);

export const getActiveTeamBattles = createAsyncThunk(
  "teamBattle/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/team-battle/active");
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch active battles"
      );
    }
  }
);
