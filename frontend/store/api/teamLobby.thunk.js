import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Create custom lobby
export const createLobbyThunk = createAsyncThunk(
  "teamLobby/create",
  async ({ teamSize = 2, difficulty = "MEDIUM" }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle/lobby/create", { teamSize, difficulty });
      return data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create lobby");
    }
  }
);

// Get lobby state by room code
export const getLobbyThunk = createAsyncThunk(
  "teamLobby/get",
  async (roomCode, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/team-battle/lobby/${roomCode}`);
      return data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Lobby not found");
    }
  }
);

// Join lobby via room code
export const joinLobbyThunk = createAsyncThunk(
  "teamLobby/join",
  async (roomCode, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle/lobby/join", { roomCode });
      return data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to join lobby");
    }
  }
);

// Switch between Team Alpha and Team Bravo
export const switchTeamThunk = createAsyncThunk(
  "teamLobby/switchTeam",
  async ({ roomCode, targetTeam }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle/lobby/switch-team", { roomCode, targetTeam });
      return data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to switch team");
    }
  }
);

// Toggle player ready status
export const toggleReadyThunk = createAsyncThunk(
  "teamLobby/toggleReady",
  async (roomCode, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle/lobby/toggle-ready", { roomCode });
      return data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to toggle ready");
    }
  }
);

// Leave lobby
export const leaveLobbyThunk = createAsyncThunk(
  "teamLobby/leave",
  async (roomCode, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle/lobby/leave", { roomCode });
      return data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to leave lobby");
    }
  }
);

// Host starts team battle
export const startBattleThunk = createAsyncThunk(
  "teamLobby/start",
  async (roomCode, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle/lobby/start", { roomCode });
      return data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to start battle");
    }
  }
);
