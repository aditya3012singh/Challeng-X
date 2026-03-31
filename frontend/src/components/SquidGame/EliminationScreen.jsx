import { motion } from "framer-motion";
import { XCircle, CheckCircle, TrendingUp, Users, ChevronRight, PlayCircle } from "lucide-react";

const EliminationScreen = ({ roundNumber, eliminated, survived, leaderboard, onContinue, isLastRound, isHost, onSpectate, userId }) => {
    const isUserEliminated = leaderboard.find(e => String(e.userId) === String(userId))?.status === "ELIMINATED";

    return (
        <div className="fixed inset-0 z-[150] bg-[var(--color-bg-dark)] flex items-center justify-center p-6 overflow-y-auto font-sans">
             {/* Simple Background */}
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--glass-border) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--color-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full relative z-10"
            >
                {/* Status Indicator */}
                <div className="flex flex-col items-center text-center mb-16">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border border-white/5 mb-8 ${isUserEliminated ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                        {isUserEliminated ? <XCircle size={40} /> : <CheckCircle size={40} />}
                    </div>
                    
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Round 0{roundNumber} Summary</span>
                        <h2 className="text-6xl font-black text-[var(--color-text-main)] tracking-tight uppercase leading-none">
                            {isUserEliminated ? "Eliminated" : "Phase Complete"}
                        </h2>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/20">The selection process for this round has finalized.</p>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto mb-16">
                    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-8 rounded-sm text-center backdrop-blur-md">
                        <div className="text-4xl font-black text-red-500 mb-2 font-mono">{String(eliminated).padStart(2, '0')}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Eliminated</div>
                    </div>
                    
                    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-8 rounded-sm text-center backdrop-blur-md">
                        <div className="text-4xl font-black text-green-500 mb-2 font-mono">{String(survived).padStart(2, '0')}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Survivors</div>
                    </div>
                </div>

                {/* Leaderboard Section */}
                <div className="max-w-xl mx-auto mb-16 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-sm p-8 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-8 opacity-30">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Standings</span>
                        </div>
                        <Users size={14} />
                    </div>
                    
                    <div className="space-y-3 max-h-[250px] overflow-y-auto px-1 custom-scrollbar">
                        {leaderboard.map((entry, i) => {
                            const isElim = entry.status === "ELIMINATED";
                            const isSelf = String(entry.userId) === String(userId);
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between p-4 rounded-sm border ${
                                        isElim 
                                        ? 'border-red-900/10 bg-red-900/5 opacity-40' 
                                        : isSelf 
                                          ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10' 
                                          : 'border-white/5 bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-white/20">#{i + 1}</span>
                                        <span className={`text-xs font-black uppercase ${isElim ? 'line-through text-white/40' : 'text-white'}`}>
                                            {entry.username} {isSelf && "(You)"}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-mono font-bold ${isElim ? 'text-red-900' : 'text-[var(--color-primary)]'}`}>
                                        {entry.score} pts
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-center">
                    {isHost ? (
                        <button
                            onClick={onContinue}
                            className="bg-[var(--color-primary)] text-black px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-sm hover:brightness-110 transition-all flex items-center gap-3 shadow-[0_15px_40px_rgba(var(--color-primary-rgb),0.2)]"
                        >
                            {isLastRound ? "View Final Results" : "Proceed to Next Round"}
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        !isUserEliminated ? (
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">
                                Awaiting host to continue...
                            </div>
                        ) : (
                            <button
                                onClick={onSpectate}
                                className="px-12 py-5 border border-white/10 text-white/40 hover:bg-white hover:text-black hover:border-transparent text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-3"
                            >
                                <PlayCircle size={16} /> Spectate Survivors
                            </button>
                        )
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default EliminationScreen;
