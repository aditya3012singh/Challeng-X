import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchLiveBattles } from "../../store/api/battle.thunk";

const DIFFICULTY_COLORS = {
    EASY: "text-green-400 border-green-400/30",
    MEDIUM: "text-yellow-400 border-yellow-400/30",
    HARD: "text-red-400 border-red-400/30",
};

const SpectateCodeInput = ({ navigate }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const handleSpectate = () => {
        if (!code.trim()) return setError("Enter a battle code");
        setError("");
        // We need to look up the battle by code; simplest approach is navigate with the code
        // The SpectatorArena already fetches by battleId, but battleCode !== battleId
        // So we query live battles and find the match
        fetch(`${import.meta.env.VITE_API_URL}/battle/live`)
            .then(r => r.json())
            .then(battles => {
                const match = battles.find(b => b.battleCode === code.trim());
                if (match) {
                    navigate(`/spectate/${match.id}`);
                } else {
                    setError("No active battle found with that code");
                }
            })
            .catch(() => setError("Failed to look up battle"));
    };

    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSpectate()}
                    placeholder="Enter Battle Code..."
                    className="bg-[#0a0a0a] border border-white/10 text-white text-xs font-mono px-4 py-2.5 w-56 focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-gray-600 uppercase tracking-wider"
                    style={{ borderRadius: "2px" }}
                />
                {error && (
                    <div className="absolute top-full left-0 mt-1 text-[9px] text-red-500 font-mono">{error}</div>
                )}
            </div>
            <button
                onClick={handleSpectate}
                className="px-5 py-2.5 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                style={{ borderRadius: "2px" }}
            >
                Spectate
            </button>
        </div>
    );
};

const BattleCard = ({ battle, onWatch }) => {
    const difficulty = battle.problem?.difficulty || "MEDIUM";
    const diffColor = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.MEDIUM;

    return (
        <div className="group bg-[#0a0a0a] border border-white/5 hover:border-[var(--color-primary)]/30 transition-all duration-300 p-6 relative overflow-hidden" style={{ borderRadius: "2px" }}>
            {/* Live indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-red-500 text-[9px] font-bold uppercase tracking-widest">Live</span>
            </div>

            {/* Problem info */}
            <div className="mb-6">
                <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${diffColor.split(" ")[0]}`}>
                    {difficulty}
                </div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                    {battle.problem?.title || "Unknown Problem"}
                </h3>
            </div>

            {/* Players */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)] text-xs font-black" style={{ borderRadius: "2px" }}>
                        {battle.player1?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="text-white text-xs font-bold">{battle.player1?.username || "Player 1"}</span>
                </div>

                <span className="text-gray-600 text-[10px] font-black tracking-widest">VS</span>

                <div className="flex items-center gap-3">
                    <span className="text-white text-xs font-bold">{battle.player2?.username || "Waiting..."}</span>
                    <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-black" style={{ borderRadius: "2px" }}>
                        {battle.player2?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                </div>
            </div>

            {/* Battle Code + Watch button */}
            <div className="flex items-center justify-between">
                <span className="text-gray-600 text-[9px] font-mono uppercase">
                    Code: <span className="text-gray-400 font-bold">{battle.battleCode}</span>
                </span>
                <button
                    onClick={() => onWatch(battle.id)}
                    className="px-5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group-hover:border-red-500"
                    style={{ borderRadius: "2px" }}
                >
                    🔴 Watch Live
                </button>
            </div>
        </div>
    );
};

export default function LiveArenas() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { liveBattles } = useSelector((state) => state.battle);

    // Fetch on mount and auto-refresh every 10 seconds
    useEffect(() => {
        dispatch(fetchLiveBattles());
        const interval = setInterval(() => {
            dispatch(fetchLiveBattles());
        }, 10000);
        return () => clearInterval(interval);
    }, [dispatch]);

    const handleWatch = (battleId) => {
        navigate(`/spectate/${battleId}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-28 px-8 pb-16">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-12">
                <div className="flex items-center justify-between flex-wrap gap-6">
                    <div>
                        <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-2">
                            Broadcast // Active
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-[family:var(--font-heading)]">
                            Live Arenas
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">Watch ongoing battles in real-time</p>
                    </div>

                    <SpectateCodeInput navigate={navigate} />
                </div>
            </div>

            {/* Battle Grid */}
            <div className="max-w-6xl mx-auto">
                {liveBattles.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="text-gray-700 text-6xl mb-6">⚔️</div>
                        <h2 className="text-xl font-bold text-gray-600 uppercase tracking-wider mb-2">No Active Battles</h2>
                        <p className="text-gray-700 text-sm">When players start battling, their arenas will appear here.</p>
                        <div className="mt-8 flex items-center justify-center gap-2 text-[9px] text-gray-600 uppercase tracking-widest">
                            <div className="w-1 h-1 rounded-full bg-gray-600 animate-pulse"></div>
                            Scanning for signals...
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {liveBattles.map((battle) => (
                            <BattleCard key={battle.id} battle={battle} onWatch={handleWatch} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
