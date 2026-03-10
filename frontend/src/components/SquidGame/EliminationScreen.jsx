const EliminationScreen = ({ roundNumber, eliminated, survived, leaderboard, onContinue, isLastRound, isHost, onSpectate, userId }) => {
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
                        <div className="space-y-1 max-h-64 overflow-y-auto px-2">
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

                <div className="flex justify-center gap-4">
                    {/* Host only sees Next Round */}
                    {isHost ? (
                        <button
                            onClick={onContinue}
                            className="px-24 py-6 bg-red-500 text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-red-600 transition-all shadow-[0_8px_30px_rgba(239,68,68,0.4)] border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
                            style={{ borderRadius: "4px" }}
                        >
                            {isLastRound ? "SEE FINAL RESULTS" : "START NEXT ROUND →"}
                        </button>
                    ) : (
                        survived > 0 && leaderboard.find(e => e.userId === userId)?.status !== "ELIMINATED" ? (
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] animate-pulse">Waiting for the next round to begin...</div>
                        ) : (
                            <button
                                onClick={onSpectate}
                                className="px-16 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                                style={{ borderRadius: "2px" }}
                            >
                                Enter Spectator Mode →
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default EliminationScreen;
