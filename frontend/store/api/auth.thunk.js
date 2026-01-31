import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";


export const login= createAsyncThunk(
    "auth/login",
    async ({email, password}, {rejectWithValue}) => {
        try{
            const res= await api.post("/auth/login", {email, password});
            return res.data;
        }catch(err){
            return rejectWithValue(err.response.data);
        }
    }
)

export const register= createAsyncThunk(
    "auth/register",
    async ({username, email, password}, {rejectWithValue}) => {
        try{
            const res= await api.post("/auth/register", {username, email, password});
            return res.data;
        }catch(err){
            return rejectWithValue(err.response.data);
        }
    }
)