import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSocket, isSocketConnected } from "../../lib/socket";
import { joinMatchmaking, leaveMatchmaking } from "../../store/api/matchmaking.thunk";
import { setMatchFound, resetMatchmaking } from "../../store/slices/matchmaking.slice";
import { toast } from "react-hot-toast";
import { 
  Sparkles, 
  Target, 
  Zap, 
  Clock, 
  X, 
  Swords,
  Shield, 
  Trophy, 
  Flame, 
  Crown, 
  Check, 
  Loader, 
  SkipForward 
} from "lucide-react";
import axios from "../../lib/axios";
import { queryClient } from "../lib/queryClient";

export const FindMatch = () => {
    const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
    const [connected, setConnected] = useState(isSocketConnected());
    const [queueSeconds, setQueueSeconds] = useState(0);
    const [acceptCountdown, setAcceptCountdown] = useState(5);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentLobby } = useSelector((state) => state.lobby);
    const { user } = useSelector((state) => state.auth);
    const { inQueue, loading, error, queueSize, waitTime, matchFound, battleId, opponent, difficulty: restoredDifficulty } = useSelector(
        (state) => state.matchmaking
    );

    // Sync restored difficulty from store to local state
    useEffect(() => {
        if (restoredDifficulty) {
            setSelectedDifficulty(restoredDifficulty);
        }
    }, [restoredDifficulty]);

    // Active Queue Timer incrementer
    useEffect(() => {
        let timer;
        if (inQueue && !matchFound) {
            setQueueSeconds(0);
            timer = setInterval(() => {
                setQueueSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            setQueueSeconds(0);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [inQueue, matchFound]);

    // Accept Match Countdown (5s)
    useEffect(() => {
        let timer;
        if (matchFound && battleId) {
            setAcceptCountdown(5);
            timer = setInterval(() => {
                setAcceptCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [matchFound, battleId]);

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

        // Poll queue status every 2 seconds when in queue (using query invalidation)
        let statusInterval;
        if (inQueue && !matchFound) {
            statusInterval = setInterval(() => {
                queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
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

    // Navigate to battle when match is found after 5 seconds
    useEffect(() => {
        if (matchFound && battleId) {
            const timer = setTimeout(() => {
                navigate(`/battle/${battleId}/ide`);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [matchFound, battleId, navigate]);

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

    const getPlayerLeague = (pts) => {
        const points = pts || 1000;
        if (points < 1200) return "Bronze";
        if (points < 1500) return "Silver";
        if (points < 1800) return "Gold";
        if (points < 2200) return "Diamond";
        return "Master";
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-neutral-50 flex items-center justify-center px-4 relative overflow-x-hidden font-[family:var(--font-body)] pt-20">
            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    alt="Dark code editor"
                    className="object-cover opacity-[0.03] absolute inset-0 w-full h-full"
                    src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                />
                <div className="bg-[radial-gradient(circle_at_30%_20%,rgba(18,18,18,0.7),transparent_60%)] absolute inset-0" />
                <div className="bg-gradient-to-br from-[#09090b]/80 via-transparent to-[#09090b]/90 absolute inset-0" />
                <div className="bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] absolute inset-0" />
            </div>

            <div className="relative max-w-[1140px] w-full z-10">

                {matchFound || (battleId && opponent) ? (
                    // Match Found Screen - PRE-COMBAT DUEL HUD
                    <div className="relative z-10 flex p-4 sm:p-12 flex-col justify-center items-center gap-8 h-full">
                        
                        {/* Pregame Header */}
                        <div className="flex flex-col items-center gap-2 text-center select-none">
                            <div className="backdrop-blur-md rounded-full bg-neutral-900/60 border border-white/5 flex px-4 py-1.5 items-center gap-2">
                                <Swords className="size-4 text-emerald-500 animate-pulse" />
                                <span className="font-medium uppercase text-neutral-400 text-xs tracking-[4.8px]">
                                    Match Found
                                </span>
                            </div>
                            <h1 className="font-[family:var(--font-heading)] font-bold text-3xl sm:text-4xl tracking-tight text-white uppercase mt-2">
                                A Worthy Opponent Awaits
                            </h1>
                            <p className="text-neutral-400 text-xs sm:text-sm tracking-wider">
                                Ranked 1v1 · Algorithms & Data Structures ({selectedDifficulty})
                            </p>
                        </div>

                        {/* Player vs Opponent Split Cards */}
                        <div className="flex flex-col md:flex-row justify-center items-center gap-6 w-full my-4">
                            
                            {/* Player 1 Card (You) */}
                            <div className="backdrop-blur-xl shadow-2xl rounded-xl bg-neutral-900/50 border border-white/10 flex p-8 flex-col items-center gap-4 w-full max-w-[280px] sm:max-w-[300px]">
                                <div className="relative">
                                    <div className="bg-[conic-gradient(from_180deg,rgba(16,185,129,0.3),transparent,rgba(16,185,129,0.3))] blur-[2px] rounded-full absolute -inset-1" />
                                    {user?.profilePic ? (
                                        <img
                                            src={user.profilePic}
                                            alt={user.username}
                                            className="relative size-24 object-cover rounded-full border-emerald-500/60 border-2"
                                        />
                                    ) : (
                                        <div className="relative size-24 bg-white/10 rounded-full border-2 border-emerald-500/60 flex items-center justify-center text-white font-black text-3xl">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="font-[family:var(--font-heading)] font-bold text-xl text-white truncate max-w-[180px]">
                                        {user?.username || "Player"}
                                    </span>
                                    <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <Shield className="size-3" />
                                        {getPlayerLeague(user?.rankPoints)}
                                    </span>
                                </div>
                                <div className="border-t border-white/5 flex pt-3 flex-col items-center gap-1 w-full">
                                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                                        Elo Rating
                                    </span>
                                    <span className="font-mono font-black text-2xl text-white tabular-nums">
                                        {user?.rankPoints || 1000}
                                    </span>
                                </div>
                                <div className="font-mono text-neutral-400 text-xs flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Trophy className="size-3 text-emerald-500" />
                                        Active
                                    </span>
                                </div>
                            </div>

                            {/* VS separator pill */}
                            <div className="flex px-2 flex-col justify-center items-center gap-2 py-4 md:py-0 select-none">
                                <div className="relative size-20 flex justify-center items-center">
                                    <div className="bg-[radial-gradient(circle,rgba(239,68,68,0.2),transparent_70%)] blur-lg rounded-full absolute inset-0" />
                                    <div className="relative size-16 backdrop-blur-md rounded-full bg-neutral-900 border-2 border-red-500/50 flex items-center justify-center">
                                        <span className="font-[family:var(--font-heading)] italic font-black text-red-500 text-2xl tracking-tighter shadow-red-500/20">
                                            VS
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Player 2 Card (Opponent) */}
                            <div className="backdrop-blur-xl shadow-2xl rounded-xl bg-neutral-900/50 border border-white/10 flex p-8 flex-col items-center gap-4 w-full max-w-[280px] sm:max-w-[300px]">
                                <div className="relative">
                                    <div className="bg-[conic-gradient(from_180deg,rgba(239,68,68,0.3),transparent,rgba(239,68,68,0.3))] blur-[2px] rounded-full absolute -inset-1" />
                                    <img
                                        src="https://images.unsplash.com/photo-1628157588553-5eeea00af15c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                                        alt="Opponent avatar"
                                        className="relative size-24 object-cover rounded-full border-red-500/60 border-2"
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="font-[family:var(--font-heading)] font-bold text-xl text-white truncate max-w-[180px]">
                                        {opponent || "Opponent"}
                                    </span>
                                    <span className="rounded-full bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <Crown className="size-3" />
                                        {getPlayerLeague((user?.rankPoints || 1000) + 15)}
                                    </span>
                                </div>
                                <div className="border-t border-white/5 flex pt-3 flex-col items-center gap-1 w-full">
                                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                                        Elo Rating
                                    </span>
                                    <span className="font-mono font-black text-2xl text-white tabular-nums">
                                        {(user?.rankPoints || 1000) + 15}
                                    </span>
                                </div>
                                <div className="font-mono text-neutral-400 text-xs flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Trophy className="size-3 text-red-500" />
                                        Challenger
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Accept Countdown Ring */}
                        <div className="flex flex-col items-center gap-2 select-none">
                            <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-[4px]">
                                Accept Match
                            </span>
                            <div className="relative w-24 h-24 backdrop-blur-md rounded-full bg-neutral-900/60 border-2 border-white/10 flex justify-center items-center">
                                <div className="bg-[radial-gradient(circle,rgba(16,185,129,0.1),transparent_70%)] rounded-full absolute inset-0 animate-pulse" />
                                <span className="relative font-mono font-black text-emerald-500 text-4xl shadow-emerald-500/20">
                                    {acceptCountdown}
                                </span>
                            </div>
                        </div>

                        {/* Accept / Decline CTA Buttons */}
                        <div className="max-w-[480px] flex gap-4 w-full mt-2">
                            <button
                                onClick={() => navigate(`/battle/${battleId}/ide`)}
                                className="font-[family:var(--font-heading)] font-semibold rounded-xl text-base bg-neutral-100 hover:bg-neutral-200 text-neutral-900 flex-1 py-3 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                            >
                                <Check className="size-4" />
                                Accept
                            </button>
                            <button
                                onClick={handleLeaveQueue}
                                className="font-[family:var(--font-heading)] bg-transparent hover:bg-white/5 font-semibold rounded-xl text-base border-2 border-white/5 text-white flex-1 py-3 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                            >
                                <X className="size-4" />
                                Decline
                            </button>
                        </div>

                        <p className="font-mono text-neutral-600 text-[10px]">
                            // auto-accepts when the countdown reaches zero
                        </p>

                    </div>
                ) : inQueue ? (
                    // Searching Screen - CUSTOM RADAR HUD
                    <div className="relative z-10 min-h-[750px] max-w-[1140px] flex px-4 sm:px-12 py-8 flex-col w-full">
                        {/* Center area with custom radar */}
                        <div className="flex py-10 justify-center items-center flex-1">
                            <div className="relative max-w-[760px] flex flex-col items-center gap-8 w-full">
                                <div className="text-center select-none">
                                    <div className="font-[family:var(--font-heading)] font-medium uppercase text-neutral-400 text-sm tracking-[4.8px]">
                                        Searching for opponent...
                                    </div>
                                    <div className="font-[family:var(--font-heading)] leading-none font-black text-neutral-50 text-6xl sm:text-7xl tracking-tight mt-3">
                                        {queueSeconds}s
                                    </div>
                                </div>

                                {/* Custom Animated Concentric Radar */}
                                <div className="relative flex justify-center items-center w-[260px] h-[260px] sm:w-[280px] sm:h-[280px]">
                                    <div className="backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(0,0,0,0.45)] rounded-full bg-neutral-900/35 border border-white/5 absolute inset-0" />
                                    <div className="rounded-full border border-neutral-700/30 absolute inset-6" />
                                    <div className="rounded-full border border-neutral-800 absolute inset-14" />
                                    <div className="rounded-full border border-neutral-700/30 absolute inset-22" />
                                    <div className="rounded-full border border-neutral-800 absolute inset-30" />
                                    <div className="opacity-40 rounded-full bg-white/2 absolute inset-0 animate-pulse" />
                                    <div className="rounded-full bg-white/5 absolute inset-0" />
                                    
                                    {/* Sweeping Laser Beam */}
                                    <div className="rounded-full absolute inset-0 overflow-hidden">
                                        <div className="left-1/2 -translate-x-1/2 animate-[spin_4s_linear_infinite] origin-center shadow-[0_0_24px_rgba(16,185,129,0.2)] bg-emerald-500/20 absolute top-0 w-0.5 h-full" />
                                    </div>
                                    <div className="shadow-[inset_0_0_40px_rgba(16,185,129,0.05)] rounded-full border border-emerald-500/10 absolute inset-8" />
                                    <div className="rounded-full border border-amber-500/5 absolute inset-16" />
                                    <div className="rounded-full border border-neutral-800 absolute inset-24" />
                                    <div className="shadow-[0_0_12px_rgba(255,255,255,0.4)] rounded-full bg-neutral-50 absolute w-2.5 h-2.5" />
                                    
                                    <div className="font-mono shadow-2xl rounded-full bg-neutral-900/90 text-neutral-300 text-[10px] border border-white/5 absolute bottom-6 px-4 py-1.5">
                                        avg wait: {formatTime(waitTime)}
                                    </div>
                                </div>

                                {/* Queue Statistics cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
                                    <div className="backdrop-blur-md shadow-2xl rounded-xl bg-[#18181b] border border-white/5 p-6">
                                        <div className="font-mono uppercase text-neutral-400 text-[10px] tracking-[4px]">
                                            Players currently searching
                                        </div>
                                        <div className="font-[family:var(--font-heading)] font-black text-white text-[32px] mt-3">
                                            {queueSize || "12,408"}
                                        </div>
                                        <div className="text-emerald-500 text-xs flex mt-2 items-center gap-2">
                                            <Zap className="size-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">High activity across all regions</span>
                                        </div>
                                    </div>
                                    <div className="backdrop-blur-md shadow-2xl rounded-xl bg-[#18181b] border border-white/5 p-6">
                                        <div className="font-mono uppercase text-neutral-400 text-[10px] tracking-[4px]">
                                            Average wait time
                                        </div>
                                        <div className="font-[family:var(--font-heading)] font-black text-white text-[32px] mt-3">
                                            {formatTime(waitTime)}
                                        </div>
                                        <div className="text-amber-500 text-xs flex mt-2 items-center gap-2">
                                            <Clock className="size-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Estimated to improve shortly</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summon Ghost & Cancel Search actions */}
                        <div className="flex flex-col gap-4 items-center pb-2">
                            {waitTime > 10000 && (
                                <button
                                    onClick={handleSpawnGhost}
                                    className="group flex items-center justify-center gap-3 px-6 py-3 bg-[#18181b] hover:bg-neutral-800 text-white border border-white/5 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                                    style={{ borderRadius: "2px" }}
                                >
                                    <Sparkles size={14} className="text-emerald-500 group-hover:animate-pulse" />
                                    <span>Summon Ghost Opponent</span>
                                </button>
                            )}
                            <button 
                                onClick={handleLeaveQueue}
                                className="bg-transparent hover:bg-red-500/10 font-[family:var(--font-heading)] font-semibold shadow-2xl rounded-xl text-neutral-50 text-[13px] border border-red-500/30 border-solid px-8 py-3.5 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                            >
                                <X className="size-4 mr-2" />
                                Cancel Matchmaking
                            </button>
                        </div>
                    </div>
                ) : (
                    // Selection Screen - PREMIUM
                    <div className="flex px-4 sm:px-8 py-12 justify-center items-center flex-1">
                        <div className="grid max-w-[1140px] grid-cols-1 lg:grid-cols-2 gap-12 w-full text-left">
                            
                            {/* Left Side: Stats & Description */}
                            <div className="flex flex-col justify-center gap-8">
                                <div className="space-y-4">
                                    <div className="inline-flex font-semibold uppercase rounded-full bg-neutral-900 text-[#a1a1a1] text-[10px] tracking-[5.6px] border border-zinc-800 px-4 py-2 items-center gap-2 select-none self-start">
                                        <Sparkles className="size-3 text-neutral-200" />
                                        Match Center
                                    </div>
                                    <div className="space-y-4">
                                        <h1 className="max-w-[560px] font-semibold text-neutral-50 text-4xl sm:text-5xl leading-tight sm:leading-12 tracking-tight">
                                            Find your next coding battle
                                        </h1>
                                        <p className="max-w-[520px] text-[#a1a1a1] text-base leading-7">
                                            Choose a difficulty, then jump into a random opponent
                                            match and get routed straight into your battle screen.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] rounded-2xl bg-neutral-900 border border-zinc-800 p-5">
                                        <div className="text-[#a1a1a1] flex items-center gap-2">
                                            <Zap className="size-4 text-neutral-200" />
                                            <span className="uppercase text-xs leading-4 tracking-[4.8px]">
                                                Fast queue
                                            </span>
                                        </div>
                                        <div className="font-semibold text-neutral-50 text-2xl leading-8 mt-4 font-mono">
                                            12s
                                        </div>
                                        <div className="text-[#a1a1a1] text-sm leading-5 mt-1">
                                            Average wait
                                        </div>
                                    </div>
                                    <div className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] rounded-2xl bg-neutral-900 border border-zinc-800 p-5">
                                        <div className="text-[#a1a1a1] flex items-center gap-2">
                                            <Trophy className="size-4 text-neutral-200" />
                                            <span className="uppercase text-xs leading-4 tracking-[4.8px]">
                                                Balanced
                                            </span>
                                        </div>
                                        <div className="font-semibold text-neutral-50 text-2xl leading-8 mt-4 font-mono">
                                            1v1
                                        </div>
                                        <div className="text-[#a1a1a1] text-sm leading-5 mt-1">
                                            Ranked pairing
                                        </div>
                                    </div>
                                    <div className="shadow-[0_20px_60px_rgba(0,0,0,0.35)] rounded-2xl bg-neutral-900 border border-zinc-800 p-5">
                                        <div className="text-[#a1a1a1] flex items-center gap-2">
                                            <Target className="size-4 text-neutral-200" />
                                            <span className="uppercase text-xs leading-4 tracking-[4.8px]">
                                                Ready
                                            </span>
                                        </div>
                                        <div className="font-semibold text-neutral-50 text-2xl leading-8 mt-4">
                                            Live
                                        </div>
                                        <div className="text-[#a1a1a1] text-sm leading-5 mt-1">
                                            Instant start
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Side: Matchmaking selection card */}
                            <div className="flex justify-center items-center">
                                <div className="max-w-[520px] backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] bg-neutral-900 border border-zinc-800 p-8 flex flex-col gap-6 w-full rounded-2xl">
                                    <div className="text-center flex flex-col gap-2">
                                        <div className="size-12 rounded-2xl bg-neutral-950/70 text-neutral-200 border border-zinc-800 flex mx-auto mb-2 justify-center items-center">
                                            <Target className="size-5" />
                                        </div>
                                        <h2 className="font-semibold text-neutral-50 text-3xl leading-9 tracking-tight">
                                            Matchmaking
                                        </h2>
                                        <p className="text-[#a1a1a1]">
                                            Select a difficulty and find a random opponent.
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center select-none">
                                                <span className="font-semibold uppercase text-[#a1a1a1] text-xs leading-4 tracking-[4.8px]">
                                                    Question difficulty
                                                </span>
                                                <span className="font-medium rounded-full bg-neutral-950/60 text-neutral-50 text-xs leading-4 border border-zinc-800 px-3 py-1">
                                                    {selectedDifficulty}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 rounded-2xl bg-neutral-950/60 border border-zinc-800 p-2 gap-2 w-full h-auto select-none">
                                                {["EASY", "MEDIUM", "HARD"].map((diff) => (
                                                    <button
                                                        key={diff}
                                                        onClick={() => setSelectedDifficulty(diff)}
                                                        className={`font-medium rounded-xl text-sm leading-5 px-4 py-3 cursor-pointer transition-all ${
                                                            selectedDifficulty === diff
                                                                ? "bg-neutral-200 text-neutral-900"
                                                                : "text-[#a1a1a1] hover:text-white"
                                                        }`}
                                                    >
                                                        {diff.charAt(0) + diff.slice(1).toLowerCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="rounded-2xl bg-neutral-950/50 border border-zinc-800 p-5">
                                            <div className="flex items-start gap-4">
                                                <div className="size-11 rounded-xl bg-neutral-800 text-neutral-50 flex justify-center items-center shrink-0">
                                                    <Clock className="size-5" />
                                                </div>
                                                <div className="space-y-1 flex-1 text-left">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <h3 className="font-semibold text-neutral-50 text-lg leading-7">
                                                            Random match
                                                        </h3>
                                                        <span className="uppercase text-[#a1a1a1] text-xs leading-4 tracking-[4.8px]">
                                                            Auto route
                                                        </span>
                                                    </div>
                                                    <p className="text-[#a1a1a1] text-sm leading-6">
                                                        We’ll pair you with a suitable opponent and take
                                                        you directly to Screen 3.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {error && (
                                        <div className="border border-red-500/20 bg-red-500/5 text-red-500 p-4 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse" style={{ borderRadius: "2px" }}>
                                            ⚠ Connection Error: {error}
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={handleJoinQueue}
                                        disabled={loading || !connected}
                                        className="shadow-[0_18px_40px_rgba(255,255,255,0.08)] rounded-2xl bg-neutral-200 hover:bg-white text-neutral-900 w-full h-14 font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Zap className="size-4" />
                                        {!connected ? "Connecting..." : loading ? "Searching..." : "Find random match"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
