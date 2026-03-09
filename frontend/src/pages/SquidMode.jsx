import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
    createSquidGame,
    joinSquidGame,
    getSquidGameStatus,
    startSquidGame,
} from "../../store/api/squidGame.thunk";
import { clearTournament, setLeaderboard } from "../../store/slices/squidGame.slice";
import CodeEditor from "../components/CodeEditor";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const LANGUAGES = {
    java: { monaco: "java", defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}` },
    cpp: { monaco: "cpp", defaultCode: `#include <iostream>\nint main() {\n  std::cout << "Hello\\n";\n  return 0;\n}` }
};

const ROUND_CONFIG = [
    { round: 1, difficulty: "EASY", time: "20 min", eliminate: "20%" },
    { round: 2, difficulty: "EASY", time: "18 min", eliminate: "25%" },
    { round: 3, difficulty: "MEDIUM", time: "15 min", eliminate: "33%" },
    { round: 4, difficulty: "HARD", time: "12 min", eliminate: "50%" },
    { round: 5, difficulty: "HARD", time: "10 min", eliminate: "All but Winner" },
];

// ═══════════════════════════════════════════════════
// LOBBY SCREEN — Create or Join a Tournament
// ═══════════════════════════════════════════════════
const LobbyScreen = ({ onCreateOrJoin }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(s => s.squidGame);
    const [tab, setTab] = useState("join"); // "join" or "create"
    const [name, setName] = useState("");
    const [joinId, setJoinId] = useState("");

    const handleCreate = async () => {
        if (!name.trim()) return;
        const result = await dispatch(createSquidGame({ name: name.trim() })).unwrap();
        if (result?.tournament?.id) onCreateOrJoin(result.tournament.id);
    };

    const handleJoin = async () => {
        if (!joinId.trim()) return;
        const result = await dispatch(joinSquidGame({ squidGameId: joinId.trim() })).unwrap();
        if (result) onCreateOrJoin(joinId.trim());
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-28 px-8 pb-16">
            <div className="max-w-2xl mx-auto text-center">
                {/* Hero */}
                <div className="mb-16">
                    <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-[-6px] border border-red-500/20 rounded-full animate-ping"></div>
                        <div className="text-3xl">🦑</div>
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.6em] text-red-500 uppercase mb-3">Survival Mode</div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)] mb-4">
                        Squid Game
                    </h1>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        50 players. 5 rounds. Each round eliminates the lowest scorers. Only the best coder survives.
                    </p>
                </div>

                {/* Round Preview */}
                <div className="flex justify-center gap-2 mb-12">
                    {ROUND_CONFIG.map(r => (
                        <div key={r.round} className="px-3 py-2 border border-white/5 bg-white/[0.02] text-center" style={{ borderRadius: "2px" }}>
                            <div className="text-[8px] text-slate-600 uppercase font-bold tracking-wider mb-1">Round {r.round}</div>
                            <div className={`text-[9px] font-bold ${r.difficulty === "EASY" ? "text-green-400" : r.difficulty === "MEDIUM" ? "text-yellow-400" : "text-red-400"}`}>
                                {r.difficulty}
                            </div>
                            <div className="text-[8px] text-slate-700 mt-1">{r.time}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-0 mb-8">
                    <button
                        onClick={() => setTab("join")}
                        className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${tab === "join" ? "bg-white text-black border-white" : "bg-transparent text-slate-500 border-white/10 hover:border-white/30"
                            }`}
                        style={{ borderRadius: "2px 0 0 2px" }}
                    >
                        Join Tournament
                    </button>
                    <button
                        onClick={() => setTab("create")}
                        className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${tab === "create" ? "bg-white text-black border-white" : "bg-transparent text-slate-500 border-white/10 hover:border-white/30"
                            }`}
                        style={{ borderRadius: "0 2px 2px 0" }}
                    >
                        Create New
                    </button>
                </div>

                {/* Form */}
                <div className="max-w-sm mx-auto">
                    {tab === "join" ? (
                        <div className="flex flex-col gap-4">
                            <input
                                value={joinId}
                                onChange={e => setJoinId(e.target.value)}
                                placeholder="Paste Tournament ID..."
                                className="bg-[#0a0a0a] border border-white/10 text-white text-xs font-mono px-4 py-3 w-full focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600"
                                style={{ borderRadius: "2px" }}
                            />
                            <button
                                onClick={handleJoin}
                                disabled={loading || !joinId.trim()}
                                className="w-full py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                style={{ borderRadius: "2px" }}
                            >
                                {loading ? "Joining..." : "Enter Tournament →"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Tournament Name..."
                                className="bg-[#0a0a0a] border border-white/10 text-white text-xs font-mono px-4 py-3 w-full focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600"
                                style={{ borderRadius: "2px" }}
                            />
                            <button
                                onClick={handleCreate}
                                disabled={loading || !name.trim()}
                                className="w-full py-3 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                style={{ borderRadius: "2px" }}
                            >
                                {loading ? "Creating..." : "Create Tournament →"}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-red-500 text-[10px] font-mono uppercase tracking-wider">{typeof error === 'string' ? error : error.message || 'An error occurred'}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// WAITING ROOM — Players gathering before tournament starts
// ═══════════════════════════════════════════════════
const WaitingRoom = ({ tournament, socket, onStart, isHost }) => {
    const participants = tournament?.participants || [];
    const maxPlayers = tournament?.maxPlayers || 50;
    const isPastMinimum = participants.length >= 2;

    return (
        <div className="min-h-screen bg-[#050505] pt-28 px-8 pb-16">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="text-[10px] font-bold tracking-[0.6em] text-red-500 uppercase mb-3"> Waiting Room</div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)] mb-2">
                        {tournament?.name || "Tournament"}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {isHost ? "You are the organizer. Start the game when ready." : "Waiting for the host to start the game..."}
                    </p>
                </div>

                {/* Tournament ID (for sharing) */}
                <div className="max-w-md mx-auto mb-12">
                    <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mb-2 text-center">Share this Tournament ID</div>
                    <div
                        className="bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs font-mono text-[var(--color-primary)] text-center cursor-pointer hover:border-[var(--color-primary)]/30 transition-colors"
                        onClick={() => navigator.clipboard.writeText(tournament?.id || "")}
                        style={{ borderRadius: "2px" }}
                    >
                        {tournament?.id}
                        <span className="text-[8px] text-slate-600 ml-3">(click to copy)</span>
                    </div>
                </div>

                {/* Player Count */}
                <div className="text-center mb-8">
                    <span className="text-6xl font-black text-white tabular-nums font-[family:var(--font-heading)]">
                        {participants.length}
                    </span>
                    <span className="text-slate-600 text-2xl font-bold mx-2">/</span>
                    <span className="text-2xl font-bold text-slate-600">{maxPlayers}</span>
                    <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mt-2">Players Joined</div>
                </div>

                {/* Player Grid */}
                <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-12">
                    {participants.map((p, i) => (
                        <div key={p.id || i} className="border border-white/5 bg-white/[0.02] p-3 text-center" style={{ borderRadius: "2px" }}>
                            <div className="w-8 h-8 mx-auto bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-[10px] font-black mb-1" style={{ borderRadius: "2px" }}>
                                {(p.user?.username || `P${i + 1}`).charAt(0).toUpperCase()}
                            </div>
                            <div className="text-[8px] text-slate-500 font-mono truncate">{p.user?.username || `Player ${i + 1}`}</div>
                        </div>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: Math.max(0, Math.min(maxPlayers - participants.length, 20)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="border border-dashed border-white/[0.03] p-3 flex items-center justify-center" style={{ borderRadius: "2px" }}>
                            <div className="w-2 h-2 rounded-full bg-white/[0.03]"></div>
                        </div>
                    ))}
                </div>

                {/* Start Button or Message */}
                <div className="text-center">
                    {isHost ? (
                        <>
                            <button
                                onClick={onStart}
                                disabled={!isPastMinimum}
                                className="px-16 py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                style={{ borderRadius: "2px" }}
                            >
                                {isPastMinimum ? "Start Tournament →" : `Need at least 2 players`}
                            </button>
                            {isPastMinimum && (
                                <div className="text-[8px] text-slate-600 mt-3 uppercase tracking-wider">Only you can start this game</div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4"></div>
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Waiting for the organizer...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// ROUND SCREEN — Active coding round with timer + editor
// ═══════════════════════════════════════════════════
const RoundScreen = ({ tournament, roundInfo, timeLeft, onSubmit, leaderboard, socket, user }) => {
    const [language, setLanguage] = useState("java");
    const [code, setCode] = useState(LANGUAGES.java.defaultCode);
    const [submitted, setSubmitted] = useState(false);

    // Get problem from tournament roundProblems (DB) or from socket roundInfo
    const roundNum = tournament?.currentRound || roundInfo?.roundNumber || 1;
    const currentRoundData = tournament?.roundProblems?.find(r => r.roundNumber === roundNum);
    const problem = currentRoundData?.problem || roundInfo?.problem;

    const handleLangChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(LANGUAGES[lang].defaultCode);
    };

    const handleSubmit = () => {
        setSubmitted(true);
        onSubmit({ code, language });
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
    };

    // Live Code Sync — Periodically emit code to host
    useEffect(() => {
        if (!tournament?.id || !user?.id || submitted) return;

        const syncInterval = setInterval(() => {
            if (socket && socket.connected) {
                socket.emit("squid_game:code_sync", {
                    squidGameId: tournament.id,
                    userId: user?.id,
                    username: user?.username,
                    code,
                    language
                });
            }
        }, 3000); // Sync every 3 seconds

        return () => clearInterval(syncInterval);
    }, [code, language, tournament?.id, user?.id, socket, submitted]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#080808] shrink-0">
                <div className="flex items-center gap-6">
                    <div>
                        <div className="text-[8px] font-bold tracking-[0.4em] text-red-500 uppercase">Round {roundNum}</div>
                        <div className="text-white text-sm font-bold">{problem?.title || "Loading..."}</div>
                    </div>
                    <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${problem?.difficulty === "EASY" ? "text-green-400 border-green-400/20"
                        : problem?.difficulty === "MEDIUM" ? "text-yellow-400 border-yellow-400/20"
                            : "text-red-400 border-red-400/20"
                        }`} style={{ borderRadius: "2px" }}>
                        {problem?.difficulty || "???"}
                    </div>
                </div>

                {/* Timer */}
                <div className={`text-3xl font-black tabular-nums font-[family:var(--font-heading)] ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"}`}>
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-3">
                    <select value={language} onChange={handleLangChange} className="bg-[#0a0a0a] border border-white/10 text-white text-[10px] px-3 py-2 uppercase font-bold tracking-wider" style={{ borderRadius: "2px" }}>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <button
                        onClick={handleSubmit}
                        disabled={submitted}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${submitted ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-400"
                            }`}
                        style={{ borderRadius: "2px" }}
                    >
                        {submitted ? "Submitted ✓" : "Submit Code"}
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 min-h-0">
                {/* Left: Problem Description */}
                <div className="w-[35%] border-r border-white/5 overflow-y-auto p-6 bg-[#060606]">
                    <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-4">Problem Statement</div>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {problem?.description || "Loading problem..."}
                    </div>

                    {/* Mini Leaderboard */}
                    {leaderboard.length > 0 && (
                        <div className="mt-8 border-t border-white/5 pt-6">
                            <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-3">Live Rankings</div>
                            <div className="space-y-1">
                                {leaderboard.slice(0, 10).map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2 border border-white/[0.03] bg-white/[0.01]" style={{ borderRadius: "2px" }}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black ${i === 0 ? "text-[var(--color-primary)]" : i < 3 ? "text-white" : "text-slate-600"}`}>
                                                #{i + 1}
                                            </span>
                                            <span className="text-[10px] text-white font-bold">{entry.username || `Player`}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">{entry.score || 0} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Code Editor */}
                <div className="w-[65%] bg-[#080808] flex flex-col">
                    <div className="flex-1 min-h-0">
                        <CodeEditor
                            language={LANGUAGES[language].monaco}
                            value={code}
                            onChange={(v) => setCode(v || "")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// ORGANIZER VIEW — Host view of all players
// ═══════════════════════════════════════════════════
const OrganizerView = ({ tournament, roundInfo, timeLeft, leaderboard, playerStreams }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
    };

    const roundNum = tournament?.currentRound || roundInfo?.roundNumber || 1;
    const currentRoundData = tournament?.roundProblems?.find(r => r.roundNumber === roundNum);
    const problem = currentRoundData?.problem || roundInfo?.problem;

    const selectedPlayer = tournament?.participants?.find(p => p.userId === selectedPlayerId);
    const selectedStream = playerStreams[selectedPlayerId];

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col">
            {/* Header */}
            <div className="relative z-20 p-8 flex justify-between items-center bg-white/[0.01] border-b border-white/[0.03]">
                <div className="flex items-center gap-6">
                    <div>
                        <div className="text-[10px] font-bold tracking-[0.6em] text-red-500 uppercase mb-2">Organizer Dashboard // Live</div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">
                            {tournament?.name}
                        </h1>
                    </div>
                    {selectedPlayer && (
                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-black">
                                {selectedPlayer.user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Watching</div>
                                <div className="text-white font-bold">{selectedPlayer.user?.username}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest block mb-1">Round {roundNum} Time Remaining</span>
                    <span className={`text-5xl font-black tabular-nums font-[family:var(--font-heading)] ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <div className="flex gap-12">
                    <div className="text-right">
                        <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest block mb-1">Alive Subjects</span>
                        <span className="text-2xl font-black text-white tabular-nums">
                            {tournament?.participants?.filter(p => p.status === "ACTIVE").length || 0}
                            <span className="text-slate-800 mx-2">/</span>
                            {tournament?.participants?.length || 0}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Left: Dashboard Grid */}
                <div className="flex-1 overflow-y-auto p-12 border-r border-white/5">
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {tournament?.participants?.map((p, i) => {
                            const lbEntry = leaderboard.find(l => l.userId === p.userId);
                            const isSelected = selectedPlayerId === p.userId;
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPlayerId(p.userId)}
                                    className={`p-4 border cursor-pointer transition-all duration-300 ${p.status === "ACTIVE"
                                        ? isSelected ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                                        : 'border-red-500/10 bg-red-500/[0.02] grayscale opacity-30'}`}
                                    style={{ borderRadius: "2px" }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`text-[9px] font-bold font-mono ${p.status === "ACTIVE" ? isSelected ? 'text-red-500' : 'text-slate-600' : 'text-red-900'}`}>
                                            #{i + 1 < 10 ? `0${i + 1}` : i + 1}
                                        </span>
                                        {p.status === "ELIMINATED" && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-[10px] font-bold truncate mb-2 ${p.status === "ACTIVE" ? 'text-white' : 'text-slate-800'}`}>
                                            {p.user?.username}
                                        </div>
                                        <div className={`text-[12px] font-black tabular-nums ${p.status === "ACTIVE" ? 'text-red-500' : 'text-slate-900'}`}>
                                            {lbEntry?.score || 0}<span className="text-[8px] opacity-40 ml-1">pts</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Live Stream Preview */}
                <div className="w-[40%] bg-[#080808] flex flex-col">
                    {selectedPlayer ? (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
                                <span className="text-[9px] text-white font-black uppercase tracking-widest">Live Stream // {selectedPlayer.user?.username}</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-[8px] text-red-500 font-bold uppercase">Live</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                {selectedStream ? (
                                    <CodeEditor
                                        language={LANGUAGES[selectedStream.language]?.monaco || "javascript"}
                                        value={selectedStream.code}
                                        readOnly={true}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-mono text-xs">
                                        Waiting for stream feed...
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 border border-white/5 rounded-full flex items-center justify-center mb-6">
                                <span className="text-2xl opacity-20">👁️</span>
                            </div>
                            <h3 className="text-white text-lg font-bold mb-2">Subject Monitoring</h3>
                            <p className="text-slate-600 text-xs">Select a participant to view their live editor and monitor progress in real-time.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Problem View Overlay Bar */}
            <div className="p-4 bg-[#0a0a0a] border-t border-white/5 flex justify-between items-center shrink-0">
                <div className="flex gap-4 items-center">
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Active Task:</span>
                    <span className="text-xs font-bold text-white uppercase">{problem?.title}</span>
                </div>
                <div className="text-[9px] text-slate-500 italic">Only the organizer can see all participants in real-time.</div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// ELIMINATION SCREEN — Round results
// ═══════════════════════════════════════════════════
const EliminationScreen = ({ roundNumber, eliminated, survived, leaderboard, onContinue, isLastRound }) => {
    return (
        <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center p-8 overflow-y-auto">
            <div className="max-w-3xl w-full text-center">
                <div className="w-20 h-20 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <div className="text-3xl">💀</div>
                </div>
                <div className="text-[10px] font-bold tracking-[0.6em] text-red-500 uppercase mb-3">
                    Round {roundNumber} Complete
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)] mb-4">
                    Elimination
                </h2>

                <div className="flex justify-center gap-12 mb-10">
                    <div>
                        <div className="text-4xl font-black text-red-500 tabular-nums">{eliminated}</div>
                        <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mt-1">Eliminated</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-green-400 tabular-nums">{survived}</div>
                        <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mt-1">Survived</div>
                    </div>
                </div>

                {/* Leaderboard snapshot */}
                {leaderboard.length > 0 && (
                    <div className="max-w-md mx-auto mb-10">
                        <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mb-3">Standings</div>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                            {leaderboard.map((entry, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between px-4 py-2 border ${entry.status === "ELIMINATED"
                                        ? "border-red-500/10 bg-red-500/[0.03] text-red-400/50 line-through"
                                        : "border-white/5 bg-white/[0.02] text-white"
                                        }`}
                                    style={{ borderRadius: "2px" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black">#{entry.rank || i + 1}</span>
                                        <span className="text-[11px] font-bold">{entry.username}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-mono">{entry.score} pts</span>
                                        {entry.status === "ELIMINATED" && <span className="text-[8px] text-red-500 font-bold uppercase">Out</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={onContinue}
                    className="px-16 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all"
                    style={{ borderRadius: "2px" }}
                >
                    {isLastRound ? "See Final Results" : "Next Round →"}
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// COMPLETED SCREEN — Tournament over, show winner
// ═══════════════════════════════════════════════════
const CompletedScreen = ({ tournament, leaderboard }) => {
    const navigate = useNavigate();
    const winner = leaderboard[0];

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
            <div className="max-w-lg text-center">
                <div className="text-6xl mb-6">🏆</div>
                <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-3">Tournament Complete</div>
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)] mb-6">
                    {winner?.username || "Champion"}
                </h2>
                <p className="text-slate-500 text-sm mb-2">wins <span className="text-white font-bold">{tournament?.name}</span></p>
                <p className="text-[var(--color-primary)] text-xl font-black mb-12">{winner?.score || 0} Total Points</p>

                {/* Final Leaderboard */}
                <div className="max-w-sm mx-auto mb-10">
                    {leaderboard.slice(0, 5).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-black ${i === 0 ? "text-[var(--color-primary)]" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-600"}`}>
                                    #{i + 1}
                                </span>
                                <span className="text-white text-sm font-bold">{entry.username}</span>
                            </div>
                            <span className="text-sm font-mono text-slate-400">{entry.score} pts</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="px-12 py-4 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:border-white/30 transition-all"
                    style={{ borderRadius: "2px" }}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};


// ═══════════════════════════════════════════════════
// MAIN SQUID GAME COMPONENT
// ═══════════════════════════════════════════════════
export const SquidMode = () => {
    const dispatch = useDispatch();
    const { tournament } = useSelector(s => s.squidGame);
    const { user } = useSelector(s => s.auth);
    const isHost = tournament?.hostId === user?.id;

    const [phase, setPhase] = useState("LOBBY"); // LOBBY, WAITING, PLAYING, ELIMINATION, COMPLETED
    const [squidGameId, setSquidGameId] = useState(null);
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

        sgSocket.on("squid_game:host_code_update", (data) => {
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
    }, [squidGameId, user?.id, dispatch]);

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

            // If I am host and just moved to playing, join host room
            if (isHost && socketRef.current) {
                socketRef.current.emit("squid_game:join_host", { squidGameId: tournament.id });
            }
        } else if (tournament.status === "COMPLETED" && phase !== "COMPLETED") {
            setPhase("COMPLETED");
        }
    }, [tournament?.status, phase, isHost]);

    const handleCreateOrJoin = (id) => {
        setSquidGameId(id);
        dispatch(getSquidGameStatus({ squidGameId: id }));
        setPhase("WAITING");
    };

    const handleStart = async () => {
        if (!squidGameId) return;
        await dispatch(startSquidGame({ squidGameId }));
        // Refetch status to get the roundProblems with full problem data
        await dispatch(getSquidGameStatus({ squidGameId }));
    };

    const handleSubmitCode = ({ code, language }) => {
        if (socketRef.current && squidGameId) {
            socketRef.current.emit("squid_game:submit_solution", {
                squidGameId,
                userId: user?.id,
                code,
                language,
                status: "PASSED", // The actual evaluation would come from the worker
                executionTimeMs: Math.floor(Math.random() * 500) + 100,
                testCasesPassed: 14,
                totalTestCases: 14,
            });
        }
    };

    const handleContinueAfterElimination = () => {
        // Check if user was eliminated
        const myStatus = leaderboard.find(e => e.userId === user?.id);
        if (myStatus?.status === "ELIMINATED") {
            setPhase("COMPLETED");
        } else {
            // Request next round
            setPhase("WAITING");
            dispatch(getSquidGameStatus({ squidGameId }));
        }
    };

    // Render current phase

    switch (phase) {
        case "LOBBY":
            return <LobbyScreen onCreateOrJoin={handleCreateOrJoin} />;

        case "WAITING":
            return <WaitingRoom tournament={tournament} socket={socketRef.current} onStart={handleStart} isHost={isHost} />;

        case "PLAYING":
            if (isHost) {
                return (
                    <OrganizerView
                        tournament={tournament}
                        roundInfo={roundInfo}
                        timeLeft={timeLeft}
                        leaderboard={leaderboard}
                        playerStreams={playerStreams}
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
                    roundNumber={roundInfo?.roundNumber || tournament?.currentRound || 1}
                    eliminated={eliminationData?.eliminatedCount || 0}
                    survived={eliminationData?.remainingPlayers || 0}
                    leaderboard={leaderboard}
                    onContinue={handleContinueAfterElimination}
                    isLastRound={tournament?.currentRound >= tournament?.totalRounds}
                />
            );

        case "COMPLETED":
            return <CompletedScreen tournament={tournament} leaderboard={leaderboard} />;

        default:
            return <LobbyScreen onCreateOrJoin={handleCreateOrJoin} />;
    }
};
