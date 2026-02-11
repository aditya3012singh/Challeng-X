import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import battleReducer from "./slices/battle.slice";
import leaderboardReducer from "./slices/leaderboard.slice";
import problemReducer from "./slices/problem.slice";
import submissionReducer from "./slices/submission.slice";
import testcaseReducer from "./slices/testcase.slice";
import matchmakingReducer from "./slices/matchmaking.slice";
import teamReducer from "./slices/team.slice";
import teamBattleReducer from "./slices/teamBattle.slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        battle: battleReducer,
        leaderboard: leaderboardReducer,
        problem: problemReducer,
        submission: submissionReducer,
        testcase: testcaseReducer,
        matchmaking: matchmakingReducer,
        team: teamReducer,
        teamBattle: teamBattleReducer,
    },
});

export default store;