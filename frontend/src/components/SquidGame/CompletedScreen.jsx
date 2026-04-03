import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Home, Star, ChevronRight } from "lucide-react";

const CompletedScreen = ({ tournament, leaderboard }) => {
    const navigate = useNavigate();
    const winner = Array.isArray(leaderboard) ? leaderboard[0] : null;

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Elegant Background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--glass-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--color-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full relative z-10 text-center"
            >
                {/* Trophy Header */}
                <div className="flex justify-center mb-12">
                    <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.1)]">
                        <Trophy size={48} className="text-[var(--color-primary)]" />
                    </div>
                </div>

                <div className="mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-6 block">Tournament Results</span>
                    <h1 className="text-7xl font-black text-[var(--color-text-main)] tracking-tighter uppercase leading-none mb-6">
                        {winner?.username || "Champion"}
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-sm font-black uppercase tracking-widest opacity-40">
                        Winner of {tournament?.name || "Survival Arena"}
                    </p>
                </div>

                {/* Main Stats */}
                <div className="flex justify-center gap-12 mb-16">
                    <div className="text-center">
                        <div className="text-4xl font-black text-[var(--color-primary)] font-mono mb-1">{winner?.score || 0}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Final Score</div>
                    </div>
                    <div className="w-[1px] h-10 bg-white/5" />
                    <div className="text-center">
                        <div className="text-4xl font-black text-white font-mono mb-1">01</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Rank</div>
                    </div>
                </div>

                {/* Final Standings Table */}
                <div className="max-w-xl mx-auto mb-16 bg-[var(--glass-bg)] border border-[var(--glass-border)] p-8 rounded-sm backdrop-blur-md">
                    <div className="flex items-center justify-between mb-8 opacity-30">
                        <div className="flex items-center gap-2">
                            <Star size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Final Standings</span>
                        </div>
                        <span className="text-[9px] font-mono">ChallengX Arena</span>
                    </div>

                    <div className="space-y-3">
                        {Array.isArray(leaderboard) && leaderboard.slice(0, 5).map((entry, i) => (
                            <div 
                                key={i} 
                                className={`flex items-center justify-between p-4 rounded-sm border ${
                                    i === 0 ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5" : "border-white/5 bg-white/5"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-black font-mono ${i === 0 ? "text-[var(--color-primary)]" : "text-white/20"}`}>
                                        #{i + 1}
                                    </span>
                                    <span className={`text-xs font-black uppercase ${i === 0 ? 'text-white' : 'text-white/60'}`}>
                                        {entry.username}
                                    </span>
                                </div>
                                <span className={`text-[11px] font-mono font-bold ${i === 0 ? 'text-[var(--color-primary)]' : 'text-white/20'}`}>
                                    {entry.score} pts
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="px-16 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[var(--color-primary)] transition-all flex items-center justify-center gap-3 mx-auto rounded-sm group"
                >
                    <Home size={14} /> Return to Arena Lobby <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </div>
    );
};

export default CompletedScreen;
