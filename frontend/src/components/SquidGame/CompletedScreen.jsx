import { useNavigate } from "react-router-dom";

const CompletedScreen = ({ tournament, leaderboard }) => {
    const navigate = useNavigate();
    const winner = Array.isArray(leaderboard) ? leaderboard[0] : null;

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
                    {Array.isArray(leaderboard) && leaderboard.slice(0, 5).map((entry, i) => (
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

export default CompletedScreen;
