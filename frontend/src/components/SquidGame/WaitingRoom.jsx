const WaitingRoom = ({ tournament, onStart, isHost }) => {
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

export default WaitingRoom;
