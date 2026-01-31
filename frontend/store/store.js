import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import authReducer from "./slices/auth.slice";
import battleReducer from "./slices/battle.slice";
import leaderboardReducer from "./slices/leaderboard.slice";
import problemReducer from "./slices/problem.slice";
import submissionReducer from "./slices/submission.slice";
import testcaseReducer from "./slices/testcase.slice";

// Configure which parts of auth state to persist
const persistConfig = {
    key: "auth",
    storage,
    whitelist: ["user", "isAuthenticated"], // Only persist user and auth status
    // blacklist: ["loading", "error"], // Don't persist loading and error states
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        battle: battleReducer,
        leaderboard: leaderboardReducer,
        problem: problemReducer,
        submission: submissionReducer,
        testcase: testcaseReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist actions
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }),
});

export const persistor = persistStore(store);
export default store;