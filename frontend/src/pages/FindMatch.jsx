import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../lib/socket";
import { joinMatchmaking, leaveMatchmaking, getQueueStatus } from "../../store/api/matchmaking.thunk";
import { setMatchFound, resetMatchmaking } from "../../store/slices/matchmaking.slice";

export const FindMatch = () => {
    const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { inQueue, loading, error, queueSize, waitTime, matchFound, battleId, opponent } = useSelector(
        (state) => state.matchmaking
    );

    useEffect(() => {
        const socket = getSocket();

        // Listen for match found
        socket.on("matchFound", (data) => {
            console.log("Match found!", data);
            dispatch(setMatchFound(data));
        });

        socket.on("matchmakingError", (data) => {
            alert(data.message);
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
            socket.off("matchFound");
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
                socketId: socket.id
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

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        return `${seconds}s`;
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] text-white flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

            <div className="relative max-w-3xl w-full z-10 font-[family:var(--font-heading)]">

                {matchFound ? (
                    // Match Found Screen
                    <div className="glass-panel border-2 border-[var(--color-success)] rounded-xl p-12 text-center shadow-[0_0_50px_var(--color-success)] animate-pulse">
                        <div className="text-8xl mb-6 filter drop-shadow-[0_0_10px_var(--color-success)]">🎯</div>
                        <h1 className="text-5xl font-black mb-4 text-white">TARGET ACQUIRED</h1>
                        <div className="inline-block px-6 py-2 bg-[var(--color-success)] text-black font-bold text-xl rounded mb-4">
                            {opponent}
                        </div>
                        <p className="text-xl text-[var(--color-success)] animate-bounce mt-4"> INITIATING BATTLE SEQUENCE...</p>
                    </div>
                ) : inQueue ? (
                    // Searching Screen
                    <div className="glass-panel rounded-xl p-12 text-center border-glow relative overflow-hidden">
                        <div className="scanline"></div>

                        <div className="mb-10 relative">
                            <div className="w-32 h-32 mx-auto rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin relative z-10"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl">📡</span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold mb-2 text-white text-glow">SCANNING NETWORK</h1>
                        <p className="text-[var(--color-text-muted)] mb-8">
                            SEARCHING FOR <span className="text-[var(--color-primary)]">{selectedDifficulty}</span> OPERATIVES
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-10 max-w-md mx-auto">
                            <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Active queue</p>
                                <p className="text-3xl font-bold text-[var(--color-primary)]">{queueSize}</p>
                            </div>
                            <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Est. Wait</p>
                                <p className="text-3xl font-bold text-[var(--color-success)]">{formatTime(waitTime)}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLeaveQueue}
                            className="px-8 py-3 bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded uppercase tracking-widest text-sm font-bold"
                        >
                            Abort Scan
                        </button>
                    </div>
                ) : (
                    // Selection Screen
                    <div className="glass-panel border-glow rounded-xl p-10">
                        <h1 className="text-5xl font-black text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                            INITIALIZE COMBAT
                        </h1>

                        <div className="mb-12">
                            <label className="block text-center text-sm font-bold text-[var(--color-text-main)] mb-6 uppercase tracking-[0.2em]">
                                Select Protocol parameters
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {["EASY", "MEDIUM", "HARD"].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setSelectedDifficulty(diff)}
                                        className={`relative p-6 rounded-lg border transition-all duration-300 group overflow-hidden ${selectedDifficulty === diff
                                            ? "border-[var(--color-primary)] bg-[rgba(0,240,255,0.1)] text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                            : "border-gray-800 bg-black/40 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold mb-1">{diff}</h3>
                                            <p className="text-xs opacity-70">
                                                {diff === "EASY" && "Recruit Training"}
                                                {diff === "MEDIUM" && "Soldier Standard"}
                                                {diff === "HARD" && "Veteran Elite"}
                                            </p>
                                        </div>
                                        {selectedDifficulty === diff && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/10 to-transparent pointer-events-none"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 mb-8 rounded text-center">
                                ⚠ {error}
                            </div>
                        )}

                        <button
                            onClick={handleJoinQueue}
                            disabled={loading}
                            className="w-full py-6 neon-button text-xl font-bold tracking-[0.1em] clip-path-polygon"
                            style={{ clipPath: "polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)" }}
                        >
                            {loading ? "ESTABLISHING CONNECTION..." : "START MATCHMAKING"}
                        </button>

                    </div>
                )}
            </div>
        </div>
    );
};