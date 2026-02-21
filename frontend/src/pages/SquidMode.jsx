import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const SquidMode = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState("LOBBY"); // LOBBY, ROUND_1, ELIMINATION, SURVIVED
    const [timeLeft, setTimeLeft] = useState(30);

    // Mock Players
    const [players, setPlayers] = useState(
        Array.from({ length: 48 }).map((_, i) => ({
            id: i,
            name: `Player_${i + 1}`,
            alive: true,
            progress: Math.floor(Math.random() * 100)
        }))
    );

    // Simulating the Game Loop for visual demo
    useEffect(() => {
        if (gameState === "ROUND_1") {
            const interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setGameState("ELIMINATION");
                        return 0;
                    }
                    return prev - 1;
                });

                // Randomly update progress
                setPlayers((prev) => prev.map(p => ({
                    ...p,
                    progress: p.alive ? Math.min(100, p.progress + Math.random() * 5) : p.progress
                })));

            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState]);

    return (
        <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] overflow-hidden relative font-[family:var(--font-body)] pt-20">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[var(--color-primary)] opacity-[0.012] blur-[200px] rounded-full"></div>
            </div>

            {/* HEADER */}
            <div className="relative z-20 p-8 flex justify-between items-center bg-white/[0.01] border-b border-white/[0.03]">
                <div>
                    <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-2">Survival Sequence // Active</div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">
                        Squid Protocol
                    </h1>
                </div>
                <div className="flex gap-12">
                    <div className="text-right">
                        <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest block mb-1">Active Operands</span>
                        <span className="text-2xl font-black text-white tabular-nums">{players.filter(p => p.alive).length}<span className="text-slate-800 mx-2">/</span>{players.length}</span>
                    </div>
                    <div className="text-right border-l border-white/10 pl-12">
                        <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest block mb-1">Bounty Accumulation</span>
                        <span className="text-2xl font-black text-[var(--color-primary)] tabular-nums">4,500 <span className="text-[10px] text-slate-500 font-bold">CREDITS</span></span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-20 p-12 max-w-7xl mx-auto">

                {gameState === "LOBBY" && (
                    <div className="text-center py-32 flex flex-col items-center">
                        <div className="w-32 h-32 border border-white/5 rounded-full flex items-center justify-center relative mb-12">
                            <div className="absolute inset-[-8px] border border-[var(--color-primary)]/20 rounded-full animate-ping"></div>
                            <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_15px_var(--color-primary)]"></div>
                        </div>

                        <div className="text-[10px] font-bold tracking-[0.8em] text-[var(--color-primary)] uppercase mb-6 pl-2">Establishing Connection</div>
                        <h2 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase font-[family:var(--font-heading)]">Gathering Subjects</h2>
                        <p className="text-slate-500 text-lg font-light max-w-xl mx-auto leading-relaxed mb-16">
                            456 Subjects required for initialization. Motion detection active. Disruption results in immediate connection termination.
                        </p>

                        <button
                            onClick={() => setGameState("ROUND_1")}
                            className="px-16 py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-white transition-all transform active:scale-95 shadow-2xl"
                            style={{ borderRadius: "2px" }}
                        >
                            Authorize Participation →
                        </button>
                    </div>
                )}

                {gameState === "ROUND_1" && (
                    <div className="animate-in fade-in duration-700">
                        <div className="flex justify-between items-end mb-16">
                            <div>
                                <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4">Phase Code: 01</div>
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)] mb-6">Execution: Binary Search</h2>
                                <div className="w-80 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--color-primary)] transition-all duration-1000" style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="text-8xl font-black text-white tracking-tighter tabular-nums font-[family:var(--font-heading)] opacity-80">
                                {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                            </div>
                        </div>

                        <div className="premium-card p-12 h-[60vh] overflow-y-auto custom-scrollbar" style={{ borderRadius: "2px" }}>
                            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                                {players.map((player) => (
                                    <div key={player.id} className={`p-6 border transition-all duration-500 ${player.alive ? 'border-white/5 bg-white/[0.01]' : 'border-red-500/10 bg-red-500/[0.02] grayscale opacity-30'}`} style={{ borderRadius: "2px" }}>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className={`text-[9px] font-bold font-mono ${player.alive ? 'text-slate-600' : 'text-red-900'}`}>#{player.id < 10 ? `0${player.id}` : player.id}</span>
                                            {!player.alive && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                                        </div>
                                        <div className="text-center">
                                            <div className={`w-8 h-8 mx-auto flex items-center justify-center font-bold text-xs mb-6 ${player.alive ? 'text-white' : 'text-slate-800'}`}>
                                                {player.id}
                                            </div>
                                            <div className="w-full bg-white/[0.03] h-[1px] relative">
                                                <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${player.alive ? 'bg-[var(--color-primary)]/40' : 'bg-red-900/40'}`} style={{ width: `${player.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {gameState === "ELIMINATION" && (
                    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-1000">
                        <div className="text-center max-w-xl">
                            <div className="w-24 h-24 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-12">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <div className="text-[10px] font-bold tracking-[0.8em] text-red-500 uppercase mb-6 pl-2">System Violation</div>
                            <h2 className="text-7xl font-black text-white mb-8 tracking-tighter uppercase font-[family:var(--font-heading)]">Subject Refined</h2>
                            <p className="text-slate-500 text-lg font-light mb-16 leading-relaxed">
                                Computational integrity compromised. Access to current protocol has been permanently revoked.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-16 py-6 border border-white/10 text-white font-bold uppercase tracking-[0.4em] text-[10px] hover:border-white transition-all transform active:scale-95"
                                style={{ borderRadius: "2px" }}
                            >
                                Disconnect Session →
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
