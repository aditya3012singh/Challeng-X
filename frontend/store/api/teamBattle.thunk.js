import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";


export const createTeamBattle = createAsyncThunk(
  "teamBattle/create",
  async (battleData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/team-battle", battleData);
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
      const { data } = await api.post(
        `/team-battle/${battleCode}/start`
      );
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to start team battle"
      );
    }
  }
);

export const submitTeamBattleSolution = createAsyncThunk(
  "teamBattle/submit",
  async ({ battleCode, code, language, output }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/team-battle/${battleCode}/submit`,
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

export const getTeamBattleSubmissions = createAsyncThunk(
  "teamBattle/getSubmissions",
  async (battleCode, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/team-battle/${battleCode}/submissions`
      );
      return data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch submissions"
      );
    }
  }
);

export const completeTeamBattle = createAsyncThunk(
  "teamBattle/complete",
  async ({ battleCode, winnerTeamId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/team-battle/${battleCode}/complete`,
        { winnerTeamId }
      );
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
