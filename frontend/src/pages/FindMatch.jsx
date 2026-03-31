import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSocket, isSocketConnected } from "../../lib/socket";
import { joinMatchmaking, leaveMatchmaking, getQueueStatus } from "../../store/api/matchmaking.thunk";
import { setMatchFound, resetMatchmaking } from "../../store/slices/matchmaking.slice";
import { toast } from "react-hot-toast";
import { Sparkles } from "lucide-react";
import axios from "../../lib/axios";

export const FindMatch = () => {
    const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
    const [connected, setConnected] = useState(isSocketConnected());
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentLobby } = useSelector((state) => state.lobby);
    const { user } = useSelector((state) => state.auth);
    const { inQueue, loading, error, queueSize, waitTime, matchFound, battleId, opponent } = useSelector(
        (state) => state.matchmaking
    );

    useEffect(() => {
        const socket = getSocket();

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        // Listen for match found
        socket.on("match_found", (data) => {
            console.log("Match found!", data);
            dispatch(setMatchFound(data));
        });

        socket.on("matchmakingError", (data) => {
            toast.error(data.message);
            handleLeaveQueue();
        });

        // Poll queue status every 2 seconds when in queue
        let statusInterval;
        if (inQueue && !matchFound) {
            statusInterval = setInterval(() => {
                dispatch(getQueueStatus());
            }, 2000);
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("match_found");
            socket.off("matchmakingError");
            if (statusInterval) clearInterval(statusInterval);
        };
    }, [inQueue, matchFound, dispatch]);

    // Navigate to battle when match is found
    useEffect(() => {
        if (matchFound && battleId) {
            setTimeout(() => {
                navigate(`/battle/${battleId}/ide`);
                dispatch(resetMatchmaking());
            }, 2000);
        }
    }, [matchFound, battleId, navigate, dispatch]);

    const handleJoinQueue = async () => {
        const socket = getSocket();
        try {
            await dispatch(joinMatchmaking({
                difficulty: selectedDifficulty,
                socketId: socket.id,
                lobbyId: currentLobby?.id
            })).unwrap();
        } catch (err) {
            console.error("Join queue error:", err);
        }
    };

    const handleLeaveQueue = async () => {
        try {
            await dispatch(leaveMatchmaking()).unwrap();
        } catch (err) {
            console.error("Leave queue error:", err);
        }
    };

    const handleSpawnGhost = async () => {
        const userId = user?.id;
        if (!userId) {
            toast.error("User identification failed");
            return;
        }

        try {
            const response = await axios.post("/ai/spawn-ghost", {
                userId,
                difficulty: selectedDifficulty
            });
            // Match found will be emitted by socket, but we can also handle it here if needed
            toast.success("AI Ghost Summoned: Entering Arena");
        } catch (err) {
            console.error("Spawn ghost error:", err);
            toast.error("Failed to summon ghost");
        }
    };

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        return `${seconds}s`;
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text-main)] flex items-center justify-center px-4 relative overflow-hidden font-[family:var(--font-body)]">
            {/* MINIMALIST BACKGROUND DECOR */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[var(--color-primary)] opacity-[0.015] blur-[180px] rounded-full"></div>
            </div>

            <div className="relative max-w-4xl w-full z-10">

                {matchFound ? (
                    // Match Found Screen - REFINED
                    <div className="premium-card p-20 text-center shadow-2xl animate-in zoom-in duration-500" style={{ borderRadius: "2px" }}>
                        <div className="text-[10px] font-bold tracking-[1em] text-[var(--color-success)] uppercase mb-8">Match Found</div>

                        <h1 className="text-6xl font-black text-[var(--color-text-main)] mb-6 tracking-tighter uppercase font-[family:var(--font-heading)]">Opponent Found</h1>

                        <div className="mb-10 flex flex-col items-center">
                            <div className="w-1 h-12 bg-[var(--color-success)] mb-6 opacity-40"></div>
                            <div className="px-10 py-4 border border-[var(--color-success)]/20 text-[var(--color-text-main)] font-black text-2xl tracking-widest uppercase bg-white/[0.02]">
                                {opponent}
                            </div>
                        </div>

                        <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-[0.4em] animate-pulse">Joining Match...</p>
                    </div>
                ) : inQueue ? (
                    // Searching Screen - SOPHISTICATED
                    <div className="premium-card p-20 text-center relative overflow-hidden" style={{ borderRadius: "2px" }}>
                        <div className="mb-12 relative flex justify-center">
                            <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center relative">
                                <div className="absolute inset-[-4px] border border-[var(--color-primary)]/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-[-12px] border border-[var(--color-primary)]/5 rounded-full"></div>
                                <div className="w-1 h-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)]"></div>
                            </div>
                        </div>

                        <div className="text-[10px] font-bold tracking-[0.8em] text-[var(--color-primary)] uppercase mb-6 pl-2">Searching</div>
                        <h1 className="text-5xl font-black text-[var(--color-text-main)] mb-4 tracking-tighter uppercase font-[family:var(--font-heading)]">Finding Opponent</h1>
                        <p className="text-[var(--color-text-muted)] text-sm font-light mb-16 tracking-widest">
                            Locating <span className="text-[var(--color-text-main)] font-bold">{selectedDifficulty}</span> players for a match.
                        </p>

                        <div className="grid grid-cols-2 gap-12 mb-16 max-w-md mx-auto">
                            <div className="text-left border-l border-white/10 pl-6">
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Players Waiting</p>
                                <p className="text-3xl font-black text-[var(--color-text-main)] tabular-nums">{queueSize}</p>
                            </div>
                            <div className="text-left border-l border-white/10 pl-6">
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Estimated Wait</p>
                                <p className="text-3xl font-black text-[var(--color-success)] tabular-nums">{formatTime(waitTime)}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLeaveQueue}
                            className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-600 hover:text-red-500 transition-colors mb-8 block mx-auto"
                        >
                            Cancel Search
                        </button>

                        {(waitTime > 10000) && (
                            <button
                                onClick={handleSpawnGhost}
                                className="group flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50 transition-all mx-auto animate-in fade-in duration-700"
                                style={{ borderRadius: "2px" }}
                            >
                                <Sparkles size={14} className="text-[var(--color-primary)] group-hover:animate-pulse" />
                                <span className="text-[10px] font-black text-[var(--color-text-main)] uppercase tracking-[0.3em]">Summon Ghost Opponent</span>
                            </button>
                        )}
                    </div>
                ) : (
                    // Selection Screen - PREMIUM
                    <div className="premium-card p-16 lg:p-20 relative overflow-hidden" style={{ borderRadius: "2px" }}>
                        <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-6">
                            {currentLobby?.mode === 'TEAM' ? "Squad Mission" : "Find a Match"}
                        </div>
                        <h1 className="text-6xl font-black text-[var(--color-text-main)] mb-12 tracking-tighter uppercase font-[family:var(--font-heading)]">
                            {currentLobby?.mode === 'TEAM' ? "Deploy Squad" : "Enter Arena"}
                        </h1>

                        <div className="mb-20">
                            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.4em] mb-10 text-center">
                                Choose Difficulty
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {["EASY", "MEDIUM", "HARD"].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setSelectedDifficulty(diff)}
                                        className={`p-8 border transition-all duration-300 relative group overflow-hidden ${selectedDifficulty === diff
                                            ? "border-[var(--color-primary)] bg-white/[0.02] text-[var(--color-text-main)]"
                                            : "border-white/5 bg-transparent text-slate-600 hover:border-white/20 hover:text-[var(--color-text-muted)]"
                                            }`}
                                        style={{ borderRadius: "2px" }}
                                    >
                                        <div className="relative z-10 text-center">
                                            <h3 className="text-lg font-black uppercase tracking-widest mb-2">{diff}</h3>
                                            <p className="text-[9px] font-bold tracking-widest opacity-60">
                                                {diff === "EASY" && "Recruit"}
                                                {diff === "MEDIUM" && "Standard"}
                                                {diff === "HARD" && "Veteran"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="border border-red-500/20 bg-red-500/5 text-red-500 p-6 mb-12 text-[10px] font-bold uppercase tracking-widest text-center" style={{ borderRadius: "2px" }}>
                                ⚠ Connection Error: {error}
                            </div>
                        )}

                        <button
                            onClick={handleJoinQueue}
                            disabled={loading || !connected}
                            className={`w-full py-6 font-black text-xs uppercase tracking-[0.4em] transition-all transform active:scale-95 shadow-2xl ${
                                (loading || !connected) 
                                ? "bg-slate-800 text-[var(--color-text-muted)] cursor-not-allowed opacity-50" 
                                : "bg-[var(--color-primary)] text-black hover:bg-white"
                            }`}
                            style={{ borderRadius: "2px" }}
                        >
                            {!connected ? "Connecting..." : loading ? "Searching..." : "Find Match →"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
