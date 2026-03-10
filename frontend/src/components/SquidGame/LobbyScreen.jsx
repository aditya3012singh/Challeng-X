import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSquidGame, joinSquidGame } from "../../../store/api/squidGame.thunk";
import { ROUND_CONFIG } from "./SquidGameConfig";

const LobbyScreen = ({ onCreateOrJoin }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(s => s.squidGame);
    const [tab, setTab] = useState("join"); // "join" or "create"
    const [name, setName] = useState("");
    const [joinId, setJoinId] = useState("");

    const handleCreate = async () => {
        if (!name.trim()) return;
        const result = await dispatch(createSquidGame({ name: name.trim() })).unwrap();
        if (result?.tournament?.id) onCreateOrJoin(result.tournament.id, { isHost: true });
    };

    const handleJoin = async () => {
        if (!joinId.trim()) return;
        const result = await dispatch(joinSquidGame({ joinCode: joinId.trim() })).unwrap();
        if (result?.participant?.squidGameId) {
            onCreateOrJoin(result.participant.squidGameId, { isHost: false });
        }
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
                                placeholder="Enter 6-digit Join Code..."
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

export default LobbyScreen;
