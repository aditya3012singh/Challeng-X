import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import {
    getSquidGameStatus,
    startSquidGame,
} from "../../store/api/squidGame.thunk";

// Import split components
import LobbyScreen from "../components/SquidGame/LobbyScreen";
import WaitingRoom from "../components/SquidGame/WaitingRoom";
import RoundScreen from "../components/SquidGame/RoundScreen";
import OrganizerView from "../components/SquidGame/OrganizerView";
import EliminationScreen from "../components/SquidGame/EliminationScreen";
import CompletedScreen from "../components/SquidGame/CompletedScreen";
import { SOCKET_URL, ROUND_CONFIG } from "../components/SquidGame/SquidGameConfig";
import api from "../../lib/axios";

// ═══════════════════════════════════════════════════
// MAIN SQUID GAME COMPONENT
// ═══════════════════════════════════════════════════
export const SquidMode = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { gameId } = useParams();
    const location = useLocation();
    const { tournament } = useSelector(s => s.squidGame);
    const { user } = useSelector(s => s.auth);

    const isHostURL = location.pathname.endsWith("/host");

    // Use stable ID comparison (handle potential string/number mix and whitespace)
    const isHost = tournament?.hostId && user?.id && String(tournament.hostId) === String(user.id);

    useEffect(() => {
        if (tournament && user) {
            console.log("🦑 SquidMode Host Check:", {
                isHost,
                isHostURL,
                tournamentHostId: tournament.hostId,
                userId: user.id,
                match: String(tournament.hostId) === String(user.id)
            });
        }
    }, [tournament, user, isHost, isHostURL]);

    const [phase, setPhase] = useState(gameId ? "WAITING" : "LOBBY");
    const [squidGameId, setSquidGameId] = useState(gameId || null);
    const [roundInfo, setRoundInfo] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [leaderboard, setLeaderboardState] = useState([]);
    const [eliminationData, setEliminationData] = useState(null);
    const [playerStreams, setPlayerStreams] = useState({}); // { userId: { code, language } }

    const socketRef = useRef(null);
    const timerRef = useRef(null);

    // Connect to Squid Game WebSocket namespace
    useEffect(() => {
        if (!squidGameId) return;

        const sgSocket = io(`${SOCKET_URL}/squid-game`, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        sgSocket.on("connect", () => {
            console.log("🦑 Connected to Squid Game namespace");
            sgSocket.emit("squid_game:join_tournament", { squidGameId, userId: user?.id });

            // If host, join host room to receive all streams
            if (isHost) {
                sgSocket.emit("squid_game:join_host", { squidGameId });
            }
        });

        // Listen for events
        sgSocket.on("squid_game:player_joined", () => {
            // Refresh tournament status to get updated participant list
            dispatch(getSquidGameStatus({ squidGameId }));
        });

        sgSocket.on("squid_game:round_started", (data) => {
            setRoundInfo(data);
            setTimeLeft(data.timeLimit || 600);
            setPhase("PLAYING");
        });

        sgSocket.on("squid_game:submission_received", (data) => {
            // Update leaderboard when someone submits
            console.log("Submission received:", data);
        });

        sgSocket.on("squid_game:leaderboard_updated", (data) => {
            setLeaderboardState(data.leaderboard || []);
        });

        sgSocket.on("squid_game:round_ended", (data) => {
            setEliminationData(data);
            setPhase("ELIMINATION");
            if (data.leaderboard) setLeaderboardState(data.leaderboard);
        });

        sgSocket.on("squid_game:players_eliminated", (data) => {
            setEliminationData(prev => ({ ...prev, ...data }));
            if (data.leaderboard) setLeaderboardState(data.leaderboard);
        });

        sgSocket.on("squid_game:tournament_completed", (data) => {
            if (data.finalLeaderboard) setLeaderboardState(data.finalLeaderboard);
            setPhase("COMPLETED");
        });

        sgSocket.on("squid_game:player_eliminated", (data) => {
            // If the current user is eliminated (disqualified)
            if (data.userId === user?.id) {
                // Refresh status to get updated tournament state
                dispatch(getSquidGameStatus({ squidGameId }));
                // The phase will stay PLAYING, but the OrganizerView check will now pass for this user
            }
        });

        sgSocket.on("submission_result", (data) => {
            console.log("📥 [SquidMode] Real submission result received via sgSocket:", data);
            // We can show a toast or local notification here
        });

        sgSocket.on("squid_game:host_code_update", (data) => {
            console.log("📺 Feed received:", data.username, data.language);
            setPlayerStreams(prev => ({
                ...prev,
                [data.userId]: data
            }));
        });

        socketRef.current = sgSocket;

        return () => {
            sgSocket.disconnect();
            socketRef.current = null;
        };
    }, [squidGameId, user?.id, dispatch, isHost]);

    // Consolidate room joining logic
    useEffect(() => {
        if (!socketRef.current || !socketRef.current.connected || !squidGameId) return;

        const isEliminated = leaderboard.find(e => e.userId === user?.id)?.status === "ELIMINATED";

        // Always join main tournament room
        socketRef.current.emit("squid_game:join_tournament", { squidGameId, userId: user?.id });

        // Join host room if host or spectator
        if (isHost || isEliminated) {
            console.log("🦑 Joining host/spectator room:", { isHost, isEliminated });
            socketRef.current.emit("squid_game:join_host", { squidGameId });
        }
    }, [squidGameId, isHost, leaderboard, user?.id]);

    // Timer countdown during a round
    useEffect(() => {
        if (phase !== "PLAYING") return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [phase]);

    // Poll tournament status while in waiting room
    useEffect(() => {
        if (phase !== "WAITING" || !squidGameId) return;

        const interval = setInterval(() => {
            dispatch(getSquidGameStatus({ squidGameId }));
        }, 5000);

        return () => clearInterval(interval);
    }, [phase, squidGameId, dispatch]);

    // When tournament status changes, update phase
    useEffect(() => {
        if (!tournament) return;

        if (tournament.status === "ROUND_ACTIVE" && phase === "WAITING") {
            // Set timer from round config based on current round
            const roundConfig = ROUND_CONFIG.find(r => r.round === tournament.currentRound);
            const currentRoundData = tournament.roundProblems?.find(r => r.roundNumber === tournament.currentRound);
            setTimeLeft(currentRoundData?.timeLimit || (roundConfig ? parseInt(roundConfig.time) * 60 : 600));
            setPhase("PLAYING");
        } else if (tournament.status === "COMPLETED" && phase !== "COMPLETED") {
            setPhase("COMPLETED");
        }
    }, [tournament?.status, phase]);

    const handleCreateOrJoin = (id, options = {}) => {
        setSquidGameId(id);
        dispatch(getSquidGameStatus({ squidGameId: id }));
        setPhase("WAITING");
        if (options.isHost) {
            navigate(`/squid-game/${id}/host`);
        } else {
            navigate(`/squid-game/${id}`);
        }
    };

    useEffect(() => {
        if (gameId && !squidGameId) {
            setSquidGameId(gameId);
            setPhase("WAITING");
            dispatch(getSquidGameStatus({ squidGameId: gameId }));
        }
    }, [gameId, squidGameId, dispatch]);

    const handleStart = async () => {
        if (!squidGameId) return;
        await dispatch(startSquidGame({ squidGameId }));
    };

    const handleSubmitCode = async ({ code, language, type = "SUBMIT" }) => {
        console.log("🟠 [SquidMode] handleSubmitCode (API) received from child:", { type, gameId });
        try {
            await api.post(`/squid-game/${gameId}/submit`, {
                code,
                language,
                type
            });
            console.log(`📝 [SquidMode] Submission queued via API for ${type}`);
        } catch (error) {
            console.error("❌ [SquidMode] API Submission failed:", error);
            // Optionally emit a local error to the RoundScreen component
            alert(`Submission failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEndRound = () => {
        if (socketRef.current) {
            socketRef.current.emit("squid_game:end_round", { squidGameId });
        }
    };

    const handleNextRound = () => {
        if (socketRef.current) {
            socketRef.current.emit("squid_game:next_round", { squidGameId });
        }
    };

    const handleDisqualify = (userId) => {
        if (socketRef.current) {
            // Match backend: expects { squidGameId, userId }
            socketRef.current.emit("squid_game:disqualify_player", { squidGameId, userId });
        }
    };

    const handleEnterSpectator = () => {
        setPhase("PLAYING");
    };

    // Render current phase
    switch (phase) {
        case "LOBBY":
            return <LobbyScreen onCreateOrJoin={handleCreateOrJoin} />;

        case "WAITING":
            return <WaitingRoom tournament={tournament} onStart={handleStart} isHost={isHost} />;

        case "PLAYING":
            const isEliminated = Array.isArray(leaderboard) && leaderboard.find(e => String(e.userId) === String(user?.id))?.status === "ELIMINATED";
            if (isHost || isEliminated) {
                console.log("🦑 Entering SquidMode (Organizer/Spectator View)");
                return (
                    <OrganizerView
                        tournament={tournament}
                        roundInfo={roundInfo}
                        timeLeft={timeLeft}
                        leaderboard={leaderboard}
                        playerStreams={playerStreams}
                        onEndRound={handleEndRound}
                        onDisqualify={handleDisqualify}
                        // Assuming OrganizerView internally uses a CodeEditor and needs a fallback language
                        // This prop would need to be passed down and used by OrganizerView's internal CodeEditor
                        fallbackLanguage="java" // Added fallback language prop
                    />
                );
            }
            return (
                <RoundScreen
                    tournament={tournament}
                    roundInfo={roundInfo}
                    timeLeft={timeLeft}
                    onSubmit={handleSubmitCode}
                    leaderboard={leaderboard}
                    socket={socketRef.current}
                    user={user}
                />
            );

        case "ELIMINATION":
            return (
                <EliminationScreen
                    roundNumber={tournament?.currentRound || 1}
                    eliminated={eliminationData?.eliminatedCount || 0}
                    survived={eliminationData?.remainingPlayers || 0}
                    leaderboard={leaderboard}
                    onContinue={handleNextRound}
                    isLastRound={tournament?.currentRound === tournament?.totalRounds}
                    isHost={isHost}
                    onSpectate={handleEnterSpectator}
                    userId={user?.id}
                />
            );

        case "COMPLETED":
            return <CompletedScreen tournament={tournament} leaderboard={leaderboard} />;

        default:
            return <LobbyScreen onCreateOrJoin={handleCreateOrJoin} />;
    }
};
