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
import squidGameReducer from "./slices/squidGame.slice";
import socialReducer from "./slices/social.slice";
import lobbyReducer from "./slices/lobby.slice";
import chatReducer from "./slices/chat.slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        social: socialReducer,
        battle: battleReducer,
        leaderboard: leaderboardReducer,
        problem: problemReducer,
        submission: submissionReducer,
        testcase: testcaseReducer,
        matchmaking: matchmakingReducer,
        team: teamReducer,
        teamBattle: teamBattleReducer,
        squidGame: squidGameReducer,
        lobby: lobbyReducer,
        chat: chatReducer,
    },
});

export default store;